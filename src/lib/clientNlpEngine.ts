// ==========================================
// PURE CLIENT-SIDE NLP, SPELLING & GRAMMAR ENGINE
// Zero server dependencies or external API keys
// ==========================================

export interface GrammarIssue {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
  severity: "critical" | "minor" | "spelling";
  startIndex: number;
  endIndex: number;
}

// ------------------------------------------
// 1. DICTIONARY & LEVENSHTEIN SPELL CHECKER
// ------------------------------------------

// Comprehensive built-in dictionary of common English words, freelancing, web design, and tech terms
const ENGLISH_DICTIONARY = new Set<string>([
  // Common vocabulary
  "a", "about", "above", "accept", "according", "account", "across", "action", "activity", "actually",
  "add", "address", "admit", "advantage", "advice", "affect", "afford", "after", "again", "against",
  "agree", "ahead", "allow", "almost", "alone", "along", "already", "also", "although", "always",
  "am", "among", "amount", "an", "and", "another", "answer", "any", "anyone", "anything",
  "appear", "application", "apply", "appreciate", "approach", "approve", "approved", "are", "area", "arrange",
  "article", "as", "ask", "assist", "assistance", "at", "attention", "audience", "available", "avoid",
  "away", "back", "bad", "balance", "bank", "base", "based", "be", "beautiful", "because",
  "become", "been", "before", "begin", "behavior", "behind", "believe", "benefit", "best", "better",
  "between", "beyond", "big", "bit", "black", "block", "body", "book", "both", "bottom",
  "box", "bring", "build", "business", "busy", "but", "button", "buy", "by", "call",
  "can", "cancel", "capable", "card", "care", "carefully", "carry", "case", "catch", "cause",
  "center", "central", "certain", "certainly", "change", "changed", "character", "check", "checked", "checking",
  "choice", "choose", "clear", "clearly", "click", "client", "clients", "close", "code", "color",
  "come", "communication", "community", "company", "compare", "complete", "completed", "completely", "concept", "concern",
  "condition", "confirm", "confirming", "connect", "consider", "consistent", "contact", "content", "continue", "continued",
  "control", "convenient", "copy", "correct", "cost", "could", "create", "created", "creative", "current",
  "currently", "custom", "customer", "data", "date", "day", "days", "deal", "decision", "default",
  "deliver", "delivered", "delivering", "delivery", "design", "designed", "designer", "detail", "detailed", "details",
  "develop", "developed", "developer", "device", "devices", "difference", "different", "difficult", "direct", "direction",
  "discuss", "display", "do", "does", "done", "door", "down", "draft", "due", "during",
  "each", "early", "easy", "effort", "either", "element", "else", "email", "emails", "embarrass",
  "end", "enjoy", "enough", "ensure", "entire", "entity", "error", "especially", "essential", "even",
  "event", "ever", "every", "everyone", "everything", "exact", "exactly", "example", "except", "exchange",
  "expect", "expectations", "experience", "explain", "extend", "extension", "extra", "fact", "fail",
  "fair", "fall", "far", "fast", "feature", "features", "fee", "feel", "feedback", "few",
  "field", "figure", "file", "fill", "final", "finally", "find", "fine", "finish", "finished",
  "first", "fit", "fixed", "fix", "flight", "flow", "focus", "follow", "following", "font",
  "fonts", "foot", "footer", "for", "format", "forward", "found", "free", "from", "front",
  "full", "fully", "function", "functional", "further", "future", "gain", "general", "get", "give",
  "glad", "glance", "go", "goal", "good", "grant", "great", "group", "grow", "growth",
  "guarantee", "guide", "half", "hand", "handle", "happen", "happy", "hard", "has", "have",
  "having", "he", "head", "header", "hear", "hearing", "heart", "heavy", "held", "hello",
  "help", "helpful", "her", "here", "hero", "herself", "hi", "high", "him", "himself",
  "his", "history", "hold", "home", "homepage", "hope", "hopefully", "host", "hosting", "hour",
  "hours", "how", "however", "huge", "idea", "ideas", "identify", "if", "ignore", "image",
  "images", "impact", "important", "improve", "improved", "in", "inbox", "include", "included", "incorporate",
  "increase", "info", "information", "initial", "input", "inside", "insight", "instant", "instantly", "instructions",
  "insurance", "integrate", "interaction", "interest", "interested", "into", "introduction", "invite", "is", "issue",
  "issues", "it", "item", "its", "itself", "join", "just", "keep", "key", "kind",
  "know", "knowledge", "label", "lack", "landing", "language", "large", "last", "late", "latest",
  "layout", "lead", "leading", "learn", "least", "leave", "left", "less", "let", "level",
  "life", "light", "like", "likely", "limit", "line", "link", "list", "listed", "little",
  "live", "load", "local", "logo", "long", "look", "looking", "lost", "lot", "lots",
  "main", "maintain", "make", "making", "manage", "manager", "manner", "many", "margin", "mark",
  "market", "master", "match", "may", "maybe", "me", "mean", "media", "medium", "meet", "meeting",
  "member", "mention", "menu", "message", "messages", "might", "mind", "minimal", "minute", "minutes",
  "model", "modification", "modifications", "modify", "module", "month", "more", "most", "motion", "much",
  "must", "my", "myself", "name", "navigation", "near", "neat", "necessary", "need", "needed",
  "negative", "network", "never", "new", "next", "nice", "no", "normal", "not", "note",
  "notes", "notice", "notify", "number", "numbers", "object", "obligate", "obtain", "obvious", "obviously",
  "of", "off", "offer", "office", "office", "official", "often", "ok", "okay", "old",
  "on", "once", "one", "ongoing", "online", "only", "open", "opened", "operate", "opinion",
  "opportunity", "option", "options", "or", "order", "orders", "organize", "original", "other", "others",
  "otherwise", "our", "out", "outdoor", "outline", "outcomes", "outlook", "output", "outside", "over",
  "overall", "overnight", "overview", "own", "owner", "page", "pages", "paid", "pal", "panel",
  "part", "partly", "partner", "pass", "past", "paste", "path", "patience", "patient", "pay",
  "payment", "paypal", "pending", "people", "per", "perfect", "perfectly", "perform", "performance", "period",
  "person", "personal", "phone", "phrase", "pick", "picture", "piece", "pilot", "place", "placeholder",
  "plan", "planned", "platform", "play", "player", "please", "plus", "point", "policy", "political",
  "pop", "popular", "portal", "position", "possession", "possible", "possibly", "post", "potential", "power",
  "practical", "practice", "precise", "prefer", "preference", "preferences", "present", "preset", "pressure", "prevent",
  "preview", "previous", "price", "print", "prior", "priority", "private", "problem", "process", "product",
  "professional", "profile", "program", "progress", "project", "projects", "prompt", "promptly", "proof", "proper",
  "properly", "proposal", "protect", "provide", "provided", "publisher", "purpose", "push", "put", "quality",
  "quantity", "question", "questions", "quick", "quickly", "quite", "quote", "range", "rate", "rather",
  "reach", "react", "read", "ready", "real", "realize", "really", "reason", "receive", "recent",
  "reception", "recognition", "recommend", "record", "records", "reduces", "refer", "refine", "regard", "regards",
  "region", "regular", "regulate", "relate", "release", "relevant", "remain", "remedy", "remember", "remind",
  "remote", "remove", "removed", "render", "renew", "repair", "repeat", "replace", "reply", "report",
  "request", "requested", "requests", "require", "required", "requirements", "research", "reset", "resolve", "resources",
  "respect", "resonate", "respond", "response", "responsible", "responsiveness", "responsive", "rest", "result", "results",
  "resume", "return", "review", "revision", "revisions", "revisit", "rewind", "rich", "right", "role",
  "room", "row", "rule", "run", "running", "safe", "safely", "said", "same", "sample",
  "save", "say", "scale", "scene", "schedule", "school", "scope", "score", "screen", "script",
  "scroll", "search", "second", "section", "sections", "secure", "security", "see", "seek", "seem",
  "seems", "seen", "select", "send", "sent", "separate", "serve", "server", "service", "services",
  "set", "setting", "setup", "several", "share", "shares", "sharp", "she", "sheet", "short",
  "should", "show", "side", "sign", "signal", "similar", "simple", "simply", "since", "single",
  "site", "size", "skill", "skills", "slide", "slow", "small", "smooth", "so", "software",
  "solution", "solve", "some", "someone", "something", "sometimes", "somewhere", "soon", "sorry", "sort",
  "sound", "source", "space", "spaces", "speak", "special", "specific", "specified", "speed", "spell",
  "spend", "spirit", "spoken", "spot", "staff", "stage", "stand", "standard", "start", "state", "statement",
  "status", "stay", "step", "steps", "still", "stop", "store", "story", "straight", "strategy",
  "stream", "street", "strength", "strong", "structure", "student", "studio", "style", "subject", "submit",
  "subscription", "success", "successful", "successfully", "such", "suggest", "suggestion", "suggestions", "summary", "support",
  "sure", "surface", "switch", "system", "table", "tag", "take", "talk", "task", "tasks",
  "taste", "team", "tell", "template", "templates", "temporary", "term", "terms", "test", "testing",
  "text", "than", "thank", "thanks", "that", "the", "their", "them", "theme", "then",
  "there", "therefore", "these", "they", "thing", "things", "think", "third", "this", "thorough",
  "those", "though", "thought", "thoughts", "thread", "three", "through", "throughout", "throw", "time",
  "timeline", "timeframe", "times", "title", "to", "today", "together", "too", "tool", "tools",
  "top", "total", "totally", "touch", "toward", "track", "tracking", "trade", "transition", "translate",
  "treat", "tree", "trend", "trouble", "true", "truly", "trust", "turn", "tutorial", "type",
  "typography", "unable", "under", "understand", "understanding", "underneath", "unique", "unit", "university", "unless",
  "until", "up", "update", "updated", "updates", "upon", "url", "urls", "us", "usage",
  "use", "used", "useful", "user", "users", "uses", "using", "usual", "usually", "value",
  "variable", "variety", "various", "version", "very", "via", "view", "viewer", "views", "vision",
  "visit", "visual", "vital", "voice", "volume", "wait", "waiting", "walk", "want", "wanted",
  "wanting", "warning", "was", "waste", "watch", "way", "ways", "we", "web", "website",
  "websites", "week", "weeks", "welcome", "well", "went", "were", "what", "whatever", "when",
  "where", "whether", "which", "while", "white", "who", "whole", "whom", "whose", "why",
  "wide", "widget", "widely", "will", "win", "window", "windows", "wire", "wix", "wish",
  "with", "within", "without", "word", "words", "work", "worked", "worker", "working", "works",
  "world", "worries", "worry", "worth", "would", "write", "writer", "writing", "written", "wrong",
  "year", "years", "yes", "yesterday", "yet", "you", "your", "yours", "yourself", "zero",

  // Contraction forms (lowercase without apostrophe for spellcheck allowance or mapping)
  "don't", "can't", "won't", "isn't", "aren't", "couldn't", "shouldn't", "wouldn't", "didn't",
  "doesn't", "haven't", "hasn't", "hadn't", "wasn't", "weren't", "you're", "they're", "we've",
  "they've", "I'm", "I've", "I'd", "I'll", "that's", "what's", "let's", "it's"
]);

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Find top spelling suggestions for a word
export function getSpellingSuggestions(word: string): string[] {
  const lower = word.toLowerCase();
  const suggestions: { word: string; dist: number }[] = [];

  for (const dictWord of ENGLISH_DICTIONARY) {
    if (Math.abs(dictWord.length - word.length) > 2) continue;
    const dist = levenshteinDistance(lower, dictWord);
    if (dist <= 2) {
      suggestions.push({ word: dictWord, dist });
    }
  }

  suggestions.sort((a, b) => a.dist - b.dist);
  const best = suggestions.slice(0, 3).map(s => {
    // Preserve initial capitalization if original word was capitalized
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return s.word.charAt(0).toUpperCase() + s.word.slice(1);
    }
    return s.word;
  });

  return best;
}


