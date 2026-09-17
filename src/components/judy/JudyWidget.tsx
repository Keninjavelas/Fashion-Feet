"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, Loader2, MessageCircleQuestion, Send, ShieldCheck, Sparkles, X } from "lucide-react";

/**
 * Judy's floating launcher and chat panel.
 *
 * Mounted once, in the root layout. Deliberately NOT an overlay: the panel sits
 * at `z-40`, below the existing modals and drawers (`z-50`) and below the search
 * overlay (`z-[60]`/`z-[70]`), so opening the cart or a product quick-view puts
 * those on top rather than fighting Judy for the top layer.
 *
 * The panel is `fixed`, so it never participates in document flow and cannot
 * shift the page when it opens or closes.
 *
 * Two honesty mechanics are visible in the UI, not just in the API:
 *   - a permanent note that answers come only from the site's own information;
 *   - a mode line that says "offline" when nothing was sent to a third party and
 *     "online" when a provider answered. The provider's name, endpoint and model
 *     are never rendered — provider detail stays server-side.
 */

const MAX_QUESTION_LENGTH = 500;
const HISTORY_TURNS = 6;

/**
 * Theme variables are read from the live DOM rather than assumed, because the
 * active theme is applied at runtime (`FestivalProvider` writes `data-theme` on
 * `<html>`), and Judy lives in `<body>` as a sibling of the themed storefront
 * container. Copying the resolved values onto her own root makes her inherit the
 * correct palette under every seasonal theme without depending on where the
 * theme attribute happens to be set. Without this she would render in the
 * default palette while the rest of the page is in Diwali's.
 */
const THEME_VARIABLE_NAMES = [
  "--theme-color-bg",
  "--theme-color-surface",
  "--theme-color-surface-hover",
  "--theme-color-text",
  "--theme-color-text-muted",
  "--theme-color-accent",
  "--theme-color-jewel",
  "--theme-color-border",
  "--theme-color-shadow",
] as const;

type JudyThemeStyle = React.CSSProperties & Record<`--${string}`, string>;

