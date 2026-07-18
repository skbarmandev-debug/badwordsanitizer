import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw, 
  Plus, 
  Trash2, 
  HelpCircle, 
  X, 
  Sun, 
  Moon, 
  RefreshCw, 
  Undo, 
  Redo, 
  FileText, 
  Save, 
  ChevronRight, 
  CheckSquare, 
  AlertCircle,
  Menu,
  ChevronDown,
  Folder,
  FolderOpen,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==========================================
// DEFAULT RESTRICTED WORD LIST (FIVERR RED-FLAGS)
// ==========================================
const DEFAULT_RESTRICTED_WORDS = [
  "email", "gmail", "yahoo", "skype", "whatsapp", "telegram", "viber", "wechat", "discord",
  "facebook", "instagram", "linkedin", "twitter", "phone number", "mobile number", "contact number",
  "zoom", "google meet", "call me", "text me", "message me outside",
  "pay", "payment", "paypal", "payoneer", "wise", "stripe", "cashapp",
  "bank", "bank account", "bank transfer", "western union",
  "crypto", "bitcoin", "usdt", "binance", "direct pay", "pay outside", "invoice",
  "5 star", "five star", "review", "good review", "positive review", "feedback", "good feedback",
  "rating", "rate my work", "leave a review",
  "homework", "assignment", "thesis", "dissertation", "exam", "quiz", "test",
  "university", "college", "school project", "student",
  "hack", "hacking", "cracking", "password cracking",
  "spam", "bot", "malware", "virus", "fake", "fake followers", "fake reviews", "fake likes",
  "phishing", "deepfake", "scam",
  "contact", "cancel the order", "scammer", "free", "work", "cancellation", "tip me", "report you", "buy", "fiverr", "account", "sell account", "exchange"
];

// ==========================================
// STARTER TEMPLATES (MIGRATED AND CATEGORIZED)
// ==========================================
interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "default-first-update",
    name: "Default",
    category: "First Update",
    content: "[PLACEHOLDER: Write your First Update message here. Replace this text with your real template.]"
  },
  {
    id: "default-follow-up-first",
    name: "Default",
    category: "Follow-up After First Update",
    content: "[PLACEHOLDER: Write your Follow-up After First Update message here. Replace this text with your real template.]"
  },
  {
    id: "default-follow-up-mod",
    name: "Default",
    category: "Follow-up After Modification",
    content: "[PLACEHOLDER: Write your Follow-up After Modification message here. Replace this text with your real template.]"
  },
  {
    id: "default-delivery",
    name: "Default",
    category: "Delivery Message",
    content: "[PLACEHOLDER: Write your Delivery Message here. Replace this text with your real template.]"
  },
  {
    id: "default-delivery-extend",
    name: "Default",
    category: "Delivery Time Extend Message",
    content: "[PLACEHOLDER: Write your Delivery Time Extend Message here. Replace this text with your real template.]"
  },
  {
    id: "default-inbox",
    name: "Default",
    category: "Inbox Message",
    content: "[PLACEHOLDER: Write your Inbox Message here. Replace this text with your real template.]"
  },
  {
    id: "default-inbox-no-mod",
    name: "Default",
    category: "Inbox Message Without Modification",
    content: "[PLACEHOLDER: Write your Inbox Message Without Modification here. Replace this text with your real template.]"
  }
];

// ==========================================
// HELPER TYPES & FUNCTIONS
// ==========================================
interface MatchRange {
  start: number;
  end: number;
  word: string;
}

interface GrammarIssue {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
  severity: "critical" | "minor" | "spelling";
  startIndex: number;
  endIndex: number;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

// Escapes regex characters
function escapeRegExp(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Case-insensitively scan text for restricted phrases/words
// Matches are non-overlapping, prioritizing longer terms (e.g. "message me outside" before "message")
// If graspSubstrings is enabled, detects substrings inside words (e.g. "mywhatsapp" matches "whatsapp")
function findMatches(text: string, wordList: string[], graspSubstrings: boolean = true): MatchRange[] {
  if (!text) return [];
  const matches: MatchRange[] = [];
  const occupied = new Array(text.length).fill(false);

  // Sort word list by length descending to process longest phrases first
  const sortedWords = [...wordList]
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const escaped = escapeRegExp(word);
    // If graspSubstrings is true, match anywhere in the string. 
    // If false, require a non-alphanumeric boundary on both sides of the word.
    const regex = graspSubstrings
      ? new RegExp(escaped, 'gi')
      : new RegExp(`(?<=^|[^a-zA-Z0-9])${escaped}(?=$|[^a-zA-Z0-9])`, 'gi');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      // Ensure no overlap with previously matched longer phrases
      let hasOverlap = false;
      for (let i = start; i < end; i++) {
        if (occupied[i]) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap) {
        for (let i = start; i < end; i++) {
          occupied[i] = true;
        }
        matches.push({
          start,
          end,
          word: match[0]
        });
      }
    }
  }

  // Sort by start index ascending for chronological text parsing
  return matches.sort((a, b) => a.start - b.start);
}

// Safely escape raw string to HTML tags
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Highlight restricted match segments and apply grammar wavy underlines
function renderDecoratedHtml(text: string, restrictedMatches: MatchRange[], grammarIssues: GrammarIssue[]): string {
  if (text.length === 0) return "";
  
  const styles: {
    char: string;
    restricted: boolean;
    grammar: GrammarIssue | null;
  }[] = Array.from({ length: text.length }, (_, i) => ({
    char: text[i],
    restricted: false,
    grammar: null,
  }));

  // Apply restricted matches
  for (const m of restrictedMatches) {
    for (let i = m.start; i < m.end; i++) {
      if (i >= 0 && i < styles.length) {
        styles[i].restricted = true;
      }
    }
  }

  // Apply grammar issues (only those still valid)
  for (const g of grammarIssues) {
    if (g.startIndex >= 0 && g.endIndex <= text.length && g.startIndex < g.endIndex) {
      if (text.slice(g.startIndex, g.endIndex) === g.original) {
        for (let i = g.startIndex; i < g.endIndex; i++) {
          styles[i].grammar = g;
        }
      }
    }
  }

  let html = "";
  let i = 0;
  while (i < styles.length) {
    const start = i;
    const isRestricted = styles[start].restricted;
    const grammarIssue = styles[start].grammar;
    
    while (
      i < styles.length && 
      styles[i].restricted === isRestricted && 
      styles[i].grammar === grammarIssue
    ) {
      i++;
    }
    
    const segmentText = text.slice(start, i);
    let escaped = escapeHtml(segmentText);
    
    if (isRestricted || grammarIssue) {
      let classes = "";
      let stylesAttr = "";
      
      if (isRestricted) {
        classes += " bg-[rgba(240,136,62,0.18)] text-[#f0883e] font-mono font-medium px-0.5 rounded-[3px] border-b border-[#f0883e]/80";
      }
      
      if (grammarIssue) {
        let color = "#dc2626"; // red for critical
        if (grammarIssue.severity === "minor") color = "#d97706"; // amber for minor
        else if (grammarIssue.severity === "spelling") color = "#2563eb"; // blue for spelling
        
        stylesAttr += `text-decoration: underline wavy ${color}; text-decoration-skip-ink: none;`;
        classes += " cursor-pointer";
      }
      
      html += `<span class="${classes.trim()}" style="${stylesAttr}" ${isRestricted ? 'data-restricted="true"' : ''} ${grammarIssue ? `data-grammar-id="${grammarIssue.startIndex}"` : ''}>${escaped}</span>`;
    } else {
      html += escaped;
    }
  }
  
  return html;
}

// Insert "-" between every single letter of each word in a string, preserving spaces
function obfuscateWordOrPhrase(wordOrPhrase: string): string {
  return wordOrPhrase
    .split(/\s+/)
    .map(word => word.split("").join("-"))
    .join(" ");
}

