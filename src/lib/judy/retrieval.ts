import type { JudyKnowledgeEntry } from "@/lib/judy/types";

/**
 * Deterministic keyword retrieval for Judy's offline mode.
 *
 * There is no model here and no randomness: the same question always scores the
 * same entries in the same order, which is what makes offline mode reproducible
 * and testable. The only thing retrieved entries are ever used for is to be
 * quoted back verbatim (offline) or handed to a remote model as context.
 *
 * The scoring is deliberately conservative. A query only counts as "answered"
 * when it matches a *strong* field (an entry title or keyword, i.e. the entry's
 * actual subject) and clears a minimum score. A query that merely shares a word
 * with some entry's body text produces no answer at all — which is the desired
 * outcome, because "no answer" routes to the honest "I don't have that
 * information yet" reply instead of a confidently wrong one.
 */

const STOPWORDS = new Set([
  "a", "about", "after", "all", "also", "am", "an", "and", "any", "are", "as", "at", "be", "been",
  "before", "being", "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing",
  "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her",
  "here", "hers", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "just", "me",
  "more", "most", "my", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "our", "out", "over", "own", "please", "same", "she", "should", "so", "some", "such", "than",
  "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through",
  "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours",
]);

/** Weight of a match on an entry's title or keywords — its actual subject. */
const STRONG_WEIGHT = 3;

/** Weight of a match anywhere in the entry's body text. */
const WEAK_WEIGHT = 1;

/**
 * Minimum total score before Judy will treat a query as answered. One strong
 * (title/keyword) match is enough; a handful of body-text coincidences is not.
 */
const MIN_SCORE = STRONG_WEIGHT;

/** Bonus for an exact phrase hit, which usually means the entry is the subject. */
const PHRASE_BONUS = 4;

const MAX_MATCHES = 3;

export interface JudyMatch {
  entry: JudyKnowledgeEntry;
  score: number;
  matchedTerms: string[];
  /** Highest-weight field a query term hit: >= STRONG_WEIGHT means title/keyword. */
  strongestWeight: number;
}

export interface JudyRetrievalResult {
  matches: JudyMatch[];
  /** True when at least one entry is relevant enough to answer from. */
  confident: boolean;
  /** True when the knowledge base itself holds no entries at all. */
  knowledgeBaseEmpty: boolean;
}

/**
 * Lowercases and strips punctuation. Unicode ranges are kept for Latin
 * extensions so accented brand or city names survive; anything else becomes a
 * separator. (No `\p{...}` escapes: the project targets ES2017.)
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .trim();
}

/** Minimal suffix stripping so "sizes"/"size" and "juttis"/"jutti" line up. */
export function stem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses") || token.endsWith("shes") || token.endsWith("ches")) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
  return token;
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(stem)
    .filter((token) => token.length > 1);
}

interface IndexedEntry {
  entry: JudyKnowledgeEntry;
  weights: Map<string, number>;
  haystack: string;
}

function indexEntry(entry: JudyKnowledgeEntry): IndexedEntry {
  const weights = new Map<string, number>();

  const add = (text: string, weight: number) => {
    for (const token of tokenize(text)) {
      weights.set(token, Math.max(weights.get(token) ?? 0, weight));
    }
  };

  add(entry.title, STRONG_WEIGHT);
  for (const keyword of entry.keywords) add(keyword, STRONG_WEIGHT);
  add(entry.text, WEAK_WEIGHT);

  return {
    entry,
    weights,
    haystack: normalizeText(`${entry.title} ${entry.keywords.join(" ")} ${entry.text}`),
  };
}

function scoreIndexed(queryTokens: string[], phrase: string, indexed: IndexedEntry): JudyMatch | null {
  let score = 0;
  let strongestWeight = 0;
  const matchedTerms: string[] = [];

  for (const token of new Set(queryTokens)) {
    const exact = indexed.weights.get(token);
    if (exact) {
      score += exact;
      strongestWeight = Math.max(strongestWeight, exact);
      matchedTerms.push(token);
      continue;
    }

    // Prefix tolerance covers "deliver"/"delivery" style variations without a
    // full stemmer. Only for reasonably long terms, or "art" would match
    // "artisan" in every entry.
    if (token.length >= 4) {
      for (const [candidate, weight] of indexed.weights) {
        if (candidate.length >= 4 && (candidate.startsWith(token) || token.startsWith(candidate))) {
          score += weight * 0.5;
          strongestWeight = Math.max(strongestWeight, weight);
          matchedTerms.push(token);
          break;
        }
      }
    }
  }

  if (phrase.length >= 6 && indexed.haystack.includes(phrase)) {
    score += PHRASE_BONUS;
  }

  if (matchedTerms.length === 0) return null;
  return { entry: indexed.entry, score, matchedTerms, strongestWeight };
}

/**
 * Returns the entries relevant to `message`, best first. Entries that only match
 * weakly are dropped; when nothing is relevant the result is empty and
 * `confident` is false, which is the caller's cue to answer honestly instead.
 */
export function retrieveKnowledge(message: string, entries: JudyKnowledgeEntry[]): JudyRetrievalResult {
  const knowledgeBaseEmpty = entries.length === 0;
  if (knowledgeBaseEmpty) {
    return { matches: [], confident: false, knowledgeBaseEmpty };
  }

  const queryTokens = tokenize(message);
  const phrase = normalizeText(message);

  if (queryTokens.length === 0) {
    return { matches: [], confident: false, knowledgeBaseEmpty };
  }

  const matches = entries
    .map((entry) => scoreIndexed(queryTokens, phrase, indexEntry(entry)))
    .filter((match): match is JudyMatch => match !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Stable, deterministic tie-break so identical scores never reorder between
      // runs (or between the offline reply and the remote grounding context).
      return a.entry.id.localeCompare(b.entry.id);
    });

  const best = matches[0];
  const confident = !!best && best.score >= MIN_SCORE && best.strongestWeight >= STRONG_WEIGHT;

  return {
    matches: confident ? matches.slice(0, MAX_MATCHES) : [],
    confident,
    knowledgeBaseEmpty,
  };
}
