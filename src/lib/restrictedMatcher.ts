export interface MatchRange {
  start: number;
  end: number;
  word: string;
}

/** Compile one safe, literal-only matcher for a rule list and reuse it across edits. */
export function createRestrictedMatcher(wordList: string[], graspSubstrings: boolean) {
  const words = wordList
    .map((word, priority) => ({ word: word.trim(), priority }))
    .filter(item => item.word.length > 0)
    .sort((a, b) => b.word.length - a.word.length || a.priority - b.priority);
  if (words.length === 0) return (_text: string): MatchRange[] => [];

  // Every dictionary item is escaped, so custom rules cannot inject regex syntax.
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alternatives = words.map(({ word }) => escape(word)).join("|");
  const priorityByWord = new Map<string, number>();
  words.forEach(({ word }, priority) => {
    const normalized = word.toLowerCase();
    if (!priorityByWord.has(normalized)) priorityByWord.set(normalized, priority);
  });
  const source = graspSubstrings
    ? `(?=(${alternatives}))`
    : `(?<![a-zA-Z0-9])(${alternatives})(?![a-zA-Z0-9])`;
  const regex = new RegExp(source, "gi");

  return (text: string): MatchRange[] => {
    if (!text) return [];
    const matchesByPriority: MatchRange[][] = Array.from({ length: words.length }, () => []);
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const word = match[1];
      if (!word) { regex.lastIndex++; continue; }
      const priority = priorityByWord.get(word.toLowerCase());
      if (priority !== undefined) {
        matchesByPriority[priority].push({ start: match.index, end: match.index + word.length, word: text.slice(match.index, match.index + word.length) });
      }
      // Lookahead matches consume no input; advance one UTF-16 code unit to find overlaps.
      if (match[0].length === 0) regex.lastIndex++;
    }

    // Process rule buckets in longest-first order to preserve the old overlap policy.
    const acceptedByStart = new Map<number, MatchRange>();
    const occupied = new Uint8Array(text.length);
    for (const candidates of matchesByPriority) {
      for (const candidate of candidates) {
        let overlaps = false;
        for (let i = candidate.start; i < candidate.end; i++) {
          if (occupied[i]) { overlaps = true; break; }
        }
        if (overlaps) continue;
        acceptedByStart.set(candidate.start, candidate);
        occupied.fill(1, candidate.start, candidate.end);
      }
    }
    const accepted: MatchRange[] = [];
    for (let index = 0; index < text.length; index++) {
      const candidate = acceptedByStart.get(index);
      if (candidate) accepted.push(candidate);
    }
    return accepted;
  };
}