// Replaces all restricted words from right to left
function obfuscateText(text: string, matches: MatchRange[]): string {
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);
  let newText = text;
  
  for (const match of sortedMatches) {
    const originalValue = text.slice(match.start, match.end);
    const obfuscatedValue = obfuscateWordOrPhrase(originalValue);
    newText = newText.slice(0, match.start) + obfuscatedValue + newText.slice(match.end);
  }
  
  return newText;
}

// ==========================================
// CARET SELECTION STORAGE & RESTORATION
// ==========================================
function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  let caretOffset = 0;
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}

function setCaretPosition(element: HTMLElement, offset: number) {
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;

  let currentOffset = 0;
  let found = false;

  function traverseNodes(node: Node) {
    if (found) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length || 0;
      if (currentOffset + len >= offset) {
        range.setStart(node, offset - currentOffset);
        range.setEnd(node, offset - currentOffset);
        found = true;
      } else {
        currentOffset += len;
      }
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverseNodes(node.childNodes[i]);
        if (found) break;
      }
    }
  }

  traverseNodes(element);
  if (!found) {
    range.selectNodeContents(element);
    range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

// ==========================================
// APP COMPONENT
// ==========================================
export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("safetext_theme");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  // Main text state
  const [text, setText] = useState<string>("");
  const [matchedRanges, setMatchedRanges] = useState<MatchRange[]>([]);
  const [obfuscatedFeedback, setObfuscatedFeedback] = useState<string | null>(null);
  
  // Restricted words state
  const [restrictedWords, setRestrictedWords] = useState<string[]>(() => {
    const saved = localStorage.getItem("safetext_restricted_words");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Merge with default list so new default words get included automatically
          return Array.from(new Set([...parsed, ...DEFAULT_RESTRICTED_WORDS]));
        }
      } catch {
        return DEFAULT_RESTRICTED_WORDS;
      }
    }
    return DEFAULT_RESTRICTED_WORDS;
  });

  // Substring matching feature state (defaults to true)
  const [graspSubstrings, setGraspSubstrings] = useState<boolean>(() => {
    const saved = localStorage.getItem("safetext_grasp_substrings");
    return saved !== "false";
  });

  // Filter restricted words
  const [wordFilter, setWordFilter] = useState("");
  const [newWordInput, setNewWordInput] = useState("");

  const filteredWords = restrictedWords.filter(w =>
    w.toLowerCase().includes(wordFilter.trim().toLowerCase())
  );

  // Templates state (Enhanced with migration safety)
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem("safetext_templates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].category !== undefined) {
          return parsed;
        }
      } catch {
        return DEFAULT_TEMPLATES;
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "First Update": true,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [pendingTemplateToLoad, setPendingTemplateToLoad] = useState<Template | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<'edit' | 'create' | 'save_current'>('create');
  const [templateModalData, setTemplateModalData] = useState<{
    id?: string;
    name: string;
    category: string;
    content: string;
  }>({ name: "", category: "First Update", content: "" });
  const [saveCurrentSubMode, setSaveCurrentSubMode] = useState<'new' | 'overwrite'>('new');
  const [overwriteTargetId, setOverwriteTargetId] = useState<string>("");

  // Undo/Redo history states
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastSavedTextRef = useRef<string>("");
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Grammar suggestions
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarIssue[]>([]);
  const [isGrammarChecking, setIsGrammarChecking] = useState(false);
  const [grammarMode, setGrammarMode] = useState<"fast" | "accurate">("fast");
  const [grammarErrorBanner, setGrammarErrorBanner] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"restricted" | "grammar">("restricted");

  // System alerts / toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync theme to root class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("safetext_theme", theme);
  }, [theme]);

  // Sync restricted words list
  useEffect(() => {
    localStorage.setItem("safetext_restricted_words", JSON.stringify(restrictedWords));
  }, [restrictedWords]);

  // Sync graspSubstrings state
  useEffect(() => {
    localStorage.setItem("safetext_grasp_substrings", String(graspSubstrings));
  }, [graspSubstrings]);

  // Sync templates
  useEffect(() => {
    localStorage.setItem("safetext_templates", JSON.stringify(templates));
  }, [templates]);

  // Add toast helper
  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // ==========================================
  // DEBOUNCED LIVE SCANNING & HIGHLIGHTS
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      const matches = findMatches(text, restrictedWords, graspSubstrings);
      setMatchedRanges(matches);

      const el = editorRef.current;
      if (el) {
        const decoratedHtml = renderDecoratedHtml(text, matches, grammarSuggestions);
        if (el.innerHTML !== decoratedHtml) {
          const caretPos = getCaretCharacterOffsetWithin(el);
          el.innerHTML = decoratedHtml;
          setCaretPosition(el, caretPos);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [text, restrictedWords, graspSubstrings, grammarSuggestions]);

  // Clear obfuscation banner if text changes
  useEffect(() => {
    if (obfuscatedFeedback && text.indexOf("-") === -1) {
      setObfuscatedFeedback(null);
    }
  }, [text, obfuscatedFeedback]);

  // ==========================================
  // INPUT & SHORTCUT HANDLING
  // ==========================================
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const rawText = e.currentTarget.innerText;
    setText(rawText);
    pushToHistory(rawText, false);
  };

  // Plain-text paste interceptor
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rawText = e.clipboardData.getData("text/plain");
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    const textNode = document.createTextNode(rawText);
    range.insertNode(textNode);
    
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (editorRef.current) {
      const updatedText = editorRef.current.innerText;
      setText(updatedText);
      pushToHistory(updatedText, true);
    }
  };

  // History management
  const pushToHistory = (newText: string, force = false) => {
    if (newText === lastSavedTextRef.current) return;
    
    if (force) {
      saveHistoryState(newText);
    } else {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      historyTimeoutRef.current = setTimeout(() => {
        saveHistoryState(newText);
      }, 700);
    }
  };

  const saveHistoryState = (newText: string) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newText);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    lastSavedTextRef.current = newText;
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      const targetText = history[targetIndex];
      setText(targetText);
      lastSavedTextRef.current = targetText;
      updateEditorContentDirectly(targetText);
    } else {
      addToast("Nothing to undo", "info");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      const targetText = history[targetIndex];
      setText(targetText);
      lastSavedTextRef.current = targetText;
      updateEditorContentDirectly(targetText);
    } else {
      addToast("Nothing to redo", "info");
    }
  };

  const updateEditorContentDirectly = (rawText: string) => {
    const el = editorRef.current;
    if (el) {
      const matches = findMatches(rawText, restrictedWords, graspSubstrings);
      el.innerHTML = renderDecoratedHtml(rawText, matches, grammarSuggestions);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
    const isRedo = 
      ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'y') ||
      ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z');

    if (isUndo) {
      e.preventDefault();
      handleUndo();
    } else if (isRedo) {
      e.preventDefault();
      handleRedo();
    }
  };

  // ==========================================
  // BUTTON ACTIONS
  // ==========================================
  const triggerManualDetect = () => {
    const matches = findMatches(text, restrictedWords, graspSubstrings);
    setMatchedRanges(matches);
    const el = editorRef.current;
    if (el) {
      el.innerHTML = renderDecoratedHtml(text, matches, grammarSuggestions);
    }
    if (matches.length > 0) {
      addToast(`Detected ${matches.length} restricted word(s)`, "info");
    } else {
      addToast("No restricted words detected!", "success");
    }
  };

  const triggerObfuscation = () => {
    const matches = findMatches(text, restrictedWords, graspSubstrings);
    if (matches.length === 0) {
      addToast("No words to obfuscate.", "info");
      return;
    }
    const obText = obfuscateText(text, matches);
    setText(obText);
    pushToHistory(obText, true);
    setObfuscatedFeedback(`✅ ${matches.length} word(s) obfuscated`);
    addToast("Restricted terms hyphenated successfully!", "success");

    // Force editor display reset
    const el = editorRef.current;
    if (el) {
      el.innerHTML = escapeHtml(obText);
    }
  };

  const handleCopy = () => {
    if (!text) {
      addToast("Nothing to copy!", "error");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      addToast("Copied safely to clipboard!", "success");
    }).catch(() => {
      addToast("Clipboard access failed.", "error");
    });
  };

  // ==========================================
  // SIDEBAR WORD MANAGEMENT
  // ==========================================
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = newWordInput.trim().toLowerCase();
    if (!cleanWord) return;

    if (restrictedWords.includes(cleanWord)) {
      addToast(`"${cleanWord}" is already on the restricted list.`, "info");
      setNewWordInput("");
      return;
    }

    setRestrictedWords(prev => [...prev, cleanWord]);
    addToast(`Added "${cleanWord}" to restricted list`, "success");
    setNewWordInput("");
  };

  const handleRemoveWord = (word: string) => {
    setRestrictedWords(prev => prev.filter(w => w !== word));
    addToast(`Removed "${word}"`, "info");
  };

  const handleResetWords = () => {
    if (window.confirm("Are you sure you want to restore the default restricted words list?")) {
      setRestrictedWords(DEFAULT_RESTRICTED_WORDS);
      addToast("Restricted words restored to default", "success");
    }
  };

  // ==========================================
  // TEMPLATE MANAGEMENT (ENHANCED)
  // ==========================================
  const FIXED_CATEGORIES = [
    "First Update",
    "Follow-up After First Update",
    "Follow-up After Modification",
    "Delivery Message",
    "Delivery Time Extend Message",
    "Inbox Message",
    "Inbox Message Without Modification"
  ];

  const handleSelectTemplateTrigger = (t: Template) => {
    if (text.trim().length > 0) {
      setPendingTemplateToLoad(t);
    } else {
      setText(t.content);
      pushToHistory(t.content, true);
      updateEditorContentDirectly(t.content);
      addToast(`Loaded template: ${t.name}`, "success");
    }
  };

  const handleDuplicateTemplate = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: Template = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      name: `${template.name} (Copy)`,
      category: template.category,
      content: template.content
    };
    setTemplates(prev => [...prev, copy]);
    addToast(`Duplicated "${template.name}"`, "success");
  };

  const handleRemoveTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (deleteConfirmId === id) {
      setDeleteConfirmId(null);
    }
    addToast("Template deleted", "info");
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCreateTemplateTrigger = (category: string) => {
    setTemplateModalMode('create');
    setTemplateModalData({
      name: "",
      category: category,
      content: ""
    });
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplateTrigger = (t: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateModalMode('edit');
    setTemplateModalData({
      id: t.id,
      name: t.name,
      category: t.category,
      content: t.content
    });
    setIsTemplateModalOpen(true);
  };

  const handleSaveCurrentAsTemplateTrigger = () => {
    if (!text.trim()) {
      addToast("Cannot save an empty message as a template", "error");
      return;
    }
    setTemplateModalMode('save_current');
    setSaveCurrentSubMode('new');
    setOverwriteTargetId(templates[0]?.id || "");
    setTemplateModalData({
      name: "",
      category: "First Update",
      content: text
    });
    setIsTemplateModalOpen(true);
  };

  const handleTemplateModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (templateModalMode === 'save_current' && saveCurrentSubMode === 'overwrite') {
      if (!overwriteTargetId) {
        addToast("Please select a template to overwrite.", "error");
        return;
      }
      const target = templates.find(t => t.id === overwriteTargetId);
      if (!target) return;
      
      setTemplates(prev => prev.map(t => {
        if (t.id === overwriteTargetId) {
          return {
            ...t,
            content: templateModalData.content
          };
        }
        return t;
      }));
      addToast(`Overwrote template "${target.name}"!`, "success");
      setIsTemplateModalOpen(false);
      return;
    }
    
    const nameClean = templateModalData.name.trim();
    if (!nameClean) {
      addToast("Please enter a template title.", "error");
      return;
    }
    
    if (templateModalMode === 'edit') {
      setTemplates(prev => prev.map(t => {
        if (t.id === templateModalData.id) {
          return {
            ...t,
            name: nameClean,
            category: templateModalData.category,
            content: templateModalData.content
          };
        }
        return t;
      }));
      addToast(`Updated template "${nameClean}"!`, "success");
    } else {
      // Mode is 'create' or 'save_current' as new
      const newT: Template = {
        id: Date.now().toString(),
        name: nameClean,
        category: templateModalData.category,
        content: templateModalData.content
      };
      setTemplates(prev => [...prev, newT]);
      addToast(`Created template "${nameClean}"!`, "success");
    }
    
    setIsTemplateModalOpen(false);
  };  // ==========================================
  // GEMINI AI GRAMMAR CHECK (STRONG REAL-TIME ENGINE)
  // ==========================================
  const lastCheckedTextRef = useRef<string>("");
  const activeCheckPromiseRef = useRef<Promise<any> | null>(null);
  const queuedTextRef = useRef<string | null>(null);

  const runGrammarCheck = async (textToCheck: string, modeToCheck: "fast" | "accurate", isManual = false) => {
    if (!textToCheck.trim()) {
      setGrammarSuggestions([]);
      setGrammarErrorBanner(null);
      return;
    }

    // If an API call is already running, queue this text and return (no overlapping stacked calls)
    if (activeCheckPromiseRef.current) {
      queuedTextRef.current = textToCheck;
      return;
    }

    setIsGrammarChecking(true);
    setGrammarErrorBanner(null);
    lastCheckedTextRef.current = textToCheck;

    const performFetch = async (retryLeft = 1): Promise<any> => {
      const response = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToCheck, mode: modeToCheck })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData.error || `HTTP error ${response.status}`;
        if (retryLeft > 0) {
          // Retry once gracefully
          return performFetch(retryLeft - 1);
        }
        throw new Error(message);
      }

      return response.json();
    };

    const promise = performFetch(1)
      .then(data => {
        const corrections = data.corrections || [];
        setGrammarSuggestions(corrections);
        setGrammarErrorBanner(null);
        if (isManual) {
          if (corrections.length === 0) {
            addToast("Perfect grammar! No improvements needed.", "success");
          } else {
            addToast(`Found ${corrections.length} spelling/grammar issues`, "info");
          }
        }
      })
      .catch((err: any) => {
        console.error("Grammar check error:", err);
        setGrammarErrorBanner(err.message || "Failed to parse grammar recommendations after retry.");
        if (isManual) {
          addToast("Grammar check failed. See persistent banner for details.", "error");
        }
      })
      .finally(() => {
        activeCheckPromiseRef.current = null;
        setIsGrammarChecking(false);

        // If there's a queued text check, trigger it now
        if (queuedTextRef.current !== null) {
          const nextText = queuedTextRef.current;
          queuedTextRef.current = null;
          runGrammarCheck(nextText, modeToCheck, false);
        }
      });

    activeCheckPromiseRef.current = promise;
  };

  const checkGrammarWithAI = () => {
    if (!text.trim()) {
      addToast("Please enter some text first.", "error");
      return;
    }
    runGrammarCheck(text, grammarMode, true);
  };

  // Real-time automatic check: 700ms after typing stops
  useEffect(() => {
    if (text === lastCheckedTextRef.current) return;
    
    const timer = setTimeout(() => {
      runGrammarCheck(text, grammarMode, false);
    }, 700);

    return () => clearTimeout(timer);
  }, [text, grammarMode]);

  const applySingleGrammarSuggestion = (issue: GrammarIssue) => {
    const { startIndex, endIndex, original, suggestion } = issue;
    
    // Safety check: verify if original word is still present at these exact offsets
    if (text.slice(startIndex, endIndex) !== original) {
      // Fallback: search for first occurrence if user edited around it
      const fallbackIndex = text.indexOf(original);
      if (fallbackIndex === -1) {
        addToast("Could not locate original phrase to replace.", "error");
        return;
      }
      const updatedText = text.slice(0, fallbackIndex) + suggestion + text.slice(fallbackIndex + original.length);
      setText(updatedText);
      pushToHistory(updatedText, true);
      updateEditorContentDirectly(updatedText);
      setGrammarSuggestions(prev => prev.filter(g => g !== issue));
      addToast("Correction applied!", "success");
      return;
    }

    const updatedText = text.slice(0, startIndex) + suggestion + text.slice(endIndex);
    setText(updatedText);
    pushToHistory(updatedText, true);
    updateEditorContentDirectly(updatedText);
    
    // Shift other remaining suggestions' indices
    const diff = suggestion.length - original.length;
    setGrammarSuggestions(prev => 
      prev
        .filter(g => g !== issue)
        .map(g => {
          if (g.startIndex > startIndex) {
            return {
              ...g,
              startIndex: g.startIndex + diff,
              endIndex: g.endIndex + diff
            };
          }
          return g;
        })
    );
    addToast("Correction applied!", "success");
  };

  const applyAllGrammarSuggestions = () => {
    if (grammarSuggestions.length === 0) return;
    
    // Replace right-to-left to avoid index shifts
    const sortedIssues = [...grammarSuggestions].sort((a, b) => b.startIndex - a.startIndex);
    
    let updatedText = text;
    let appliedCount = 0;
    
    for (const issue of sortedIssues) {
      const { startIndex, endIndex, original, suggestion } = issue;
      if (updatedText.slice(startIndex, endIndex) === original) {
        updatedText = updatedText.slice(0, startIndex) + suggestion + updatedText.slice(endIndex);
        appliedCount++;
      } else {
        const fallbackIndex = updatedText.lastIndexOf(original);
        if (fallbackIndex !== -1) {
          updatedText = updatedText.slice(0, fallbackIndex) + suggestion + updatedText.slice(fallbackIndex + original.length);
          appliedCount++;
        }
      }
    }
    
    if (appliedCount > 0) {
      setText(updatedText);
      pushToHistory(updatedText, true);
      updateEditorContentDirectly(updatedText);
      setGrammarSuggestions([]);
      addToast(`Applied ${appliedCount} grammar corrections!`, "success");
    } else {
      addToast("No matching original phrases found to correct.", "error");
    }
  };

  const handleIgnoreIssue = (issue: GrammarIssue) => {
    setGrammarSuggestions(prev => prev.filter(g => g !== issue));
    addToast("Grammar issue ignored", "info");
  };

  // Word/char calculations
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#c9d1d9] font-sans selection:bg-[#58a6ff]/30 transition-colors duration-200">
      
      {/* ==========================================
          HEADER / WINDOW TITLE BAR
          ========================================== */}
      <header className="sticky top-0 z-40 bg-[#f6f8fa]/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-[#d0d7de] dark:border-[#30363d] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* macOS window traffic lights (wink to developer vibes) */}
            <div className="flex items-center gap-1.5 mr-2 select-none shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#f85149]/40 border border-[#f85149]/20" />
              <div className="w-3 h-3 rounded-full bg-[#f0883e]/40 border border-[#f0883e]/20" />
              <div className="w-3 h-3 rounded-full bg-[#3fb950]/40 border border-[#3fb950]/20" />
            </div>

            {/* Title / Wordmark as a filename prompt */}
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#58a6ff] font-bold">&gt;_</span>
              <h1 id="app-title" className="font-bold text-sm tracking-tight text-[#24292f] dark:text-white flex items-center gap-1">
                safetext-editor<span className="text-[#57606a] dark:text-[#8b949e]">.tsx</span>
              </h1>
              <span className="w-1.5 h-4 bg-[#58a6ff] inline-block animate-cursor-blink shrink-0"></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Templates Explorer Toggle Button */}
            <button
              onClick={() => setIsTemplatesDrawerOpen(!isTemplatesDrawerOpen)}
              className={`p-1.5 border rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                isTemplatesDrawerOpen
                  ? "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30"
                  : "text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ffffff] dark:hover:bg-[#0d1117]"
              }`}
              title="Toggle Templates Explorer"
            >
              <FileText className="w-4 h-4 text-[#58a6ff]" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {/* Theme Toggle styled as a small coder icon button */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] dark:hover:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] rounded-md transition-all cursor-pointer"
              title="Toggle Theme (Light/Dark)"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] rounded-md transition-all cursor-pointer"
              title="Open File Explorer Rules"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN WORKSPACE GRID
          ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ==========================================
            LEFT WORKSPACE - THE CODE AREA & ACTIONS
            ========================================== */}
        <section className="md:col-span-2 flex flex-col gap-4">

          {/* IDE EDITOR COMPONENT */}
          <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-sm flex flex-col flex-1 overflow-hidden">
            
            {/* Fake Inactive Tab Strip (Atmosphere) */}
            <div className="flex bg-[#f6f8fa] dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-mono select-none overflow-x-auto shrink-0">
              {/* Active main tab */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#fbfbfb] dark:bg-[#0a0e14] border-r border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] border-t-2 border-[#58a6ff] font-medium shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>message.txt</span>
                <span className="text-[9px] text-[#3fb950] ml-1">●</span>
              </div>
              
              {/* Inactive fake files */}
              <div className="flex items-center gap-1.5 px-4 py-2 text-[#57606a] dark:text-[#8b949e] border-r border-[#d0d7de]/40 dark:border-[#30363d]/40 shrink-0 select-none">
                <span className="text-[#f0883e] font-bold text-[9px]">[!]</span>
                <span>blocked_rules.json</span>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 text-[#57606a] dark:text-[#8b949e] border-r border-[#d0d7de]/40 dark:border-[#30363d]/40 shrink-0 select-none">
                <span>fiverr_terms.md</span>
              </div>
            </div>

            {/* Diagnostic Terminal Output Summary (Live indicator header) */}
            <div className="px-4 py-2.5 bg-[#f6f8fa]/50 dark:bg-[#161b22]/50 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                {matchedRanges.length > 0 ? (
                  <span className="text-[#f0883e] font-medium flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#f0883e] animate-ping"></span>
                    [!] {matchedRanges.length} warning(s) detected. obfuscation recommended.
                  </span>
                ) : (
                  <span className="text-[#3fb950] font-medium flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#3fb950]"></span>
                    [✓] 0 issues found in current buffer.
                  </span>
                )}
              </div>

              {/* Undo/Redo Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  className="p-1 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* THE CODE-EDITOR WORKSPACE (Line Numbers Gutter + contentEditable editor) */}
            <div className="flex flex-row flex-1 bg-[#fbfbfb] dark:bg-[#0a0e14] min-h-[380px] overflow-hidden relative">
              
              {/* CODE LINE GUTTER (Non-selectable line counters) */}
              <div className="select-none text-right pr-3 pl-4 pt-4 border-r border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] shrink-0 font-mono text-sm leading-relaxed text-[#57606a] dark:text-[#484f58] min-h-full">
                {Array.from({ length: Math.max(1, text.split('\n').length) }).map((_, i) => (
                  <div key={i} className="editor-gutter-num h-[1.6em] text-right text-xs">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* CONTENT EDITABLE BUFFER */}
              <div className="p-4 flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-[#0a0e14]">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Paste your freelance message here... (e.g. Send me an email at customerr@gmail.com or text my whatsapp to discuss.)"
                  className="w-full min-h-[350px] outline-hidden font-mono text-sm leading-relaxed whitespace-pre-wrap break-all select-text empty:before:content-[attr(placeholder)] empty:before:text-[#57606a]/60 dark:empty:before:text-[#8b949e]/40 empty:before:pointer-events-none empty:before:italic text-[#24292f] dark:text-[#c9d1d9]"
                  style={{ minHeight: '350px', lineHeight: '1.6em' }}
                />
              </div>
            </div>

            {/* Live system alerts */}
            <AnimatePresence>
              {obfuscatedFeedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#161b22] border-t border-[#3fb950]/30 px-4 py-2 flex items-center justify-between"
                >
                  <span className="text-xs font-mono font-medium text-[#3fb950] flex items-center gap-1.5">
                    [✓] {obfuscatedFeedback}
                  </span>
                  <button 
                    onClick={() => setObfuscatedFeedback(null)}
                    className="text-[#8b949e] hover:text-[#f85149] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {matchedRanges.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#161b22] border-t border-[#f0883e]/30 px-4 py-2.5"
                >
                  <div className="text-xs font-mono text-[#f0883e] flex flex-wrap gap-x-1.5 items-center">
                    <span className="font-semibold">[!] Flagged keywords:</span>
                    {Array.from(new Set(matchedRanges.map(m => m.word.toLowerCase()))).map((w, idx) => (
                      <span key={idx} className="bg-[rgba(240,136,62,0.12)] border border-[#f0883e]/30 px-1.5 py-0.25 rounded-md font-mono text-[10px] text-[#f0883e] mr-1 mt-0.5">
                        {w}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EDITOR TERMINAL STATUS BAR */}
            <div className="p-4 bg-[#f6f8fa] dark:bg-[#161b22]/70 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Lines / Characters Counter */}
              <div className="flex items-center gap-4 text-xs font-mono text-[#57606a] dark:text-[#8b949e]">
                <div>
                  ln <span className="font-semibold text-[#24292f] dark:text-white">{text.split('\n').length}</span>
                </div>
                <div>
                  col <span className="font-semibold text-[#24292f] dark:text-white">{charCount}</span>
                </div>
                <div>
                  words <span className="font-semibold text-[#24292f] dark:text-white">{wordCount}</span>
                </div>
              </div>

              {/* Monospace Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
                <button
                  id="detect-words-button"
                  onClick={triggerManualDetect}
                  className="px-4 py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-xs font-bold font-mono rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Detect Words</span>
                </button>

                {matchedRanges.length > 0 && (
                  <button
                    onClick={triggerObfuscation}
                    className="px-4 py-2 bg-gradient-to-r from-[#f0883e] to-[#f0883e]/90 hover:from-[#f0883e]/90 hover:to-[#f0883e]/80 text-white text-xs font-bold font-mono rounded-md transition-colors border border-transparent flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Obfuscate</span>
                  </button>
                )}

                {/* Model Selector Toggle */}
                <div className="flex bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-0.5 text-[10px] font-bold font-mono h-8 items-center shrink-0">
                  <button
                    onClick={() => setGrammarMode("fast")}
                    type="button"
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer h-full ${
                      grammarMode === "fast"
                        ? "bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/30"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                    title="FAST: gemini-2.5-flash"
                  >
                    FAST
                  </button>
                  <button
                    onClick={() => setGrammarMode("accurate")}
                    type="button"
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer h-full ${
                      grammarMode === "accurate"
                        ? "bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/30"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                    title="PRO: gemini-2.5-pro"
                  >
                    PRO
                  </button>
                </div>

                <button
                  onClick={checkGrammarWithAI}
                  disabled={isGrammarChecking}
                  className="px-4 py-2 bg-[#ffffff] dark:bg-[#0d1117] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] text-xs font-medium font-mono rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer h-8"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>{isGrammarChecking ? "checking..." : "fix grammar"}</span>
                </button>

                <button
                  onClick={handleSaveCurrentAsTemplateTrigger}
                  className="px-4 py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-xs font-bold font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer h-8"
                  title="Save current editor content as a reusable template"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Template</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-[#161b22] dark:bg-[#30363d] hover:bg-[#30363d] dark:hover:bg-[#484f58] border border-[#d0d7de] dark:border-[#484f58] text-[#24292f] dark:text-[#c9d1d9] text-xs font-semibold font-mono rounded-md transition-colors flex items-center gap-1.5 cursor-pointer h-8"
                  title="Copy the final clean plain text only (strips formatting)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Result</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            RIGHT WORKSPACE - SIDEBAR (RULES & GRAMMAR)
            ========================================== */}
        <aside className="hidden md:flex flex-col gap-4 w-80 lg:w-96 shrink-0">
          <UnifiedSidebar 
            restrictedWords={restrictedWords}
            filteredWords={filteredWords}
            newWordInput={newWordInput}
            setNewWordInput={setNewWordInput}
            wordFilter={wordFilter}
            setWordFilter={setWordFilter}
            handleAddWord={handleAddWord}
            handleRemoveWord={handleRemoveWord}
            handleResetWords={handleResetWords}
            graspSubstrings={graspSubstrings}
            setGraspSubstrings={setGraspSubstrings}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            grammarSuggestions={grammarSuggestions}
            isGrammarChecking={isGrammarChecking}
            grammarMode={grammarMode}
            setGrammarMode={setGrammarMode}
            grammarErrorBanner={grammarErrorBanner}
            checkGrammarWithAI={checkGrammarWithAI}
            applySingleGrammarSuggestion={applySingleGrammarSuggestion}
            handleIgnoreIssue={handleIgnoreIssue}
            applyAllGrammarSuggestions={applyAllGrammarSuggestions}
          />
        </aside>

      </main>

      {/* ==========================================
          MOBILE SIDEBAR / DRAWER
          ========================================== */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#000000] z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#ffffff] dark:bg-[#161b22] shadow-2xl z-55 md:hidden flex flex-col border-l border-[#d0d7de] dark:border-[#30363d]"
            >
              <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <Shield className="w-4 h-4 text-[#58a6ff]" />
                  <span className="font-bold text-xs uppercase tracking-wider">WORKSPACE EXPLORER</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-[#ffffff] dark:bg-[#0d1117]">
                <UnifiedSidebar 
                  restrictedWords={restrictedWords}
                  filteredWords={filteredWords}
                  newWordInput={newWordInput}
                  setNewWordInput={setNewWordInput}
                  wordFilter={wordFilter}
                  setWordFilter={setWordFilter}
                  handleAddWord={handleAddWord}
                  handleRemoveWord={handleRemoveWord}
                  handleResetWords={handleResetWords}
                  graspSubstrings={graspSubstrings}
                  setGraspSubstrings={setGraspSubstrings}
                  sidebarTab={sidebarTab}
                  setSidebarTab={setSidebarTab}
                  grammarSuggestions={grammarSuggestions}
                  isGrammarChecking={isGrammarChecking}
                  grammarMode={grammarMode}
                  setGrammarMode={setGrammarMode}
                  grammarErrorBanner={grammarErrorBanner}
                  checkGrammarWithAI={checkGrammarWithAI}
                  applySingleGrammarSuggestion={applySingleGrammarSuggestion}
                  handleIgnoreIssue={handleIgnoreIssue}
                  applyAllGrammarSuggestions={applyAllGrammarSuggestions}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================
          TEMPLATES DRAWER / SLIDE-OUT PANEL (LEFT SIDE)
          ========================================== */}
      <AnimatePresence>
        {isTemplatesDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplatesDrawerOpen(false)}
              className="fixed inset-0 bg-[#000000]/60 z-50 backdrop-blur-xs"
            />
            {/* Drawer Sliding from Left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-md bg-[#ffffff] dark:bg-[#161b22] shadow-2xl z-55 flex flex-col border-r border-[#d0d7de] dark:border-[#30363d] font-mono text-xs"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between bg-[#f6f8fa] dark:bg-[#0d1117]/80 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#58a6ff]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#24292f] dark:text-white">Templates Explorer</span>
                </div>
                <button
                  onClick={() => setIsTemplatesDrawerOpen(false)}
                  className="p-1 text-[#57606a] dark:text-[#8b949e] hover:bg-[#d0d7de]/50 dark:hover:bg-[#30363d]/50 rounded-md cursor-pointer"
                  title="Close Explorer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Templates Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Pending Confirmation to load template (if editor is non-empty) */}
                {pendingTemplateToLoad && (
                  <div className="p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-md text-[#f0883e] flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold block text-sm">Replace current text?</span>
                        <span className="text-[11px] leading-relaxed block mt-0.5">
                          Loading "{pendingTemplateToLoad.name}" will overwrite the active editor content. Unsaved changes will be lost.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 self-end">
                      <button
                        onClick={() => {
                          setText(pendingTemplateToLoad.content);
                          pushToHistory(pendingTemplateToLoad.content, true);
                          updateEditorContentDirectly(pendingTemplateToLoad.content);
                          addToast(`Loaded template: ${pendingTemplateToLoad.name}`, "success");
                          setPendingTemplateToLoad(null);
                        }}
                        className="px-2.5 py-1 bg-[#f0883e] hover:bg-[#f0883e]/90 text-slate-950 font-bold rounded-sm text-[10px] cursor-pointer"
                      >
                        Yes, Replace
                      </button>
                      <button
                        onClick={() => setPendingTemplateToLoad(null)}
                        className="px-2.5 py-1 bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] rounded-sm text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories Accordion */}
                <div className="space-y-2 select-none">
                  {FIXED_CATEGORIES.map(category => {
                    const categoryTemplates = templates.filter(t => t.category === category);
                    const isExpanded = !!expandedCategories[category];

                    return (
                      <div 
                        key={category}
                        className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#f6f8fa]/30 dark:bg-[#161b22]/20"
                      >
                        {/* Category Header */}
                        <div 
                          onClick={() => toggleCategory(category)}
                          className="flex items-center justify-between p-2.5 bg-[#f6f8fa] dark:bg-[#161b22]/50 hover:bg-[#f0f3f6] dark:hover:bg-[#30363d]/30 cursor-pointer select-none border-b border-[#d0d7de]/40 dark:border-[#30363d]/40"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e] shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e] shrink-0" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                            )}
                            <span className="font-bold text-[11px] uppercase tracking-wider text-[#24292f] dark:text-[#c9d1d9] truncate">
                              {category}
                            </span>
                            <span className="text-[10px] font-semibold text-[#57606a] dark:text-[#8b949e] bg-[#d0d7de]/40 dark:bg-[#30363d]/60 px-1.5 py-0.25 rounded-full shrink-0">
                              {categoryTemplates.length}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTemplateTrigger(category);
                            }}
                            className="p-1 hover:bg-[#ffffff] dark:hover:bg-[#0d1117] text-[#58a6ff] hover:text-[#58a6ff]/90 border border-transparent hover:border-[#58a6ff]/30 rounded-md transition-all shrink-0 cursor-pointer"
                            title={`Add new template under ${category}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Category Templates List */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]/40 divide-y divide-[#d0d7de]/40 dark:divide-[#30363d]/40"
                            >
                              {categoryTemplates.length === 0 ? (
                                <div className="text-xs font-mono text-[#57606a]/80 dark:text-[#8b949e]/60 italic py-3 px-4 text-center">
                                  No templates yet — click + New Template to add one.
                                </div>
                              ) : (
                                categoryTemplates.map(t => (
                                  <div
                                    key={t.id}
                                    onClick={() => handleSelectTemplateTrigger(t)}
                                    className="p-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]/40 transition-colors flex flex-col gap-1 cursor-pointer select-none group"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-[#24292f] dark:text-white truncate group-hover:text-[#58a6ff] transition-colors">
                                        {t.name}
                                      </span>

                                      {/* Action Buttons Group */}
                                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                        {deleteConfirmId === t.id ? (
                                          <div className="flex items-center gap-1 bg-[#f85149]/10 border border-[#f85149]/30 rounded-sm p-0.5" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[9px] text-[#f85149] font-bold px-1 select-none">Delete?</span>
                                            <button
                                              onClick={(e) => handleRemoveTemplate(t.id, e)}
                                              className="p-0.5 hover:bg-[#f85149] hover:text-white text-[#f85149] rounded-sm transition-colors cursor-pointer"
                                              title="Confirm Delete"
                                            >
                                              <Check className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmId(null);
                                              }}
                                              className="p-0.5 hover:bg-[#d0d7de] dark:hover:bg-[#30363d] text-[#57606a] dark:text-[#8b949e] rounded-sm transition-colors cursor-pointer"
                                              title="Cancel Delete"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <button
                                              onClick={(e) => handleEditTemplateTrigger(t, e)}
                                              className="p-1 hover:bg-[#d0d7de]/50 dark:hover:bg-[#30363d]/50 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] rounded-sm transition-all cursor-pointer"
                                              title="Edit Template"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => handleDuplicateTemplate(t, e)}
                                              className="p-1 hover:bg-[#d0d7de]/50 dark:hover:bg-[#30363d]/50 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] rounded-sm transition-all cursor-pointer"
                                              title="Duplicate Template"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmId(t.id);
                                              }}
                                              className="p-1 hover:bg-[#f85149]/10 hover:text-[#f85149] text-[#57606a] dark:text-[#8b949e] rounded-sm transition-all cursor-pointer"
                                              title="Delete Template"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Preview */}
                                    <p className="text-[10px] text-[#57606a] dark:text-[#8b949e] leading-relaxed truncate select-none">
                                      {t.content}
                                    </p>
                                  </div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================
          PERMANENT, NON-REMOVABLE FOOTER
          ========================================== */}
      <footer className="w-full py-4 px-6 border-t border-[#d0d7de] dark:border-[#30363d] mt-auto shrink-0 select-none bg-[#f6f8fa] dark:bg-[#161b22]/50 text-[#57606a] dark:text-[#8b949e] font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SafeText Editor &copy; {new Date().getFullYear()} — Fiverr-Safe Sanitizer</span>
          <span className="font-semibold text-[#24292f] dark:text-[#c9d1d9]">Built by Subroto Kumar Barman</span>
        </div>
      </footer>

      {/* ==========================================
          DYNAMIC TEMPLATE CREATOR / EDITOR DIALOG
          ========================================== */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute inset-0 bg-[#000000]"
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 max-w-md w-full relative z-10 font-mono text-xs text-[#24292f] dark:text-[#c9d1d9]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#24292f] dark:text-white">
                  {templateModalMode === 'edit' && "Edit Template"}
                  {templateModalMode === 'create' && "Create Template"}
                  {templateModalMode === 'save_current' && "Save Current Editor Content"}
                </h3>
                <button 
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1 hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] text-[#57606a] dark:text-[#8b949e] rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Save Current Mode options */}
              {templateModalMode === 'save_current' && (
                <div className="flex bg-[#f6f8fa] dark:bg-[#0d1117] p-1 border border-[#d0d7de] dark:border-[#30363d] rounded-md mb-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSaveCurrentSubMode('new')}
                    className={`flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase text-center transition-all cursor-pointer ${
                      saveCurrentSubMode === 'new'
                        ? "bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                  >
                    Save as New
                  </button>
                  <button
                    type="button"
                    disabled={templates.length === 0}
                    onClick={() => setSaveCurrentSubMode('overwrite')}
                    className={`flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase text-center transition-all cursor-pointer ${
                      templates.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      saveCurrentSubMode === 'overwrite'
                        ? "bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                  >
                    Overwrite Existing
                  </button>
                </div>
              )}

              {/* Main Submit Form */}
              <form onSubmit={handleTemplateModalSubmit} className="space-y-4">
                {templateModalMode === 'save_current' && saveCurrentSubMode === 'overwrite' ? (
                  /* Overwrite fields */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase mb-1.5">
                        Target Template to Overwrite
                      </label>
                      <select
                        value={overwriteTargetId}
                        onChange={(e) => setOverwriteTargetId(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#fbfbfb] dark:bg-[#0a0e14] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md text-xs outline-hidden focus:border-[#58a6ff] font-mono"
                      >
                        {FIXED_CATEGORIES.map(category => {
                          const categoryTemplates = templates.filter(t => t.category === category);
                          if (categoryTemplates.length === 0) return null;
                          return (
                            <optgroup key={category} label={category} className="bg-[#ffffff] dark:bg-[#161b22] text-[#24292f] dark:text-[#c9d1d9] font-mono font-bold">
                              {categoryTemplates.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase mb-1">
                        Content to Save (Active Buffer)
                      </label>
                      <div className="w-full p-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[10px] text-[#57606a] dark:text-[#8b949e] leading-relaxed max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                        {templateModalData.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Create / Edit / New fields */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase mb-1.5">
                        Template Title
                      </label>
                      <input
                        type="text"
                        value={templateModalData.name}
                        onChange={(e) => setTemplateModalData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Design Update, Bug Fix"
                        maxLength={40}
                        required
                        className="w-full px-3 py-2 bg-[#fbfbfb] dark:bg-[#0a0e14] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md text-xs outline-hidden focus:border-[#58a6ff] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase mb-1.5">
                        Fiverr Update Category
                      </label>
                      <select
                        value={templateModalData.category}
                        onChange={(e) => setTemplateModalData(prev => ({ ...prev, category: e.target.value }))}
                        required
                        className="w-full px-3 py-2 bg-[#fbfbfb] dark:bg-[#0a0e14] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md text-xs outline-hidden focus:border-[#58a6ff] font-mono"
                      >
                        {FIXED_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase mb-1.5">
                        Template Body
                      </label>
                      <textarea
                        value={templateModalData.content}
                        onChange={(e) => setTemplateModalData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your template text here. You can use placeholders..."
                        required
                        rows={6}
                        className="w-full px-3 py-2 bg-[#fbfbfb] dark:bg-[#0a0e14] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md text-xs outline-hidden focus:border-[#58a6ff] font-mono resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#d0d7de]/40 dark:border-[#30363d]/40">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117] rounded-md text-xs font-bold cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#58a6ff] hover:bg-[#58a6ff]/90 text-slate-950 rounded-md text-xs font-bold cursor-pointer transition-colors"
                  >
                    {templateModalMode === 'edit' && "UPDATE TEMPLATE"}
                    {templateModalMode === 'create' && "CREATE TEMPLATE"}
                    {templateModalMode === 'save_current' && (
                      saveCurrentSubMode === 'overwrite' ? "OVERWRITE TEMPLATE" : "SAVE TEMPLATE"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TOAST NOTIFICATION ENGINE
          ========================================== */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-3.5 rounded-md border text-xs font-mono flex items-center gap-2.5 pointer-events-auto shadow-lg ${
                t.type === "success" 
                  ? "bg-[#161b22] border-[#3fb950]/40 text-[#3fb950]" 
                  : t.type === "error"
                  ? "bg-[#161b22] border-[#f85149]/40 text-[#f85149]"
                  : "bg-[#161b22] border-[#58a6ff]/40 text-[#58a6ff]"
              }`}
            >
              <span className="font-bold">
                {t.type === "success" ? "[OK]" : t.type === "error" ? "[ERR]" : "[INFO]"}
              </span>
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

// ==========================================
// RENDER COMPONENT FOR RESTRICTED WORDS
// ==========================================
// ==========================================
// RENDER COMPONENT FOR UNIFIED SIDEBAR (RULES & GRAMMAR)
// ==========================================
interface UnifiedSidebarProps {
  restrictedWords: string[];
  filteredWords: string[];
  newWordInput: string;
  setNewWordInput: React.Dispatch<React.SetStateAction<string>>;
  wordFilter: string;
  setWordFilter: React.Dispatch<React.SetStateAction<string>>;
  handleAddWord: (e: React.FormEvent) => void;
  handleRemoveWord: (word: string) => void;
  handleResetWords: () => void;
  graspSubstrings: boolean;
  setGraspSubstrings: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Grammar system props
  sidebarTab: "restricted" | "grammar";
  setSidebarTab: (tab: "restricted" | "grammar") => void;
  grammarSuggestions: GrammarIssue[];
  isGrammarChecking: boolean;
  grammarMode: "fast" | "accurate";
  setGrammarMode: (mode: "fast" | "accurate") => void;
  grammarErrorBanner: string | null;
  checkGrammarWithAI: () => void;
  applySingleGrammarSuggestion: (issue: GrammarIssue) => void;
  handleIgnoreIssue: (issue: GrammarIssue) => void;
  applyAllGrammarSuggestions: () => void;
}

function UnifiedSidebar({
  restrictedWords,
  filteredWords,
  newWordInput,
  setNewWordInput,
  wordFilter,
  setWordFilter,
  handleAddWord,
  handleRemoveWord,
  handleResetWords,
  graspSubstrings,
  setGraspSubstrings,
  sidebarTab,
  setSidebarTab,
  grammarSuggestions,
  isGrammarChecking,
  grammarMode,
  setGrammarMode,
  grammarErrorBanner,
  checkGrammarWithAI,
  applySingleGrammarSuggestion,
  handleIgnoreIssue,
  applyAllGrammarSuggestions
}: UnifiedSidebarProps) {
  return (
    <div className="bg-[#f6f8fa] dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] p-4 flex flex-col gap-4 h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-[#d0d7de] dark:border-[#30363d] pb-2 text-xs font-mono gap-1 select-none shrink-0">
        <button
          onClick={() => setSidebarTab("restricted")}
          type="button"
          className={`flex-1 py-1.5 px-3 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            sidebarTab === "restricted"
              ? "bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-white border border-[#d0d7de] dark:border-[#30363d] shadow-xs"
              : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white hover:bg-[#eaeef2]/50 dark:hover:bg-[#30363d]/30"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-[#f0883e]" />
          <span>Rules ({restrictedWords.length})</span>
        </button>
        <button
          onClick={() => setSidebarTab("grammar")}
          type="button"
          className={`flex-1 py-1.5 px-3 font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            sidebarTab === "grammar"
              ? "bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-white border border-[#d0d7de] dark:border-[#30363d] shadow-xs"
              : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white hover:bg-[#eaeef2]/50 dark:hover:bg-[#30363d]/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>Grammar ({grammarSuggestions.length})</span>
        </button>
      </div>

      {sidebarTab === "restricted" ? (
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h2 className="text-xs font-bold font-mono text-[#24292f] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#f0883e]" />
              <span>Tracked Rules Explorer</span>
            </h2>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1.5 font-sans">
              Manage forbidden strings. Currently tracking{" "}
              <span className="font-mono font-semibold text-[#24292f] dark:text-white">{restrictedWords.length}</span> tokens.
            </p>
          </div>

          {/* NEW FEATURE TOGGLE: SUBSTRING GRASPING */}
          <div className="p-3 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex flex-col gap-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <input
                id="grasp-substrings-checkbox"
                type="checkbox"
                checked={graspSubstrings}
                onChange={(e) => setGraspSubstrings(e.target.checked)}
                className="mt-0.5 rounded-sm border-[#d0d7de] dark:border-[#30363d] text-[#58a6ff] focus:ring-0 focus:ring-offset-0 h-4 w-4 shrink-0 cursor-pointer bg-[#ffffff] dark:bg-[#0a0e14]"
              />
              <div className="flex-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#24292f] dark:text-slate-200 group-hover:text-[#58a6ff] transition-colors">
                    Grasp Substring Matches
                  </span>
                  <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-[9px] px-1.5 py-0.25 rounded-full font-bold uppercase tracking-wider shrink-0">
                    New
                  </span>
                </div>
                <p className="text-[10px] text-[#57606a] dark:text-[#8b949e] mt-1 leading-relaxed font-sans">
                  Match partial words inside string buffers (e.g. "mywhatsappaddress" catches "whatsapp", "contactme" catches "contact").
                </p>
              </div>
            </label>
          </div>

          {/* ADD NEW WORD FORM */}
          <form onSubmit={handleAddWord} className="flex gap-2 font-mono">
            <input
              id="add-word-input"
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              placeholder="New custom flag..."
              maxLength={30}
              className="flex-1 px-3 py-1.5 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-hidden focus:border-[#58a6ff] text-[#24292f] dark:text-[#c9d1d9] placeholder-[#57606a]/50 dark:placeholder-[#8b949e]/30 font-mono"
            />
            <button
              id="add-word-button"
              type="submit"
              className="p-1.5 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 rounded-md transition-colors flex items-center justify-center cursor-pointer font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* FILTER SEARCH INPUT */}
          <div className="relative font-mono">
            <input
              id="filter-words-input"
              type="text"
              value={wordFilter}
              onChange={(e) => setWordFilter(e.target.value)}
              placeholder="Filter tracked tokens..."
              className="w-full px-3 py-1.5 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[11px] outline-hidden focus:border-[#58a6ff] text-[#24292f] dark:text-[#c9d1d9] placeholder-[#57606a]/50 dark:placeholder-[#8b949e]/30 font-mono"
            />
            {wordFilter && (
              <button 
                id="clear-filter-button"
                onClick={() => setWordFilter("")}
                className="absolute right-2 top-2 text-[#57606a] dark:text-[#8b949e] hover:text-[#f85149] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* LIST OF TRACKED ITEMS CHIPS */}
          <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-[450px] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-2 bg-[#ffffff] dark:bg-[#0a0e14]">
            <div className="flex flex-col gap-1 text-xs font-mono">
              {filteredWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] border border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d] group transition-all text-[#24292f] dark:text-[#c9d1d9]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#57606a] dark:text-[#484f58] select-none">#</span>
                    <span className="font-medium">{word}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(word)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-[#57606a] dark:text-[#8b949e] hover:text-[#f85149] transition-all cursor-pointer"
                    title={`Delete ${word}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {filteredWords.length === 0 && (
                <span className="text-xs text-[#57606a] dark:text-[#8b949e] font-sans italic text-center w-full py-6">No matching rules.</span>
              )}
            </div>
          </div>

          {/* RE-INITIALIZE ACTIONS */}
          <div className="space-y-3 pt-3 border-t border-[#d0d7de] dark:border-[#30363d] font-mono shrink-0">
            <button
              id="restore-defaults-button"
              onClick={handleResetWords}
              type="button"
              className="w-full py-2 bg-[#ffffff] dark:bg-[#0d1117] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Rules list</span>
            </button>

            <div className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md font-sans">
              <p className="text-[11px] leading-relaxed text-[#57606a] dark:text-[#8b949e]">
                <span className="font-mono font-bold text-[#58a6ff] uppercase text-[10px] block mb-0.5">[Rule Config]</span>
                Fiverr's block algorithms evolve. If you notice a flagging pattern or a newly blocked word, append it to your rules list.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h2 className="text-xs font-bold font-mono text-[#24292f] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#58a6ff]" />
              <span>Real-Time Grammar Auditor</span>
            </h2>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1.5 font-sans">
              Check your message for common grammatical, punctuation, and spelling mistakes.
            </p>
          </div>

          {/* Model Select Toggle & Check Grammar Action */}
          <div className="p-3 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex flex-col gap-3 font-mono shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase">Auditor Model:</span>
              <div className="flex bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setGrammarMode("fast")}
                  type="button"
                  className={`px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                    grammarMode === "fast"
                      ? "bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-white border border-[#d0d7de]/40 dark:border-[#30363d]/40 shadow-xs"
                      : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                  }`}
                  title="Uses gemini-2.5-flash for lightning fast responses"
                >
                  Fast
                </button>
                <button
                  onClick={() => setGrammarMode("accurate")}
                  type="button"
                  className={`px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                    grammarMode === "accurate"
                      ? "bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-white border border-[#d0d7de]/40 dark:border-[#30363d]/40 shadow-xs"
                      : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                  }`}
                  title="Uses gemini-2.5-pro for complex, deep grammatical proofreading"
                >
                  Accurate
                </button>
              </div>
            </div>

            <button
              onClick={checkGrammarWithAI}
              disabled={isGrammarChecking}
              type="button"
              className="w-full py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGrammarChecking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Forced Audit Check</span>
                </>
              )}
            </button>
          </div>

          {/* Persistent Error Banner inside Grammar tab */}
          {grammarErrorBanner && (
            <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-md p-3 text-xs font-mono text-[#f85149] flex flex-col gap-2 shrink-0">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">[ERROR STATUS]</span>
                  <span className="leading-relaxed text-[11px] block">{grammarErrorBanner}</span>
                </div>
              </div>
              <button
                onClick={checkGrammarWithAI}
                type="button"
                className="w-full mt-1 bg-[#f85149]/20 hover:bg-[#f85149]/30 border border-[#f85149]/40 py-1 rounded-md text-[10px] uppercase font-bold transition-all text-[#f85149] cursor-pointer"
              >
                Retry check
              </button>
            </div>
          )}

          {/* Actions Header (Apply All if issues exist) */}
          {grammarSuggestions.length > 0 && (
            <div className="flex items-center justify-between font-mono shrink-0">
              <span className="text-[10px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase">
                {grammarSuggestions.length} issues flagged
              </span>
              <button
                onClick={applyAllGrammarSuggestions}
                type="button"
                className="px-2 py-1 bg-[#3fb950]/10 hover:bg-[#3fb950]/20 border border-[#3fb950]/30 text-[#3fb950] text-[10px] font-bold rounded-md transition-colors cursor-pointer"
              >
                Apply All
              </button>
            </div>
          )}

          {/* List of Grammar Issue Cards */}
          <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-[450px] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-2 bg-[#ffffff] dark:bg-[#0a0e14] flex flex-col gap-2">
            {grammarSuggestions.map((issue, idx) => {
              // Determine severity coloring
              let sevBg = "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/30";
              if (issue.severity === "minor") sevBg = "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30";
              else if (issue.severity === "spelling") sevBg = "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30";
              
              return (
                <div
                  key={idx}
                  className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex flex-col gap-2 font-mono text-xs text-[#24292f] dark:text-[#c9d1d9]"
                >
                  {/* Header Row: Category Badge + Severity */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#d0d7de]/50 dark:border-[#30363d]/50 pb-1.5">
                    <span className="font-bold text-[10px] text-[#24292f] dark:text-slate-200 uppercase truncate" title={issue.type}>
                      {issue.type}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.25 rounded-full border font-bold uppercase shrink-0 ${sevBg}`}>
                      {issue.severity}
                    </span>
                  </div>

                  {/* Issue visual correction: flagged word vs suggestion */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-[#f85149] select-all bg-[#f85149]/5 px-1 py-0.25 rounded-sm font-medium">
                        {issue.original}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e] shrink-0" />
                      <span className="text-[#3fb950] font-bold select-all bg-[#3fb950]/5 px-1 py-0.25 rounded-sm">
                        {issue.suggestion}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#57606a] dark:text-[#8b949e] leading-relaxed italic mt-0.5 font-sans">
                      {issue.explanation}
                    </p>
                  </div>

                  {/* Action Row: Apply + Ignore */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#d0d7de]/30 dark:border-[#30363d]/30 mt-1">
                    <button
                      onClick={() => handleIgnoreIssue(issue)}
                      type="button"
                      className="px-2 py-1 bg-transparent hover:bg-[#eaeef2] dark:hover:bg-[#30363d]/40 text-[#57606a] dark:text-[#8b949e] text-[10px] font-bold rounded-md transition-all cursor-pointer"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => applySingleGrammarSuggestion(issue)}
                      type="button"
                      className="px-2.5 py-1 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-[10px] font-bold rounded-md transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })}

            {grammarSuggestions.length === 0 && (
              <div className="text-center py-8 text-[#57606a] dark:text-[#8b949e] h-full flex flex-col items-center justify-center">
                {isGrammarChecking ? (
                  <>
                    <RefreshCw className="w-6 h-6 text-[#58a6ff] animate-spin mb-2" />
                    <span className="text-xs font-mono">Running LLM validation...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-6 h-6 text-[#3fb950] mb-2" />
                    <span className="text-xs font-sans italic font-medium text-[#3fb950]">Perfect grammar detected!</span>
                    <span className="text-[10px] font-sans text-center px-4 mt-1 leading-relaxed">
                      Your text will automatically update with underlines when issues are found.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
