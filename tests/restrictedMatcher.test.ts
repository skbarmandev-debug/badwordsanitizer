import test from "node:test";
import assert from "node:assert/strict";
import { createRestrictedMatcher } from "../src/lib/restrictedMatcher.ts";

const rules = ["email", "phone number", "contact", "bank", "bank account", "pay", "message me outside", "a+b"];

test("handles empty input and ordinary text", () => {
  const matcher = createRestrictedMatcher(rules, true);
  assert.deepEqual(matcher(""), []);
  assert.deepEqual(matcher("Hello, how are you?"), []);
});

test("matches case-insensitively and retains original text offsets", () => {
  const matcher = createRestrictedMatcher(rules, true);
  const text = "(EMAIL), phone number; 😀PAY";
  assert.deepEqual(matcher(text), [
    { start: 1, end: 6, word: "EMAIL" },
    { start: 9, end: 21, word: "phone number" },
    { start: 25, end: 28, word: "PAY" }
  ]);
});

test("respects boundary mode, substring mode, and literal custom rules", () => {
  assert.deepEqual(createRestrictedMatcher(["contact", "a+b"], false)("mycontact (a+b)"), [
    { start: 11, end: 14, word: "a+b" }
  ]);
  assert.deepEqual(createRestrictedMatcher(["contact"], true)("mycontact"), [
    { start: 2, end: 9, word: "contact" }
  ]);
});

test("preserves longest-rule-first overlap behavior", () => {
  assert.deepEqual(createRestrictedMatcher(["me", "message me outside"], true)("message me outside"), [
    { start: 0, end: 18, word: "message me outside" }
  ]);
  assert.deepEqual(createRestrictedMatcher(["abc", "bcde"], true)("abcde"), [
    { start: 1, end: 5, word: "bcde" }
  ]);
});

test("handles rapid consecutive edits and clearing without retaining stale ranges", () => {
  const matcher = createRestrictedMatcher(rules, true);
  assert.deepEqual(matcher("email"), [{ start: 0, end: 5, word: "email" }]);
  assert.deepEqual(matcher("safe text"), []);
  assert.deepEqual(matcher("phone number"), [{ start: 0, end: 12, word: "phone number" }]);
  assert.deepEqual(matcher(""), []);
});

test("detects the provided multi-paragraph sample and tolerates large repeated text", () => {
  const sample = `Hi there,\n\nI hope you are having a great day.\n\nAs per your instructions, I have completed the following tasks:\n\n01. I've updated the images you provided.\n\n02. I've revised the wording throughout the website according to your instructions.\n\n03. I've updated the information on every service page.\n\n04. I've created two new pages, MAN & VAN SHEFFIELD and NATIONAL MOVES, as requested.\n\n05. I've updated your con-tact information.\n\n06. I've removed the location icon as instructed.\n\nHere is your website test URL:\nhttps://www.mg-manandvan.co.uk/?rc=test-site\n\nPlease note that regarding the 404 error on your service pages, since this is a test site, it may occasionally occur due to caching issues or temporary technical glitches. If you encounter this issue, please try revisiting the page or performing a hard reload to refresh the page and clear the cached version.\n\nRegarding the images on the individual service pages, I’ve kept placeholder images for now. Once you provide the actual images for the relevant services, I’ll update them accordingly.\n\nPlease review the updates at your convenience and let me know if you have any additional feedback or require further adjustments. I’ll be happy to make the necessary changes to ensure everything meets your expectations.\n\nBest regards,`;
  const matcher = createRestrictedMatcher(rules, true);
  let startedAt = performance.now();
  const sampleMatches = matcher(sample);
  const sampleDurationMs = performance.now() - startedAt;
  assert.deepEqual(sampleMatches.map(({ word }) => word.toLowerCase()), []);

  const denseMatcher = createRestrictedMatcher(["x"], true);
  const denseInput = "x".repeat(100_000);
  startedAt = performance.now();
  const matches = denseMatcher(denseInput);
  const denseDurationMs = performance.now() - startedAt;
  assert.equal(matches.length, denseInput.length);
  assert.equal(matches.at(-1)?.end, denseInput.length);
  console.log(`Matcher benchmark: sample ${sample.length} chars ${sampleDurationMs.toFixed(2)} ms; dense ${denseInput.length} chars / ${matches.length} matches ${denseDurationMs.toFixed(2)} ms.`);
});