function useLiveThemeVariables(): JudyThemeStyle {
  const [variables, setVariables] = useState<JudyThemeStyle>({});

  useEffect(() => {
    const read = () => {
      const source = document.documentElement.hasAttribute("data-theme")
        ? document.documentElement
        : document.querySelector("[data-theme]") ?? document.documentElement;

      const computed = window.getComputedStyle(source);
      const next: JudyThemeStyle = {};
      for (const name of THEME_VARIABLE_NAMES) {
        const value = computed.getPropertyValue(name).trim();
        if (value) next[name] = value;
      }
      setVariables(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"], subtree: true });

    return () => observer.disconnect();
  }, []);

  return variables;
}

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: string[];
  /** "offline" or a provider id. Drives the mode line; never printed verbatim. */
  source?: string;
  grounded?: boolean;
}

const GREETING: ChatTurn = {
  id: "judy-greeting",
  role: "assistant",
  content:
    "Namaste, I'm Judy — the Fashion Feet assistant. I answer only from this website's own published information, and I'll tell you plainly when I don't know something. What would you like to ask?",
  source: "offline",
  grounded: false,
};

let turnCounter = 0;
function nextTurnId(prefix: string): string {
  turnCounter += 1;
  return `${prefix}-${turnCounter}`;
}

export function JudyWidget() {
  const pathname = usePathname();
  const themeVariables = useLiveThemeVariables();

  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<string>("offline");

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const isAdminArea = pathname?.startsWith("/admin") ?? false;

  const close = useCallback(() => {
    setIsOpen(false);
    // Focus returns to the launcher, so keyboard users are not dropped at the top
    // of the document when the panel closes.
    launcherRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  // Focus moves into the panel when it opens.
  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  // Escape closes the panel even when focus has wandered out of it.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Keep the newest turn in view without ever scrolling the page itself.
  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [turns, isLoading, error, isOpen]);

  const history = useMemo(
    () =>
      turns
        .filter((turn) => turn.id !== GREETING.id)
        .slice(-HISTORY_TURNS)
        .map((turn) => ({ role: turn.role, content: turn.content })),
    [turns]
  );

  const send = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = question.trim();
      if (!text || isLoading) return;

      setQuestion("");
      setError(null);
      setTurns((previous) => [...previous, { id: nextTurnId("user"), role: "user", content: text }]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/judy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(
            response.status === 429
              ? "Judy is getting a lot of questions right now. Please wait a moment and ask again."
              : body?.error ?? "Judy could not answer that just now. Please try again."
          );
          return;
        }

        const data = (await response.json()) as {
          reply?: string;
          source?: string;
          grounded?: boolean;
          links?: string[];
        };

        if (!data?.reply) {
          setError("Judy did not manage to answer that. Please try again in a moment.");
          return;
        }

        setLastSource(data.source ?? "offline");
        setTurns((previous) => [
          ...previous,
          {
            id: nextTurnId("judy"),
            role: "assistant",
            content: data.reply as string,
            links: Array.isArray(data.links) ? data.links.filter((link) => link.startsWith("/")) : [],
            source: data.source ?? "offline",
            grounded: data.grounded ?? false,
          },
        ]);
      } catch {
        setError(
          "Judy can't reach the assistant right now — the connection seems to have dropped. Please try again, or reach the team at /contact."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [history, isLoading, question]
  );

  if (isAdminArea) return null;

  const modeLabel =
    lastSource === "offline"
      ? "Offline mode — answers come only from this site's own information. Nothing is sent to any third party."
      : "Online mode — still grounded in this site's own information.";

  return (
    <div style={themeVariables}>
      {/*
        The launcher stays mounted while the panel is open — it is the toggle, and
        it is also what focus returns to when the panel closes.
      */}
      <button
        ref={launcherRef}
        type="button"
        onClick={isOpen ? close : open}
        aria-label={isOpen ? "Close Judy, the Fashion Feet assistant" : "Open Judy, the Fashion Feet assistant"}
        aria-expanded={isOpen}
        aria-controls="judy-panel"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-[var(--theme-color-jewel)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-xl border border-[var(--theme-color-border)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-color-accent)]"
      >
        <MessageCircleQuestion className="h-5 w-5" aria-hidden="true" />
        <span>{isOpen ? "Close Judy" : "Ask Judy"}</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          id="judy-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Judy, the Fashion Feet assistant"
          aria-describedby="judy-grounding-note"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="fixed bottom-[4.75rem] right-3 z-40 flex max-h-[min(32rem,calc(100vh-7rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] shadow-2xl sm:bottom-[5.25rem] sm:right-6 sm:w-[23rem]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[var(--theme-color-border)] bg-[var(--theme-color-jewel)] p-4 text-white">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-accent)]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Fashion Feet Assistant
              </div>
              <h2 className="font-serif text-lg font-bold leading-tight">Judy</h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/70">
                {lastSource === "offline" ? "Offline mode" : "Online mode"}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close Judy"
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Honest grounding note — always visible */}
          <p
            id="judy-grounding-note"
            className="border-b border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] px-4 py-2 text-[11px] leading-relaxed text-[var(--theme-color-text-muted)]"
          >
            Judy answers only from Fashion Feet&apos;s own published information. If she doesn&apos;t know something, she
            will say so rather than guess — and our team is always at{" "}
            <Link href="/contact" className="font-semibold underline decoration-dotted">
              /contact
            </Link>
            .
          </p>

          {/* Transcript */}
          <div
            ref={messageListRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {turns.map((turn) => (
              <div key={turn.id} className={turn.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    turn.role === "user"
                      ? "inline-block max-w-[85%] whitespace-pre-line rounded-2xl bg-[var(--theme-color-jewel)] px-3 py-2 text-left text-sm text-white"
                      : "inline-block max-w-[92%] whitespace-pre-line rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] px-3 py-2 text-sm"
                  }
                >
                  {turn.content}
                </div>

                {turn.role === "assistant" && !turn.grounded && turn.id !== GREETING.id && turn.links?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {turn.links.map((link) => (
                      <Link
                        key={link}
                        href={link}
                        className="rounded-full border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest hover:border-[var(--theme-color-accent)]"
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[var(--theme-color-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Judy is checking the site&apos;s information…</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Mode / availability line */}
          <p className="flex items-start gap-1.5 border-t border-[var(--theme-color-border)] px-4 py-2 text-[10px] leading-relaxed text-[var(--theme-color-text-muted)]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--theme-color-accent)]" aria-hidden="true" />
            <span>{modeLabel}</span>
          </p>

          {/* Composer */}
          <form
            onSubmit={send}
            className="flex items-center gap-2 border-t border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-3"
          >
            <label htmlFor="judy-question" className="sr-only">
              Ask Judy a question
            </label>
            <input
              ref={inputRef}
              id="judy-question"
              name="judy-question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={MAX_QUESTION_LENGTH}
              autoComplete="off"
              placeholder="Ask about sizing, care or delivery…"
              className="min-w-0 flex-1 rounded-xl border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] px-3 py-2 text-sm text-[var(--theme-color-text)] placeholder:text-[var(--theme-color-text-muted)] focus:border-[var(--theme-color-accent)] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || question.trim().length === 0}
              aria-label="Send your question to Judy"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-color-jewel)] text-white transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JudyWidget;
