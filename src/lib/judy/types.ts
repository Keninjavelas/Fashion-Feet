/**
 * Shared types for Judy, the Fashion Feet storefront assistant.
 *
 * Judy is provider-agnostic: she has a deterministic offline mode that answers
 * from the site's own published content, and optional remote modes that send the
 * same content to an OpenAI-compatible chat-completions endpoint. Nothing in
 * these types carries provider credentials — see `providers.ts`.
 */

/**
 * The provider Judy actually answered with. `offline` means "no third party was
 * contacted": either because offline is the configured mode, or because a remote
 * provider was selected but could not be used (missing key/model, or the call
 * failed). The client is told which of the two happened so the UI can be honest
 * about the current mode — the distinction never leaks a credential.
 */
export type JudyAnswerSource = "offline" | "groq" | "gemini" | "openai";

/** Providers an operator may select with `JUDY_PROVIDER`. */
export const JUDY_REMOTE_PROVIDERS = ["groq", "gemini", "openai"] as const;
export type JudyRemoteProvider = (typeof JUDY_REMOTE_PROVIDERS)[number];

/** Every accepted value of `JUDY_PROVIDER`. Anything else degrades to `offline`. */
export type JudyProviderSetting = "offline" | JudyRemoteProvider;

/**
 * Where one knowledge entry came from. Used for logging and for keeping the
 * grounding honest — a reply only ever quotes fields listed in the entry.
 */
export type JudyKnowledgeSource =
  | "faq"
  | "product"
  | "collection"
  | "store"
  | "homepage"
  | "company";

/**
 * One retrievable fact, built ONLY from fields that are already public on the
 * website or on the read-only `/api/v1` surface (see `publicSerializers.ts`).
 *
 * `text` is the answer body Judy is allowed to quote verbatim. She never
 * generates a price, policy, stock level, delivery time, material or store
 * location — in offline mode the reply is assembled from `text` alone.
 */
export interface JudyKnowledgeEntry {
  /** Stable internal id, e.g. `faq:cuid`. Never shown as a credential-bearing claim. */
  id: string;
  source: JudyKnowledgeSource;
  /** Short human label for the entry, e.g. the FAQ question or the product title. */
  title: string;
  /** Public body text. */
  text: string;
  /** Extra retrieval terms derived from the same public fields. */
  keywords: string[];
  /** Optional in-site path this entry refers to, e.g. `/faq`. */
  link?: string;
}

export interface JudyKnowledgeBase {
  entries: JudyKnowledgeEntry[];
  /** Counts per source, used for server-side logs and the honest "what do I know" path. */
  counts: Record<JudyKnowledgeSource, number>;
  /** ISO timestamp of the last successful load. */
  loadedAt: string;
}

export interface JudyHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JudyAnswer {
  reply: string;
  source: JudyAnswerSource;
  /**
   * True only when the reply was assembled from (or generated strictly from)
   * retrieved knowledge entries. False means "Judy said she does not know".
   */
  grounded: boolean;
  /** In-site links the UI may render (e.g. `/contact`). */
  links: string[];
}
