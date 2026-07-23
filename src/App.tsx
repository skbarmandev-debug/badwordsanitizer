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
  Edit,
  Clock,
  Terminal,
  Command,
  GitBranch,
  Cpu,
  Search,
  Code,
  Zap,
  CheckCircle2,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeClientText, typingTracker, GrammarIssue } from "./lib/clientNlpEngine";

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
  "5 star", "five star", "review", "good review", "positive review",
  "rating", "rate my work", "leave a review",
  "homework", "assignment", "thesis", "dissertation", "exam", "quiz",
  "university", "college", "school project", "student",
  "hack", "hacking", "cracking", "password cracking",
  "spam", "bot", "malware", "virus", "fake", "fake followers", "fake reviews", "fake likes",
  "phishing", "deepfake", "scam",
  "contact", "cancel the order", "scammer", "cancellation", "tip me", "report you", "buy", "account", "sell account", "exchange"
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
    content: "Hi there,\n\nI hope you’re doing well.\n\nIt's a first draft update for your website-\n\nAs per your instructions, I've designed a fully functional Wix website based on your requirements. Here's an overview of it :\n\n01. I’ve made the website fully responsive across all devices for a seamless user experience.\n\n02. I’ve designed the site to be minimal, clean, and professional, based on your instructions.\n\n03. I’ve designed the new pages aligned with your vision.\n\n04. I've designed the entire website using the information from your existing website.\n\n05. I've designed the following pages:\n\n>> Home\n>> About\n>> SERVICE\n>> CONTACT\n\nHere is the Website test URL :\n[Client Website URL]\n\nNote: I've used some placeholder images on the website. Once you provide all the images, I will replace them.\n\nPlease feel free to r-e-v-i-e-w everything and share your thoughts. This is the first draft, so I encourage you to check everything on your end and see how it aligns with your vision.\n\nIf everything looks good, that’s great, but if you notice anything you’d like to adjust or improve, I’ll be more than happy to refine those areas. I’m here to ensure the final result fully meets your expectations and resonates well with your audience.\n\nLooking forward to hearing from you.\n\nBest Regards,"
  },
  {
    id: "default-follow-up-first",
    name: "Default",
    category: "Second Follow-up",
    content: "Hi there,\n\nI hope you're doing well!\n\nI just wanted to follow up and see if you've had a chance to r-e-v-i-e-w the first draft of the website. I completely understand that you may be busy, so please feel free to take your time.\n\nWhenever you have a chance, I'd really appreciate your feedback. If there are any changes, design suggestions, or font preferences you'd like me to incorporate, please don't hesitate to share them with me.\n\nI'll be happy to make the requested revisions and provide you with an updated version as quickly as possible.\n\nLooking forward to hearing your thoughts!\n\nBest regards,"
  },
  {
    id: "default-follow-up-mod",
    name: "Default",
    category: "Follow-up After Modification",
    content: "Hi there,\n\nI hope you're doing well!\n\nI just wanted to check in. Have you had a chance to r-e-v-i-e-w the full site? Once you do, please let me know if there are any modifications or changes you'd like to make. I'll work on them promptly and send you an updated and improved version.\n\nLooking forward to hearing from you!\n\nBest regards,"
  },
  {
    id: "default-delivery",
    name: "Default",
    category: "Delivery Message",
    content: "Hi there,\n\nI hope you’re doing well.\n\nAs per your instructions, I've developed a fully functional Wix website based on your requirements. Here's an overview of it :\n\n01. I’ve made the website fully responsive across all devices for a seamless user experience.\n\n02. I’ve designed the site to be minimal, clean, and professional, based on your instructions.\n\n03. I’ve designed the new pages aligned with your vision.\n\n04. I've designed the entire website using the information from your existing website.\n\n05. I've updated the navigation font, changed the quote, renamed the title, removed the numbering from the Things I Care About section, updated the e-m-a-i-l address, added the FPPC footer to every page, and fixed the Contribute button link on the homepage.\n\n06. I've removed the Europe-style image, fixed the font color, and added your new introduction at the top of the about page.\n\n07. I've removed the \"Track Record\" section and the \"Delivering Results & Leading Initiatives for Novato\" section on the Accomplishments Page.\n\n08. I've removed the \"The Door Is Open\" section, updated the c-o-n-t-a-c-t information, and fixed the fonts on the C-o-n-t-a-c-t Page.\n\n09. I've designed the following pages:\n>> Home\n>> About\n>> ISSUES\n>> ENDORSEMENTS\n>> GET INVOLVED\n>> CONTRIBUTE\n>> C-O-N-T-A-C-T\n\nHere is the Website test URL :\nhttps://rfarac.wixsite.com/rachelfarac\n\nPlease Note: For your security, please communicate with us only through Fiverr. If you receive messages, e-m-a-i-ls, or c-o-n-t-a-c-t requests from anyone claiming to represent our team on any other platform, please do not respond. We do not initiate project-related communication outside of Fiverr.\n\nAny communication with individuals or entities outside Fiverr is at your own discretion, and we cannot accept responsibility for any consequences that may arise from such interactions.\n\nSince I have completed all of the tasks on my end, I am delivering this project to you.\n\nNo worries about this project's delivery. After you approve this project based on my work, I'll provide 60 days of ongoing support. During this support period, if you need any changes or modifications, you can let me know in my \"Fiverr Inbox.\" I will take care of the rest.\n\nIt's a pleasure to work with you, and I hope we'll work together in the future.\n\nBest regards,"
  },
  {
    id: "default-delivery-extend",
    name: "Default",
    category: "Delivery Time Extend Message",
    content: "Based on your requirements, I've made the website and shared the first draft update with you. I'm now waiting for your valuable feedback. Since the delivery time is about to end, I've sent a delivery time extension request. Please accept the extension request so I can continue working on any revisions and complete the project properly based on your feedback.\n\nThank you."
  },
  {
    id: "default-delivery-approach",
    name: "Default",
    category: "Delivery approach",
    content: "Hi there,\n\nI hope you are doing great.\n\nAs per your instructions, I've completed the following task:\n\n01. I've ........................\n\n02. I've ................................\n\n03. I've ........................\n\n04. I've ................................\n\nHere is your updated website URL:\n[Paste Your client website URL]\n\nSince I've completed all the assigned tasks from my end, can I deliver the work to you?\n\nNo worries about the transition, you will receive 30 days of ongoing support from me starting today. If you notice any minor tweaks needed or have questions about the new page, just message me here in the Fiverr Inbox, and I will take care of it immediately.\n\nThank you for the continued trust in my work. I look forward to your thoughts!\n\nBest regards,"
  },
  {
    id: "default-inbox",
    name: "Default",
    category: "Inbox Message",
    content: "Hi there,\n\nI hope you are having a great day.\n\nAs per your instructions, I have completed the following tasks:\n\n01. I've ...........................\n\n02. I've ...........................\n\n03. I've ...........................\n\n04. I've ...........................\n\n05. I've ...........................\n\nHere is your updated website URL:\n[Place Your client website URL]\n\nNote: If there is any note\n\nSince I have completed all of the tasks on my end, I am delivering this project to you.\n\nNo worries about this project's delivery. After you approve this project based on my work, I'll provide 60 days of ongoing support. During this support period, if you need any changes or modifications, you can let me know in my \"Fiverr Inbox.\" I will take care of the rest.\n\nIt's a pleasure to work with you, and I hope we'll work together in the future.\n\nBest regards,"
  },
  {
    id: "default-inbox-no-mod",
    name: "Default",
    category: "Inbox Message Without Modification",
    content: "Hi there,\n\nI hope you are doing great.\n\nBased on your latest feedback, I've completed all the assigned tasks according to your instructions. I've maintained a consistent layout throughout the website and ensured everything aligns with your vision.\n\nHere is your website URL:\n[Place your Client website URL]\n\nSince I have completed all of the tasks on my end, I am delivering this project to you.\n\nNo worries about this project's delivery. After approving this project delivery based on my work, I'll give you 30 days of ongoing support. In this support period, if you need any changes or modifications, you can let me know in my \"Fiverr Inbox.\" I will take care of the rest.\n\nIt's a pleasure to work with you, and I hope we'll work together in the future.\n\nBest regards,"
  },
  {
    id: "default-delivery-approach-no-mod",
    name: "Default",
    category: "Delivery Approach Without Modification",
    content: "Hi there,\n\nI hope you are doing great.\n\nSince I've completed all the assigned tasks from my end, can I deliver the work to you?\n\nNo worries about the transition; you will receive 30 days of ongoing support from me starting today. If you notice any minor tweaks needed or have questions about the new page, just message me here in the Fiverr Inbox, and I will take care of it immediately.\n\nThank you for the continued trust in my work. I look forward to your thoughts!\n\nBest regards,"
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

// Highlight restricted match segments in the editor buffer
function renderDecoratedHtml(text: string, restrictedMatches: MatchRange[], _grammarIssues?: GrammarIssue[]): string {
  if (text.length === 0) return "";
  
  const styles: {
    char: string;
    restricted: boolean;
  }[] = Array.from({ length: text.length }, (_, i) => ({
    char: text[i],
    restricted: false,
  }));

  // Apply restricted matches
  for (const m of restrictedMatches) {
    for (let i = m.start; i < m.end; i++) {
      if (i >= 0 && i < styles.length) {
        styles[i].restricted = true;
      }
    }
  }

  let html = "";
  let i = 0;
  while (i < styles.length) {
    const start = i;
    const isRestricted = styles[start].restricted;
    
    while (
      i < styles.length && 
      styles[i].restricted === isRestricted
    ) {
      i++;
    }
    
    const segmentText = text.slice(start, i);
    let escaped = escapeHtml(segmentText).replace(/\n/g, "<br>");
    
    if (isRestricted) {
      const classes = "bg-[rgba(240,136,62,0.18)] text-[#f0883e] font-mono font-medium px-0.5 rounded-[3px] border-b border-[#f0883e]/80";
      html += `<span class="${classes}" data-restricted="true">${escaped}</span>`;
    } else {
      html += escaped;
    }
  }
  
  if (text.endsWith("\n")) {
    html += "<br>";
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
function getCaretOffsetFromRange(element: HTMLElement, range: Range): number {
  if (!element.contains(range.startContainer)) return 0;

  try {
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    const container = document.createElement("div");
    container.appendChild(preCaretRange.cloneContents());

    let textAcc = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textAcc += node.textContent || "";
      } else if (node.nodeName === "BR") {
        textAcc += "\n";
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };
    walk(container);
    return textAcc.length;
  } catch {
    return 0;
  }
}

function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  return getCaretOffsetFromRange(element, sel.getRangeAt(0));
}

function getSelectionCharacterRangeWithin(element: HTMLElement): { start: number; end: number } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { start: 0, end: 0 };

  const range = sel.getRangeAt(0);
  if (!element.contains(range.startContainer)) return { start: 0, end: 0 };

  const startRange = range.cloneRange();
  startRange.collapse(true);

  const endRange = range.cloneRange();
  endRange.collapse(false);

  const start = getCaretOffsetFromRange(element, startRange);
  const end = getCaretOffsetFromRange(element, endRange);

  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function setCaretPosition(element: HTMLElement, targetOffset: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  let currentOffset = 0;
  let found = false;

  function traverseNodes(node: Node) {
    if (found) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length || 0;
      if (currentOffset + len >= targetOffset) {
        const pos = Math.max(0, targetOffset - currentOffset);
        range.setStart(node, Math.min(pos, len));
        range.setEnd(node, Math.min(pos, len));
        found = true;
      } else {
        currentOffset += len;
      }
    } else if (node.nodeName === "BR") {
      if (currentOffset + 1 >= targetOffset) {
        if (targetOffset === currentOffset) {
          range.setStartBefore(node);
          range.setEndBefore(node);
        } else {
          range.setStartAfter(node);
          range.setEndAfter(node);
        }
        found = true;
      } else {
        currentOffset += 1;
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

  try {
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    // fallback gracefully if window selection fails
  }
}

// ==========================================
// APP COMPONENT
// ==========================================
export default function App() {
  // Theme state (night mode by default)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("safetext_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  // Dynamic ticking clock for the header title bar
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main text state
  const [text, setText] = useState<string>("");
  const [matchedRanges, setMatchedRanges] = useState<MatchRange[]>([]);
  const [obfuscatedFeedback, setObfuscatedFeedback] = useState<string | null>(null);
  
  // Restricted words state
  const [restrictedWords, setRestrictedWords] = useState<string[]>(() => {
    const filterOut = (words: string[]) => words.filter(w => {
      const lower = w.toLowerCase().trim();
      return lower !== "website" && lower !== "free" && lower !== "test" && lower !== "work" && lower !== "fiverr" && lower !== "feedback" && lower !== "good feedback" && lower !== "eedback";
    });

    const saved = localStorage.getItem("safetext_restricted_words");
    const filteredDefaults = filterOut(DEFAULT_RESTRICTED_WORDS);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Merge with default list so new default words get included automatically, but filter out requested words
          const merged = Array.from(new Set([...parsed, ...filteredDefaults]));
          const finalWords = filterOut(merged);
          // If we removed some, we can write back to localStorage so it stays updated
          if (finalWords.length !== parsed.length) {
            localStorage.setItem("safetext_restricted_words", JSON.stringify(finalWords));
          }
          return finalWords;
        }
      } catch {
        return filteredDefaults;
      }
    }
    return filteredDefaults;
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
          // Automatic upgrade of the default templates if they still hold previous placeholder content or old categories
          const updatedTemplates = parsed.map((t: Template) => {
            const updated = { ...t };
            if (updated.id === "default-first-update" && (updated.content.startsWith("[PLACEHOLDER: Write your First Update") || updated.content.includes("re-view"))) {
              updated.content = DEFAULT_TEMPLATES[0].content;
            }
            if (updated.id === "default-follow-up-first") {
              updated.category = "Second Follow-up";
              if (updated.content.startsWith("[PLACEHOLDER: Write your Follow-up After First Update") || updated.content.startsWith("[PLACEHOLDER:") || updated.content.includes("review")) {
                updated.content = DEFAULT_TEMPLATES[1].content;
              }
            }
            if (updated.id === "default-follow-up-mod" && (updated.content.startsWith("[PLACEHOLDER: Write your Follow-up After Modification") || updated.content.startsWith("[PLACEHOLDER:") || updated.content.includes("review"))) {
              updated.content = DEFAULT_TEMPLATES[2].content;
            }
            if (updated.id === "default-delivery" && (updated.content.startsWith("[PLACEHOLDER: Write your Delivery Message") || updated.content.startsWith("[PLACEHOLDER:"))) {
              updated.content = DEFAULT_TEMPLATES[3].content;
            }
            if (updated.id === "default-delivery-extend" && (updated.content.startsWith("[PLACEHOLDER: Write your Delivery Time Extend") || updated.content.startsWith("[PLACEHOLDER:"))) {
              updated.content = DEFAULT_TEMPLATES[4].content;
            }
            if (updated.id === "default-delivery-approach" && (updated.content.startsWith("[PLACEHOLDER:") || updated.content.startsWith("i there,") || updated.content.length < 10)) {
              updated.content = DEFAULT_TEMPLATES[5].content;
            }
            if (updated.id === "default-inbox" && (updated.content.startsWith("[PLACEHOLDER: Write your Inbox Message") || updated.content.startsWith("[PLACEHOLDER:") || updated.content.startsWith("Hi there,\n\nI hope you are doing great."))) {
              updated.content = DEFAULT_TEMPLATES[6].content;
            }
            if (updated.id === "default-inbox-no-mod" && (updated.content.startsWith("[PLACEHOLDER: Write your Inbox Message Without Modification") || updated.content.startsWith("[PLACEHOLDER:"))) {
              updated.content = DEFAULT_TEMPLATES[7].content;
            }
            if (updated.id === "default-delivery-approach-no-mod") {
              updated.content = DEFAULT_TEMPLATES[8].content;
              updated.category = "Delivery Approach Without Modification";
            }
            if (updated.category === "Follow-up After First Update") {
              updated.category = "Second Follow-up";
            }
            return updated;
          });

          DEFAULT_TEMPLATES.forEach(defaultT => {
            if (!updatedTemplates.some(t => t.id === defaultT.id)) {
              updatedTemplates.push(defaultT);
            }
          });

          return updatedTemplates;
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

  // Grammar suggestions & Client NLP
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarIssue[]>([]);
  const [isGrammarChecking, setIsGrammarChecking] = useState(false);
  const [grammarMode, setGrammarMode] = useState<"fast" | "accurate">("fast");
  const [grammarErrorBanner, setGrammarErrorBanner] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"restricted" | "grammar">("restricted");

  // Typing Speed, Memory Consumption & Interactive Tooltip States
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<string>("16.2 MB");
  const [tooltipState, setTooltipState] = useState<{ issue: GrammarIssue; x: number; y: number } | null>(null);

  useEffect(() => {
    const updateMemory = () => {
      if (typeof performance !== "undefined" && (performance as any).memory) {
        const usedBytes = (performance as any).memory.usedJSHeapSize;
        if (usedBytes && usedBytes > 0) {
          setMemoryUsage(`${(usedBytes / (1024 * 1024)).toFixed(1)} MB`);
          return;
        }
      }
      const heapEstimate = 15.2 + (text.length * 0.0004);
      setMemoryUsage(`${heapEstimate.toFixed(1)} MB`);
    };

    updateMemory();
    const interval = setInterval(updateMemory, 1500);
    return () => clearInterval(interval);
  }, [text]);

  // System alerts / toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Developer Workstation UI States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"terminal" | "problems">("terminal");
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; time: string; type: "info" | "warn" | "success" | "sys"; text: string }>>([
    { id: "1", time: new Date().toLocaleTimeString([], { hour12: false }), type: "sys", text: "DevWorkstation v2.5 IDE kernel booted. Buffer listener live." },
    { id: "2", time: new Date().toLocaleTimeString([], { hour12: false }), type: "info", text: "Fiverr compliance rules loaded: 32 tokens active." }
  ]);

  const addLog = (text: string, type: "info" | "warn" | "success" | "sys" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setTerminalLogs(prev => [...prev.slice(-49), { id: Date.now().toString() + Math.random(), time, type, text }]);
  };

  // Global Keyboard Listener for Cmd+K / Ctrl+K Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
          if (document.activeElement === el) {
            const { start } = getSelectionCharacterRangeWithin(el);
            el.innerHTML = decoratedHtml;
            setCaretPosition(el, start);
          } else {
            el.innerHTML = decoratedHtml;
          }
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
    
    // Record keystroke for real-time WPM calculation
    const wpm = typingTracker.recordKeystroke(rawText.length);
    setLiveWpm(wpm);
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
      return;
    } else if (isRedo) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Explicit Enter key handling to ensure immediate newline creation and cursor descent
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const el = editorRef.current;
      if (!el) return;

      const { start, end } = getSelectionCharacterRangeWithin(el);
      const newText = text.slice(0, start) + "\n" + text.slice(end);

      setText(newText);
      pushToHistory(newText, false);

      const matches = findMatches(newText, restrictedWords, graspSubstrings);
      setMatchedRanges(matches);
      el.innerHTML = renderDecoratedHtml(newText, matches, grammarSuggestions);
      setCaretPosition(el, start + 1);

      const wpm = typingTracker.recordKeystroke(newText.length);
      setLiveWpm(wpm);
      return;
    }

    // Tab key handling (inserts 2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = editorRef.current;
      if (!el) return;

      const { start, end } = getSelectionCharacterRangeWithin(el);
      const newText = text.slice(0, start) + "  " + text.slice(end);

      setText(newText);
      pushToHistory(newText, false);

      const matches = findMatches(newText, restrictedWords, graspSubstrings);
      setMatchedRanges(matches);
      el.innerHTML = renderDecoratedHtml(newText, matches, grammarSuggestions);
      setCaretPosition(el, start + 2);

      const wpm = typingTracker.recordKeystroke(newText.length);
      setLiveWpm(wpm);
      return;
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
      addLog(`Linter re-scan complete: ${matches.length} restricted token(s) flagged.`, "warn");
    } else {
      addToast("No restricted words detected!", "success");
      addLog("Linter re-scan complete: 0 restricted tokens detected. Clean buffer.", "success");
    }
  };

  const triggerObfuscation = () => {
    const matches = findMatches(text, restrictedWords, graspSubstrings);
    if (matches.length === 0) {
      addToast("No words to obfuscate.", "info");
      addLog("Obfuscate triggered: buffer clean, 0 terms to transform.", "info");
      return;
    }
    const obText = obfuscateText(text, matches);
    setText(obText);
    pushToHistory(obText, true);
    setObfuscatedFeedback(`✅ ${matches.length} word(s) obfuscated`);
    addToast("Restricted terms hyphenated successfully!", "success");
    addLog(`Sanitizer transformed ${matches.length} flagged token(s) with hyphenation.`, "success");

    // Force editor display reset
    const el = editorRef.current;
    if (el) {
      el.innerHTML = renderDecoratedHtml(obText, [], grammarSuggestions);
    }
  };

  const handleCopy = () => {
    if (!text) {
      addToast("Nothing to copy!", "error");
      addLog("Copy command failed: editor buffer is empty.", "warn");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      addToast("Copied safely to clipboard!", "success");
      addLog(`Output buffer (${text.length} chars) copied to clipboard.`, "success");
    }).catch(() => {
      addToast("Clipboard access failed.", "error");
      addLog("Clipboard API access error.", "warn");
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
    "Second Follow-up",
    "Follow-up After Modification",
    "Delivery Message",
    "Delivery Time Extend Message",
    "Delivery approach",
    "Delivery Approach Without Modification",
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
  // PURE CLIENT-SIDE NLP GRAMMAR & SPELLING ENGINE
  // ==========================================
  const checkGrammarWithAI = (isManual = true) => {
    if (!text.trim()) {
      if (isManual) addToast("Please enter text in the editor first.", "error");
      setGrammarSuggestions([]);
      return;
    }
    setIsGrammarChecking(true);
    const issues = analyzeClientText(text);
    setGrammarSuggestions(issues);
    setIsGrammarChecking(false);

    if (isManual) {
      if (issues.length === 0) {
        addToast("Clean text! No spelling, grammar, or punctuation issues found.", "success");
      } else {
        addToast(`Client NLP detected ${issues.length} spelling & grammar issues`, "info");
      }
    }
  };

  // Debounced live client-side NLP check (600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!text.trim()) {
        setGrammarSuggestions([]);
        return;
      }
      setIsGrammarChecking(true);
      const issues = analyzeClientText(text);
      setGrammarSuggestions(issues);
      setIsGrammarChecking(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [text]);

  // Mouse over / click handlers for interactive editor tooltips
  const handleEditorMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const grammarSpan = target.closest("span[data-grammar-id]") as HTMLElement | null;
    if (grammarSpan) {
      const idStr = grammarSpan.getAttribute("data-grammar-id");
      if (idStr !== null) {
        const startIdx = parseInt(idStr, 10);
        const issue = grammarSuggestions.find(g => g.startIndex === startIdx);
        if (issue) {
          const rect = grammarSpan.getBoundingClientRect();
          setTooltipState({
            issue,
            x: Math.max(12, rect.left + rect.width / 2),
            y: Math.max(12, rect.top)
          });
          return;
        }
      }
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const grammarSpan = target.closest("span[data-grammar-id]") as HTMLElement | null;
    if (grammarSpan) {
      const idStr = grammarSpan.getAttribute("data-grammar-id");
      if (idStr !== null) {
        const startIdx = parseInt(idStr, 10);
        const issue = grammarSuggestions.find(g => g.startIndex === startIdx);
        if (issue) {
          const rect = grammarSpan.getBoundingClientRect();
          setTooltipState({
            issue,
            x: Math.max(12, rect.left + rect.width / 2),
            y: Math.max(12, rect.top)
          });
          return;
        }
      }
    }
    setTooltipState(null);
  };

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
      <header className="sticky top-0 z-40 bg-[#f6f8fa]/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-[#d0d7de] dark:border-[#30363d] px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* macOS window traffic lights with glow */}
            <div className="hidden min-[380px]:flex items-center gap-1.5 mr-1 select-none shrink-0 group">
              <div className="w-3 h-3 rounded-full bg-[#f85149] shadow-[0_0_6px_rgba(248,81,73,0.5)] flex items-center justify-center text-[8px] font-bold text-black opacity-90" />
              <div className="w-3 h-3 rounded-full bg-[#f0883e] shadow-[0_0_6px_rgba(240,136,62,0.5)] flex items-center justify-center text-[8px] font-bold text-black opacity-90" />
              <div className="w-3 h-3 rounded-full bg-[#3fb950] shadow-[0_0_6px_rgba(63,185,80,0.5)] flex items-center justify-center text-[8px] font-bold text-black opacity-90" />
            </div>

            {/* Path Breadcrumb & Terminal Title */}
            <div className="flex items-center gap-1.5 font-mono min-w-0 text-xs sm:text-sm">
              <span className="text-[#58a6ff] font-bold">&gt;_</span>
              <span className="hidden sm:inline text-[#57606a] dark:text-[#8b949e]">workstation/</span>
              <h1 id="app-title" className="font-bold tracking-tight text-[#24292f] dark:text-white flex items-center gap-0.5 truncate">
                fiverr-sanitizer<span className="text-[#57606a] dark:text-[#8b949e]">.tsx</span>
              </h1>
              <span className="w-1.5 h-3.5 sm:h-4 bg-[#58a6ff] inline-block animate-cursor-blink shrink-0"></span>

              {/* Git Branch Badge */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 rounded-md text-[10px] font-bold ml-2 shrink-0">
                <GitBranch className="w-3 h-3" />
                <span>main*</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Ticking Clock / Timer */}
            {currentTime && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md font-mono text-[11px] text-[#24292f] dark:text-[#c9d1d9] select-none h-8 shadow-xs shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#58a6ff] animate-pulse" />
                <span className="font-semibold">{currentTime}</span>
              </div>
            )}

            {/* System Telemetry */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md font-mono text-[10px] text-[#57606a] dark:text-[#8b949e] select-none h-8 shrink-0">
              <div className="flex items-center gap-1 text-[#3fb950] font-bold">
                <Cpu className="w-3 h-3 text-[#3fb950] animate-pulse" />
                <span>0.8%</span>
              </div>
              <span className="text-[#d0d7de] dark:text-[#30363d]">|</span>
              <div className="flex items-center gap-1 text-[#58a6ff] font-bold">
                <HardDrive className="w-3 h-3 text-[#58a6ff]" />
                <span>14.2 MB</span>
              </div>
            </div>

            {/* Command Palette Trigger Button (⌘K) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-2.5 py-1 bg-[#ffffff] dark:bg-[#0d1117] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-md transition-all cursor-pointer h-8 flex items-center gap-1.5 font-mono text-xs font-semibold shadow-xs"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span className="hidden sm:inline">Commands</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.25 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-[9px] text-[#57606a] dark:text-[#8b949e] font-sans font-bold">⌘K</kbd>
            </button>

            {/* Templates Explorer Toggle Button */}
            <button
              onClick={() => setIsTemplatesDrawerOpen(!isTemplatesDrawerOpen)}
              className={`p-1.5 sm:px-2.5 border rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold h-8 ${
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
              className="p-1.5 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] dark:hover:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] rounded-md transition-all cursor-pointer h-8 flex items-center justify-center"
              title="Toggle Theme (Light/Dark)"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-[#57606a] dark:text-[#8b949e] hover:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#ffffff] dark:hover:bg-[#0d1117] rounded-md transition-all cursor-pointer h-8 flex items-center justify-center"
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 overflow-x-hidden">
        
        {/* ==========================================
            LEFT WORKSPACE - THE CODE AREA & ACTIONS
            ========================================== */}
        <section className="md:col-span-2 flex flex-col gap-4 min-w-0">

          {/* IDE EDITOR COMPONENT */}
          <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-sm flex flex-col flex-1 overflow-hidden min-w-0">
            
            {/* Fake Inactive Tab Strip (Atmosphere) */}
            <div className="flex bg-[#f6f8fa] dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-mono select-none overflow-x-auto scrollbar-none shrink-0">
              {/* Active main tab */}
              <div className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-[#fbfbfb] dark:bg-[#0a0e14] border-r border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] border-t-2 border-[#58a6ff] font-medium shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>message.txt</span>
                <span className="text-[9px] text-[#3fb950] ml-1">●</span>
              </div>
              
              {/* Inactive fake files */}
              <div className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-[#57606a] dark:text-[#8b949e] border-r border-[#d0d7de]/40 dark:border-[#30363d]/40 shrink-0 select-none">
                <span className="text-[#f0883e] font-bold text-[9px]">[!]</span>
                <span>blocked_rules.json</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-[#57606a] dark:text-[#8b949e] border-r border-[#d0d7de]/40 dark:border-[#30363d]/40 shrink-0 select-none">
                <span>fiverr_terms.md</span>
              </div>
            </div>

            {/* Diagnostic Terminal Output Summary (Live indicator header) */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#f6f8fa]/50 dark:bg-[#161b22]/50 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono min-w-0">
                {matchedRanges.length > 0 ? (
                  <span className="text-[#f0883e] font-medium flex items-center gap-1.5 break-words">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#f0883e] animate-ping shrink-0"></span>
                    <span>[!] {matchedRanges.length} warning(s) detected. obfuscation recommended.</span>
                  </span>
                ) : (
                  <span className="text-[#3fb950] font-medium flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#3fb950] shrink-0"></span>
                    <span>[✓] 0 issues found in current buffer.</span>
                  </span>
                )}
              </div>

              {/* Undo/Redo Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
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
            <div className="flex flex-row flex-1 bg-[#fbfbfb] dark:bg-[#0a0e14] min-h-[280px] sm:min-h-[350px] overflow-hidden relative">
              
              {/* CODE LINE GUTTER (Non-selectable line counters) */}
              <div className="select-none text-right pr-2.5 pl-2.5 pt-3 sm:pr-4 sm:pl-4 sm:pt-4 border-r border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] shrink-0 font-mono text-[11px] sm:text-xs text-[#57606a] dark:text-[#8b949e] min-h-full">
                {Array.from({ length: Math.max(1, text.split('\n').length) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="editor-gutter-num flex items-center justify-end font-bold select-none whitespace-nowrap text-[#57606a]/80 dark:text-[#8b949e]/60" 
                    style={{ height: '1.625rem', lineHeight: '1.625rem' }}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>

              {/* CONTENT EDITABLE BUFFER */}
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-[#0a0e14] relative">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onMouseOver={handleEditorMouseOver}
                  onClick={handleEditorClick}
                  placeholder="Paste your Fiverr message here..."
                  className="w-full min-h-[280px] sm:min-h-[350px] outline-hidden font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words select-text empty:before:content-[attr(placeholder)] empty:before:text-[#57606a]/60 dark:empty:before:text-[#8b949e]/40 empty:before:pointer-events-none empty:before:italic text-[#24292f] dark:text-[#c9d1d9]"
                  style={{ minHeight: '280px', lineHeight: '1.625rem' }}
                />

                {/* Interactive Grammar & Spelling Tooltip Card */}
                <AnimatePresence>
                  {tooltipState && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      style={{
                        position: "fixed",
                        left: `${tooltipState.x}px`,
                        top: `${tooltipState.y}px`,
                        transform: "translate(-50%, -100%) translateY(-10px)"
                      }}
                      className="z-50 w-72 bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-lg p-3 shadow-2xl font-mono text-xs backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between border-b border-[#30363d] pb-2 mb-2">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-[#58a6ff]">
                          {tooltipState.issue.type}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          tooltipState.issue.severity === "spelling" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {tooltipState.issue.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2 text-xs">
                        <span className="line-through text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded font-medium">
                          {tooltipState.issue.original}
                        </span>
                        <span className="text-[#8b949e]">→</span>
                        <button
                          onClick={() => {
                            applySingleGrammarSuggestion(tooltipState.issue);
                            setTooltipState(null);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-0.5 rounded transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {tooltipState.issue.suggestion}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#8b949e] font-sans leading-relaxed mb-2 italic">
                        {tooltipState.issue.explanation}
                      </p>

                      <div className="flex items-center justify-end gap-2 border-t border-[#30363d] pt-2">
                        <button
                          onClick={() => setTooltipState(null)}
                          className="text-[10px] text-[#8b949e] hover:text-white px-2 py-1 rounded cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            applySingleGrammarSuggestion(tooltipState.issue);
                            setTooltipState(null);
                          }}
                          className="text-[10px] bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 px-2 py-1 rounded font-bold transition-all cursor-pointer"
                        >
                          Apply Fix
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Live system alerts */}
            <AnimatePresence>
              {obfuscatedFeedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#161b22] border-t border-[#3fb950]/30 px-3 py-2 sm:px-4 flex items-center justify-between"
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
                  className="bg-[#161b22] border-t border-[#f0883e]/30 px-3 py-2.5 sm:px-4"
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

            {/* INTEGRATED DEVELOPER CONSOLE DRAWER */}
            <div className="border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] shrink-0 font-mono">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#eaeef2] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-[11px] select-none">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setIsConsoleOpen(true); setActiveConsoleTab("terminal"); }}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      isConsoleOpen && activeConsoleTab === "terminal"
                        ? "text-[#58a6ff] font-bold bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-[#58a6ff]" />
                    <span>TERMINAL</span>
                    <span className="text-[9px] px-1 bg-[#58a6ff]/20 text-[#58a6ff] rounded-full font-bold">{terminalLogs.length}</span>
                  </button>

                  <button
                    onClick={() => { setIsConsoleOpen(true); setActiveConsoleTab("problems"); }}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      isConsoleOpen && activeConsoleTab === "problems"
                        ? "text-[#58a6ff] font-bold bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]"
                        : "text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white"
                    }`}
                  >
                    <AlertCircle className={`w-3 h-3 ${matchedRanges.length > 0 ? "text-[#f0883e]" : "text-[#3fb950]"}`} />
                    <span>PROBLEMS</span>
                    <span className={`text-[9px] px-1 rounded-full font-bold ${
                      matchedRanges.length > 0 ? "bg-[#f0883e]/20 text-[#f0883e]" : "bg-[#3fb950]/20 text-[#3fb950]"
                    }`}>{matchedRanges.length}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[#57606a] dark:text-[#8b949e]">
                  {isConsoleOpen && activeConsoleTab === "terminal" && (
                    <button
                      onClick={() => setTerminalLogs([])}
                      className="hover:text-[#f85149] cursor-pointer text-[10px] px-1.5 py-0.5 border border-[#d0d7de] dark:border-[#30363d] rounded"
                      title="Clear terminal logs"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className="hover:text-[#58a6ff] cursor-pointer"
                    title={isConsoleOpen ? "Collapse Console" : "Expand Console"}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isConsoleOpen ? "" : "rotate-180"}`} />
                  </button>
                </div>
              </div>

              {isConsoleOpen && (
                <div className="p-2 sm:p-3 max-h-36 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed bg-[#0a0e14] text-[#c9d1d9] border-b border-[#30363d]">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 pb-1.5 mb-1.5 border-b border-[#30363d]/60 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-[#58a6ff] font-bold">
                      <Zap className="w-3 h-3 text-[#58a6ff]" />
                      <span>Speed:</span> {liveWpm} WPM
                    </div>
                    <div className="flex items-center gap-1 text-[#3fb950] font-bold">
                      <HardDrive className="w-3 h-3 text-[#3fb950]" />
                      <span>Memory Consumed:</span> {memoryUsage}
                    </div>
                    <div className="flex items-center gap-1 text-[#8b949e]">
                      <Cpu className="w-3 h-3 text-[#3fb950]" />
                      <span>System:</span> Pure Client NLP
                    </div>
                  </div>

                  {activeConsoleTab === "terminal" ? (
                    terminalLogs.length === 0 ? (
                      <div className="text-[#8b949e] italic text-[10px] px-1">Console logs cleared. Ready for input events...</div>
                    ) : (
                      terminalLogs.map(log => (
                        <div key={log.id} className="flex items-start gap-2 font-mono hover:bg-[#161b22]/50 px-1 py-0.5 rounded">
                          <span className="text-[#8b949e] select-none text-[10px]">[{log.time}]</span>
                          {log.type === "sys" && <span className="text-[#58a6ff] font-bold text-[10px]">[SYS]</span>}
                          {log.type === "info" && <span className="text-[#3fb950] font-bold text-[10px]">[INFO]</span>}
                          {log.type === "warn" && <span className="text-[#f0883e] font-bold text-[10px]">[WARN]</span>}
                          {log.type === "success" && <span className="text-[#3fb950] font-bold text-[10px]">[OK]</span>}
                          <span className="text-[#c9d1d9] break-all">{log.text}</span>
                        </div>
                      ))
                    )
                  ) : (
                    matchedRanges.length === 0 ? (
                      <div className="text-[#3fb950] flex items-center gap-1.5 px-1 py-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>No restricted words or rule violations found in workspace.</span>
                      </div>
                    ) : (
                      matchedRanges.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 px-1 py-1 hover:bg-[#161b22] rounded text-[#f0883e]">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f0883e]"></span>
                            Restricted Word Flag: "{m.word}"
                          </span>
                          <span className="text-[#8b949e] text-[10px]">Index: {m.start}..{m.end}</span>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>

            {/* EDITOR TERMINAL STATUS BAR */}
            <div className="p-3 sm:p-4 bg-[#f6f8fa] dark:bg-[#161b22]/70 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Lines / Characters Counter / Speed & Memory Tracker */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-mono text-[#57606a] dark:text-[#8b949e]">
                <div>
                  ln <span className="font-semibold text-[#24292f] dark:text-white">{text.split('\n').length}</span>
                </div>
                <div>
                  col <span className="font-semibold text-[#24292f] dark:text-white">{charCount}</span>
                </div>
                <div>
                  words <span className="font-semibold text-[#24292f] dark:text-white">{wordCount}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] rounded font-bold text-[10px]" title="Live Typing Speed">
                  <Zap className="w-3 h-3 text-[#58a6ff]" />
                  <span>{liveWpm} WPM</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] rounded font-bold text-[10px]" title="RAM / Memory Consumed by Site/Editor">
                  <HardDrive className="w-3 h-3 text-[#3fb950]" />
                  <span>{memoryUsage}</span>
                </div>
              </div>

              {/* Monospace Action Buttons */}
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
                <button
                  id="detect-words-button"
                  onClick={triggerManualDetect}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-[11px] sm:text-xs font-bold font-mono rounded-md transition-colors flex items-center gap-1.5 cursor-pointer h-8"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Detect Words</span>
                </button>

                {matchedRanges.length > 0 && (
                  <button
                    onClick={triggerObfuscation}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#f0883e] to-[#f0883e]/90 hover:from-[#f0883e]/90 hover:to-[#f0883e]/80 text-white text-[11px] sm:text-xs font-bold font-mono rounded-md transition-colors border border-transparent flex items-center gap-1.5 cursor-pointer h-8"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Obfuscate</span>
                  </button>
                )}

                {/* Pure Client NLP Indicator */}
                <div className="flex bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md px-2 py-1 text-[10px] font-bold font-mono h-8 items-center text-[#3fb950] shrink-0 gap-1" title="Pure Client-Side NLP Engine (Zero Server Dependencies)">
                  <Cpu className="w-3 h-3 text-[#3fb950]" />
                  <span>Client NLP</span>
                </div>

                <button
                  onClick={() => checkGrammarWithAI(true)}
                  disabled={isGrammarChecking}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#ffffff] dark:bg-[#0d1117] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] text-[11px] sm:text-xs font-medium font-mono rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer h-8"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>{isGrammarChecking ? "Scanning..." : "Scan Grammar"}</span>
                </button>

                <button
                  onClick={handleSaveCurrentAsTemplateTrigger}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-[11px] sm:text-xs font-bold font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer h-8"
                  title="Save current editor content as a reusable template"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Template</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1dbf73] hover:bg-[#1dbf73]/95 text-white text-[11px] sm:text-xs font-bold font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer h-8 shadow-[0_0_12px_rgba(29,191,115,0.3)] active:scale-[0.98] border-none"
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
          <span>Bad Word Sanitizer &copy; {new Date().getFullYear()} — Fiverr-Safe Sanitizer</span>
          <span className="font-semibold text-[#24292f] dark:text-[#c9d1d9]">Built by Subroto Kumar Barman</span>
        </div>
      </footer>

      {/* ==========================================
          DYNAMIC TEMPLATE CREATOR / EDITOR DIALOG
          ========================================== */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4">
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
              className="bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 sm:p-6 max-w-md w-[92vw] sm:w-full relative z-10 font-mono text-xs text-[#24292f] dark:text-[#c9d1d9] max-h-[90vh] overflow-y-auto"
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
      <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-full sm:max-w-sm pointer-events-none">
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

      {/* ==========================================
          COMMAND PALETTE OVERLAY MODAL (⌘K)
          ========================================== */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative w-full max-w-xl bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-10 font-mono text-xs"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117]">
                <Search className="w-4 h-4 text-[#58a6ff]" />
                <input
                  type="text"
                  value={commandPaletteQuery}
                  onChange={(e) => setCommandPaletteQuery(e.target.value)}
                  placeholder="Type a command or search actions..."
                  className="w-full bg-transparent outline-hidden text-[#24292f] dark:text-white placeholder:text-[#57606a] dark:placeholder:text-[#8b949e] font-mono text-xs"
                  autoFocus
                />
                <kbd className="px-1.5 py-0.5 bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-[9px] text-[#57606a] dark:text-[#8b949e]">ESC</kbd>
              </div>

              {/* Command List */}
              <div className="p-2 max-h-80 overflow-y-auto space-y-1">
                {[
                  {
                    id: "obfuscate",
                    title: "Obfuscate Restricted Terms",
                    icon: Shield,
                    color: "text-[#f0883e]",
                    shortcut: "Transform",
                    action: () => { triggerObfuscation(); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "detect",
                    title: "Re-Detect Forbidden Words",
                    icon: RefreshCw,
                    color: "text-[#58a6ff]",
                    shortcut: "Rescan",
                    action: () => { triggerManualDetect(); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "grammar",
                    title: "Run Pure Client-Side NLP Scan",
                    icon: Sparkles,
                    color: "text-[#58a6ff]",
                    shortcut: "Audit",
                    action: () => { checkGrammarWithAI(true); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "copy",
                    title: "Copy Plain Text Result",
                    icon: Copy,
                    color: "text-[#3fb950]",
                    shortcut: "Clipboard",
                    action: () => { handleCopy(); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "templates",
                    title: "Toggle Templates Explorer",
                    icon: FileText,
                    color: "text-[#58a6ff]",
                    shortcut: "Drawer",
                    action: () => { setIsTemplatesDrawerOpen(!isTemplatesDrawerOpen); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "substring",
                    title: `Toggle Substring Grasping (${graspSubstrings ? "ACTIVE" : "OFF"})`,
                    icon: Search,
                    color: "text-[#58a6ff]",
                    shortcut: "Substrings",
                    action: () => {
                      setGraspSubstrings(!graspSubstrings);
                      addToast(`Substring grasping set to ${!graspSubstrings}`, "info");
                      setIsCommandPaletteOpen(false);
                    }
                  },
                  {
                    id: "theme",
                    title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
                    icon: theme === "dark" ? Sun : Moon,
                    color: "text-[#f0883e]",
                    shortcut: "Appearance",
                    action: () => { setTheme(theme === "dark" ? "light" : "dark"); setIsCommandPaletteOpen(false); }
                  },
                  {
                    id: "clear",
                    title: "Clear Editor Buffer",
                    icon: Trash2,
                    color: "text-[#f85149]",
                    shortcut: "Reset",
                    action: () => {
                      setText("");
                      updateEditorContentDirectly("");
                      addToast("Editor buffer cleared.", "info");
                      addLog("Editor buffer wiped by user.", "warn");
                      setIsCommandPaletteOpen(false);
                    }
                  }
                ]
                  .filter(cmd => cmd.title.toLowerCase().includes(commandPaletteQuery.toLowerCase()))
                  .map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] flex items-center justify-between text-[#24292f] dark:text-[#c9d1d9] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <cmd.icon className={`w-4 h-4 ${cmd.color}`} />
                        <span className="font-semibold text-xs">{cmd.title}</span>
                      </div>
                      <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] px-2 py-0.5 rounded">
                        {cmd.shortcut}
                      </span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          STICKY MOBILE TOOLBAR (Phone Responsiveness)
          ========================================== */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f6f8fa]/95 dark:bg-[#161b22]/95 backdrop-blur-md border-t border-[#d0d7de] dark:border-[#30363d] p-2 flex items-center justify-around shadow-lg font-mono">
        <button
          onClick={triggerManualDetect}
          className="flex flex-col items-center gap-1 text-[10px] text-[#58a6ff] p-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Detect</span>
        </button>

        <button
          onClick={triggerObfuscation}
          className={`flex flex-col items-center gap-1 text-[10px] p-1.5 cursor-pointer ${
            matchedRanges.length > 0 ? "text-[#f0883e] font-bold animate-pulse" : "text-[#57606a] dark:text-[#8b949e]"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Obfuscate</span>
        </button>

        <button
          onClick={checkGrammarWithAI}
          className="flex flex-col items-center gap-1 text-[10px] text-[#58a6ff] p-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Grammar</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 text-[10px] text-[#3fb950] font-bold p-1.5 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>

        <button
          onClick={() => setIsTemplatesDrawerOpen(!isTemplatesDrawerOpen)}
          className="flex flex-col items-center gap-1 text-[10px] text-[#58a6ff] p-1.5 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Templates</span>
        </button>
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
  checkGrammarWithAI: (isManual?: boolean) => void;
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
              className="flex-1 min-w-0 px-3 py-1.5 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-hidden focus:border-[#58a6ff] text-[#24292f] dark:text-[#c9d1d9] placeholder-[#57606a]/50 dark:placeholder-[#8b949e]/30 font-mono"
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
              className="w-full min-w-0 px-3 py-1.5 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[11px] outline-hidden focus:border-[#58a6ff] text-[#24292f] dark:text-[#c9d1d9] placeholder-[#57606a]/50 dark:placeholder-[#8b949e]/30 font-mono"
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
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-[#57606a] dark:text-[#484f58] select-none shrink-0">#</span>
                    <span className="font-medium truncate">{word}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(word)}
                    className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 text-[#57606a] dark:text-[#8b949e] hover:text-[#f85149] transition-all cursor-pointer shrink-0"
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
              <span>Basic Grammar Check</span>
            </h2>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1.5 font-sans">
              Instant client-side verification for essential capitalization, spacing, contractions, and basic punctuation.
            </p>
          </div>

          {/* Pure Client NLP Status & Action */}
          <div className="p-3 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex flex-col gap-3 font-mono shrink-0 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#57606a] dark:text-[#8b949e] uppercase">Engine:</span>
              <span className="text-[10px] px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] font-bold rounded flex items-center gap-1">
                <Check className="w-3 h-3 text-[#3fb950]" />
                <span>Basic Grammar Engine</span>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => checkGrammarWithAI(true)}
              disabled={isGrammarChecking}
              type="button"
              className="w-full py-2 bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGrammarChecking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking basic grammar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Scan Basic Grammar</span>
                </>
              )}
            </motion.button>
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
                {grammarSuggestions.length} basic issue{grammarSuggestions.length > 1 ? "s" : ""} found
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={applyAllGrammarSuggestions}
                type="button"
                className="px-2.5 py-1 bg-[#3fb950]/15 hover:bg-[#3fb950]/25 border border-[#3fb950]/40 text-[#3fb950] text-[10px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Fix All Basic Grammar</span>
              </motion.button>
            </div>
          )}

          {/* List of Grammar Issue Cards */}
          <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-[450px] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-2 bg-[#ffffff] dark:bg-[#0a0e14] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {grammarSuggestions.map((issue, idx) => {
                let sevBg = "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/30";
                if (issue.severity === "minor") sevBg = "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30";
                else if (issue.severity === "spelling") sevBg = "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30";
                
                return (
                  <motion.div
                    key={issue.startIndex + "-" + issue.original + "-" + idx}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex flex-col gap-2 font-mono text-xs text-[#24292f] dark:text-[#c9d1d9] shadow-xs"
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
                        Apply Fix
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {grammarSuggestions.length === 0 && (
              <div className="text-center py-8 text-[#57606a] dark:text-[#8b949e] h-full flex flex-col items-center justify-center">
                {isGrammarChecking ? (
                  <>
                    <RefreshCw className="w-6 h-6 text-[#58a6ff] animate-spin mb-2" />
                    <span className="text-xs font-mono">Scanning basic grammar...</span>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <CheckSquare className="w-7 h-7 text-[#3fb950] mb-2" />
                    <span className="text-xs font-sans italic font-bold text-[#3fb950]">Basic grammar is clean!</span>
                    <span className="text-[10px] font-sans text-center px-4 mt-1 leading-relaxed text-[#57606a] dark:text-[#8b949e]">
                      No capitalization, punctuation, or basic phrasing errors found.
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