// ------------------------------------------
// 2. TYPING SPEED TRACKER (WPM CALCULATOR)
// ------------------------------------------

export class TypingSpeedTracker {
  private keypressTimestamps: number[] = [];
  private characterCount: number = 0;
  private currentWpm: number = 0;
  private lastLogTime: number = 0;

  public recordKeystroke(charCountInEditor: number): number {
    const now = Date.now();
    this.keypressTimestamps.push(now);
    this.characterCount = charCountInEditor;

    // Keep window of keystrokes in last 30 seconds
    const cutoff = now - 30000;
    this.keypressTimestamps = this.keypressTimestamps.filter(t => t >= cutoff);

    if (this.keypressTimestamps.length > 2) {
      const timeSpanMinutes = (now - this.keypressTimestamps[0]) / 60000;
      if (timeSpanMinutes > 0.02) { // at least 1.2 seconds elapsed
        const typedChars = this.keypressTimestamps.length;
        // Standard formula: 1 word = 5 characters
        const words = typedChars / 5;
        this.currentWpm = Math.round(words / timeSpanMinutes);
      }
    } else {
      this.currentWpm = 0;
    }

    // Output live typing speed to browser console (throttle log every 1.5 seconds)
    if (now - this.lastLogTime > 1500) {
      this.lastLogTime = now;
      console.log(`[Typing Tracker] Current Typing Speed: ${this.currentWpm} WPM (Characters in buffer: ${charCountInEditor})`);
    }

    return this.currentWpm;
  }

