import type { MatchRange } from "./restrictedMatcher";

function obfuscateWordOrPhrase(value: string): string {
  return value.replace(/\S+/g, word => {
    const characters = Array.from(word);
    if (characters.length < 2) return word;

    const splitIndex = Math.ceil(characters.length / 2);
    return `${characters.slice(0, splitIndex).join("")}-${characters.slice(splitIndex).join("")}`;
  });
}

export function obfuscateText(text: string, matches: MatchRange[]): string {
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);
  let result = text;

  for (const match of sortedMatches) {
    const originalValue = text.slice(match.start, match.end);
    const obfuscatedValue = obfuscateWordOrPhrase(originalValue);
    result = result.slice(0, match.start) + obfuscatedValue + result.slice(match.end);
  }

  return result;
}
