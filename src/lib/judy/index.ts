import { loadJudyKnowledge } from "@/lib/judy/knowledge";
import {
  buildRemoteMessages,
  callRemoteProvider,
  redactSecrets,
  resolveJudyProviderConfig,
} from "@/lib/judy/providers";
import { retrieveKnowledge, type JudyMatch } from "@/lib/judy/retrieval";
import type { JudyAnswer, JudyHistoryMessage } from "@/lib/judy/types";

/**
 * Judy's entry point. One function, three outcomes, and none of them is a throw:
 *
 *   1. A grounded answer          — from retrieved site content (offline), or
 *                                   from a remote model given that same content.
 *   2. An honest "I don't know"   — no entry matched, or the knowledge base is
 *                                   empty. Never an invented price or policy.
 *   3. An honest "unavailable"    — something broke. Logged server-side.
 *
 * Remote failure degrades to the offline path rather than erroring, so a bad key,
 * a timeout or an outage changes nothing for the customer except that the answer
 * comes from the site's own content and is reported as such.
 */

/** Said when nothing in the knowledge base matches. Contains no invented content. */
export const JUDY_UNKNOWN_REPLY =
  "I don't have that information yet — I only answer from Fashion Feet's own published " +
  "information, and I'd rather say so than guess. Our team can help you directly at /contact.";

/** Said when even the offline path could not produce anything usable. */
export const JUDY_UNAVAILABLE_REPLY =
  "Sorry — Judy is unavailable right now and I don't want to guess at an answer. " +
  "Please try again in a moment, or reach our team at /contact.";

/** Upper bound on a reply, so a misbehaving provider cannot balloon a response. */
const MAX_REPLY_CHARS = 1_500;

/** Config problems are worth logging once, not once per message. */
const loggedConfigReasons = new Set<string>();

function logConfigFallbackOnce(setting: string, reason: string | undefined): void {
  if (!reason) return;
  if (loggedConfigReasons.has(reason)) return;
  loggedConfigReasons.add(reason);
  console.warn(`[judy] falling back to offline mode (JUDY_PROVIDER=${setting || "unset"}): ${reason}`);
}

function clampReply(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_REPLY_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_REPLY_CHARS).trimEnd()}…`;
}

function uniqueLinks(links: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const link of links) {
    if (!link || !link.startsWith("/")) continue;
    if (seen.has(link)) continue;
    seen.add(link);
    result.push(link);
  }
  return result;
}

/** Builds the offline reply strictly out of retrieved entry text. */
export function composeOfflineAnswer(matches: JudyMatch[]): JudyAnswer {
  const entryLinks = uniqueLinks(matches.map((match) => match.entry.link));

  if (matches.length === 0) {
    return {
      reply: JUDY_UNKNOWN_REPLY,
      source: "offline",
      grounded: false,
      links: ["/contact"],
    };
  }

  const body = matches
    .map((match) => `• ${match.entry.title}\n${match.entry.text}`)
    .join("\n\n");

  return {
    reply: [
      "Here's what Fashion Feet's own published information says:",
      "",
      body,
      "",
      "I only answer from this site's own information — if something isn't in it, I'll say so rather than guess. The team is at /contact for anything else.",
    ].join("\n"),
    source: "offline",
    grounded: true,
    links: uniqueLinks([...entryLinks, "/contact"]).slice(0, 3),
  };
}

export interface JudyQuestionInput {
  message: string;
  history?: JudyHistoryMessage[];
  /** Injectable for tests; defaults to the process environment. */
  env?: NodeJS.ProcessEnv;
}

export async function answerJudyQuestion({ message, history = [], env = process.env }: JudyQuestionInput): Promise<JudyAnswer> {
  const config = resolveJudyProviderConfig(env);

  let matches: JudyMatch[] = [];
  let knowledgeBaseSize = 0;

  try {
    const knowledge = await loadJudyKnowledge();
    knowledgeBaseSize = knowledge.entries.length;
    matches = retrieveKnowledge(message, knowledge.entries).matches;
  } catch (error) {
    // loadJudyKnowledge already contains its own failures; this is defence in
    // depth so an unexpected error can still not break the endpoint.
    console.error("[judy] knowledge retrieval failed:", error);
    matches = [];
  }

  if (config.usable) {
    const result = await callRemoteProvider(
      config,
      buildRemoteMessages(
        message,
        matches.map((match) => match.entry),
        history
      )
    );

    if (result.ok) {
      return {
        reply: clampReply(redactSecrets(result.text, [config.apiKey])),
        source: config.source === "offline" ? "offline" : config.source,
        grounded: matches.length > 0,
        links: matches.length > 0 ? uniqueLinks(matches.map((match) => match.entry.link)).slice(0, 3) : ["/contact"],
      };
    }

    // Provider error, timeout, invalid key, outage — all land here. Detail stays
    // in the server log; the customer gets the honest offline behaviour instead.
    console.error(
      `[judy] provider "${config.source}" call failed (${result.reason}${
        result.upstreamStatus ? `, upstream HTTP ${result.upstreamStatus}` : ""
      })${result.upstreamDetail ? `: ${result.upstreamDetail}` : ""}`
    );
  } else {
    logConfigFallbackOnce(config.setting, config.reason);
  }

  if (knowledgeBaseSize === 0) {
    console.warn("[judy] knowledge base is empty — answering honestly with no facts available");
  }

  return composeOfflineAnswer(matches);
}

export { loadJudyKnowledge, resetJudyKnowledgeCache } from "@/lib/judy/knowledge";
export { retrieveKnowledge, tokenize } from "@/lib/judy/retrieval";
export { resolveJudyProviderConfig } from "@/lib/judy/providers";
export * from "@/lib/judy/types";