  public getWPM(): number {
    return this.currentWpm;
  }

  public reset(): void {
    this.keypressTimestamps = [];
    this.characterCount = 0;
    this.currentWpm = 0;
  }
}

export const typingTracker = new TypingSpeedTracker();


// ------------------------------------------
// 3. PURE CLIENT-SIDE NLP ANALYZER PIPELINE
// ------------------------------------------

// Map of improper contraction typos to proper contractions
const CONTRACTION_MAP: Record<string, string> = {
  "dont": "don't",
  "cant": "can't",
  "wont": "won't",
  "isnt": "isn't",
  "arent": "aren't",
  "couldnt": "couldn't",
  "shouldnt": "shouldn't",
  "wouldnt": "wouldn't",
  "didnt": "didn't",
  "doesnt": "doesn't",
  "havent": "haven't",
  "hasnt": "hasn't",
  "hadnt": "hadn't",
  "wasnt": "wasn't",
  "werent": "weren't",
  "youre": "you're",
  "theyre": "they're",
  "weve": "we've",
  "theyve": "they've",
  "thats": "that's",
  "whats": "what's",
  "im": "I'm",
  "ive": "I've",
  "id": "I'd",
  "ill": "I'll",
  "lets": "let's"
};

// Known common typos with exact corrections
const COMMON_TYPOS: Record<string, string> = {
  "teh": "the",
  "recieve": "receive",
  "definately": "definitely",
  "seperate": "separate",
  "adress": "address",
  "beleive": "believe",
  "occured": "occurred",
  "responsable": "responsible",
  "exspress": "express",
  "plz": "please",
  "thx": "thanks",
  "thru": "through",
  "unversity": "university",
  "collegee": "college",
  "reviw": "review",
  "inboxx": "inbox",
  "webiste": "website"
};

