import test from "node:test";
import assert from "node:assert/strict";
import { obfuscateText } from "../src/lib/obfuscateText.ts";
import type { MatchRange } from "../src/lib/restrictedMatcher.ts";

function range(text: string, word: string, from = 0): MatchRange {
  const start = text.indexOf(word, from);
  assert.notEqual(start, -1, `Expected ${JSON.stringify(word)} in input`);
  return { start, end: start + word.length, word };
}

test("splits even-length words into equal halves with one hyphen", () => {
  const text = "badwords";
  assert.equal(obfuscateText(text, [range(text, "badwords")]), "badw-ords");
});

test("puts the extra character from an odd-length word in the first half", () => {
  const text = "problematic";
  assert.equal(obfuscateText(text, [range(text, "problematic")]), "proble-matic");
});

test("preserves case, letter order, and all original letters", () => {
  const text = "BaDwOrDs";
  const result = obfuscateText(text, [range(text, "BaDwOrDs")]);
  assert.equal(result, "BaDw-OrDs");
  assert.equal(result.replace("-", ""), text);
  assert.equal((result.match(/-/g) ?? []).length, 1);
});

test("leaves one-character tokens unchanged", () => {
  const text = "x";
  assert.equal(obfuscateText(text, [range(text, "x")]), "x");
});

test("preserves unrelated text and handles multiple detected words", () => {
  const text = "Email me at email or phone number.";
  const matches = [
    { start: 0, end: 5, word: "Email" },
    range(text, "email"),
    range(text, "phone number")
  ];
  assert.equal(obfuscateText(text, matches), "Ema-il me at ema-il or pho-ne num-ber.");
});