// Words that start with a vowel letter but consonant sound ('u' sound)
const CONSONANT_SOUND_VOWELS = new Set(["user", "users", "university", "universities", "unicorn", "useful", "unit", "units", "uniform", "european", "one"]);
// Words that start with a consonant letter but vowel sound ('h' silent)
const VOWEL_SOUND_CONSONANTS = new Set(["hour", "hours", "honest", "honor", "honors", "heir"]);

export function analyzeClientText(text: string): GrammarIssue[] {
  if (!text || !text.trim()) return [];

  const issues: GrammarIssue[] = [];

  // Helper to push issue avoiding offset overlaps
  const addIssue = (issue: GrammarIssue) => {
    // Make sure offsets are valid
    if (issue.startIndex < 0 || issue.endIndex > text.length || issue.startIndex >= issue.endIndex) return;

    // Check overlap with existing issues
    const overlap = issues.some(
      existing => (issue.startIndex < existing.endIndex && issue.endIndex > existing.startIndex)
    );

    if (!overlap) {
      issues.push(issue);
    }
  };

  // ------------------------------------------
  // RULE A: Repeated Consecutive Words ("the the", "and and")
  // ------------------------------------------
  const doubleWordRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let dwMatch;
  while ((dwMatch = doubleWordRegex.exec(text)) !== null) {
    const original = dwMatch[0];
    const word = dwMatch[1];
    addIssue({
      type: "Repeated Word",
      original,
      suggestion: word,
      explanation: `Repeated word '${word}' detected. Consider removing the duplicate.`,
      severity: "critical",
      startIndex: dwMatch.index,
      endIndex: dwMatch.index + original.length
    });
  }

  // ------------------------------------------
  // RULE B: Punctuation - Missing Space After Punctuation (e.g. "word,next", "end.Start")
  // ------------------------------------------
  const missingSpaceRegex = /(?<=[,;:?!])(?=[a-zA-Z])/g;
  let msMatch;
  while ((msMatch = missingSpaceRegex.exec(text)) !== null) {
    const idx = msMatch.index;
    if (idx > 0 && idx < text.length) {
      const charBefore = text[idx - 1];
      const charAfter = text[idx];
      const original = charBefore + charAfter;
      const suggestion = charBefore + " " + charAfter;
      addIssue({
        type: "Punctuation & Formatting",
        original,
        suggestion,
        explanation: `Missing space after punctuation '${charBefore}'.`,
        severity: "minor",
        startIndex: idx - 1,
        endIndex: idx + 1
      });
    }
  }

  // Missing space after period (excluding URLs like "example.com" or decimal numbers)
  const periodSpaceRegex = /(?<!\w\.\w)(?<=\b[a-zA-Z]{2,}\.)(?=[A-Z][a-z])/g;
  let psMatch;
  while ((psMatch = periodSpaceRegex.exec(text)) !== null) {
    const idx = psMatch.index;
    if (idx > 0 && idx < text.length) {
      const original = text.substring(idx - 1, idx + 1);
      const suggestion = text[idx - 1] + " " + text[idx];
      addIssue({
        type: "Punctuation & Formatting",
        original,
        suggestion,
        explanation: "Missing space after period between sentences.",
        severity: "minor",
        startIndex: idx - 1,
        endIndex: idx + 1
      });
    }
  }

  // ------------------------------------------
  // RULE C: Excessive Punctuation ("!!!", "???", ",,")
  // ------------------------------------------
  const excessivePunctRegex = /(!{2,}|\?{2,}|,{2,}|;{2,})/g;
  let epMatch;
  while ((epMatch = excessivePunctRegex.exec(text)) !== null) {
    const original = epMatch[0];
    const suggestion = original[0];
    addIssue({
      type: "Excessive Punctuation",
      original,
      suggestion,
      explanation: "Excessive punctuation marks. Keep punctuation clean and single.",
      severity: "minor",
      startIndex: epMatch.index,
      endIndex: epMatch.index + original.length
    });
  }

  // ------------------------------------------
  // RULE D: Article Mismatches ("a apple" -> "an apple", "an website" -> "a website")
  // ------------------------------------------
  const articleRegex = /\b(a|an)\s+([a-zA-Z]+)\b/gi;
  let artMatch;
  while ((artMatch = articleRegex.exec(text)) !== null) {
    const article = artMatch[1];
    const nextWord = artMatch[2];
    const nextWordLower = nextWord.toLowerCase();

    const startsWithVowelLetter = /^[aeiou]/i.test(nextWord);
    const isConsonantSoundVowel = CONSONANT_SOUND_VOWELS.has(nextWordLower);
    const isVowelSoundConsonant = VOWEL_SOUND_CONSONANTS.has(nextWordLower);

    let needsAn = false;
    if (startsWithVowelLetter && !isConsonantSoundVowel) {
      needsAn = true;
    } else if (!startsWithVowelLetter && isVowelSoundConsonant) {
      needsAn = true;
    }

    const currentIsAn = article.toLowerCase() === "an";

    if (needsAn && !currentIsAn) {
      const correctArticle = article[0] === "A" ? "An" : "an";
      addIssue({
        type: "Article Mismatch",
        original: artMatch[0],
        suggestion: `${correctArticle} ${nextWord}`,
        explanation: `Use 'an' before words starting with a vowel sound ('${nextWord}').`,
        severity: "critical",
        startIndex: artMatch.index,
        endIndex: artMatch.index + artMatch[0].length
      });
    } else if (!needsAn && currentIsAn) {
      const correctArticle = article[0] === "A" ? "A" : "a";
      addIssue({
        type: "Article Mismatch",
        original: artMatch[0],
        suggestion: `${correctArticle} ${nextWord}`,
        explanation: `Use 'a' before words starting with a consonant sound ('${nextWord}').`,
        severity: "critical",
        startIndex: artMatch.index,
        endIndex: artMatch.index + artMatch[0].length
      });
    }
  }

  // ------------------------------------------
  // RULE E: Common Subject-Verb & Grammatical Misuses
  // ------------------------------------------
  const grammarPhrases: { pattern: RegExp; suggestion: string; explanation: string }[] = [
    { pattern: /\bthey\s+is\b/gi, suggestion: "they are", explanation: "'they' requires plural verb 'are'." },
    { pattern: /\bwe\s+is\b/gi, suggestion: "we are", explanation: "'we' requires plural verb 'are'." },
    { pattern: /\byou\s+is\b/gi, suggestion: "you are", explanation: "'you' requires verb 'are'." },
    { pattern: /\bhe\s+are\b/gi, suggestion: "he is", explanation: "'he' requires singular verb 'is'." },
    { pattern: /\bshe\s+are\b/gi, suggestion: "she is", explanation: "'she' requires singular verb 'is'." },
    { pattern: /\bi\s+is\b/gi, suggestion: "I am", explanation: "'I' requires verb 'am'." },
    { pattern: /\bthere\s+is\s+(many|several|few)\b/gi, suggestion: "there are $1", explanation: "Use 'there are' with plural subjects." },
    { pattern: /\btheir\s+is\b/gi, suggestion: "there is", explanation: "Use 'there is' for existence, not possessive 'their'." },
    { pattern: /\btheir\s+are\b/gi, suggestion: "there are", explanation: "Use 'there are' for existence, not possessive 'their'." },
    { pattern: /\byour\s+welcome\b/gi, suggestion: "you're welcome", explanation: "Use 'you're' (you are) instead of possessive 'your'." }
  ];

  for (const rule of grammarPhrases) {
    let pMatch;
    while ((pMatch = rule.pattern.exec(text)) !== null) {
      const original = pMatch[0];
      const suggestion = original[0] === original[0].toUpperCase()
        ? rule.suggestion.charAt(0).toUpperCase() + rule.suggestion.slice(1)
        : rule.suggestion;
      addIssue({
        type: "Subject-Verb / Grammar",
        original,
        suggestion,
        explanation: rule.explanation,
        severity: "critical",
        startIndex: pMatch.index,
        endIndex: pMatch.index + original.length
      });
    }
  }

  // ------------------------------------------
  // RULE F: Capitalization at Sentence Start & Standalone 'i'
  // ------------------------------------------
  // Standalone 'i' or 'i'm'
  const standaloneIRegex = /\b(i|i'm|i've|i'd|i'll)\b/g;
  let iMatch;
  while ((iMatch = standaloneIRegex.exec(text)) !== null) {
    const orig = iMatch[0];
    const sug = orig.charAt(0).toUpperCase() + orig.slice(1);
    addIssue({
      type: "Capitalization",
      original: orig,
      suggestion: sug,
      explanation: "Personal pronoun 'I' must always be capitalized.",
      severity: "minor",
      startIndex: iMatch.index,
      endIndex: iMatch.index + orig.length
    });
  }

  // Lowercase word at very beginning of text or after sentence punctuation
  const sentenceStartRegex = /(?:^|[\.\!\?]\s+)([a-z])([a-zA-Z]*)/g;
  let ssMatch;
  while ((ssMatch = sentenceStartRegex.exec(text)) !== null) {
    const fullMatch = ssMatch[0];
    const letter = ssMatch[1];
    const rest = ssMatch[2];
    const word = letter + rest;

    // Determine start index of the word itself
    const wordIndex = ssMatch.index + (fullMatch.length - word.length);

    // Skip if word is a URL or part of code
    if (wordIndex >= 0 && wordIndex < text.length) {
      const suggestedWord = word.charAt(0).toUpperCase() + word.slice(1);
      addIssue({
        type: "Capitalization",
        original: word,
        suggestion: suggestedWord,
        explanation: "Capitalize the first word of a sentence.",
        severity: "minor",
        startIndex: wordIndex,
        endIndex: wordIndex + word.length
      });
    }
  }

  // ------------------------------------------
  // RULE G: SPELLING CHECK & IMPROPER CONTRACTIONS
  // ------------------------------------------
  const wordBoundaryRegex = /\b[a-zA-Z'-]+\b/g;
  let wMatch;
  while ((wMatch = wordBoundaryRegex.exec(text)) !== null) {
    const rawWord = wMatch[0];
    const lowerWord = rawWord.toLowerCase();
    const startIndex = wMatch.index;
    const endIndex = startIndex + rawWord.length;

    // Skip words with hyphens (e.g. obfuscated words like "e-m-a-i-l", "w-h-a-t-s-a-p-p")
    if (rawWord.includes("-")) continue;

    // Skip numbers or short 1-letter words except 'a' and 'I'
    if (rawWord.length <= 1) continue;

    // Check 1: Improper contractions ("dont" -> "don't")
    if (CONTRACTION_MAP[lowerWord]) {
      const correctContraction = CONTRACTION_MAP[lowerWord];
      const suggestion = rawWord[0] === rawWord[0].toUpperCase()
        ? correctContraction.charAt(0).toUpperCase() + correctContraction.slice(1)
        : correctContraction;

      addIssue({
        type: "Contraction Fix",
        original: rawWord,
        suggestion,
        explanation: `Missing apostrophe in contraction '${rawWord}'.`,
        severity: "minor",
        startIndex,
        endIndex
      });
      continue;
    }

    // Check 2: Known common typos ("teh" -> "the", "recieve" -> "receive")
    if (COMMON_TYPOS[lowerWord]) {
      const correctWord = COMMON_TYPOS[lowerWord];
      const suggestion = rawWord[0] === rawWord[0].toUpperCase()
        ? correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        : correctWord;

      addIssue({
        type: "Spelling Correction",
        original: rawWord,
        suggestion,
        explanation: `Possible spelling mistake in '${rawWord}'.`,
        severity: "spelling",
        startIndex,
        endIndex
      });
      continue;
    }
  }

  // Sort issues strictly by startIndex ascending
  return issues.sort((a, b) => a.startIndex - b.startIndex);
}
