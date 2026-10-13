import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Shield, 
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
import { typingTracker } from "./lib/typingSpeedTracker";
import { createRestrictedMatcher, MatchRange } from "./lib/restrictedMatcher";
import { obfuscateText } from "./lib/obfuscateText";
import { DEFAULT_RESTRICTED_WORDS, DEFAULT_TEMPLATES } from "@/Template/Template";



interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
}
const MAX_HIGHLIGHTED_MATCHES = 2000;
const MAX_DISPLAYED_MATCHES = 200;

function reportSlowStage(stage: string, durationMs: number, details: Record<string, number>) {
  if (import.meta.env.DEV && durationMs >= 50) {
    console.warn(`[Performance] ${stage} took ${durationMs.toFixed(1)} ms`, details);
  }
}




// ==========================================
// HELPER TYPES & FUNCTIONS
// ==========================================
interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
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

  // Typing Speed and Memory Consumption
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<string>("16.2 MB");

  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    const updateMemory = () => {
      if (typeof performance !== "undefined" && (performance as any).memory) {
        const usedBytes = (performance as any).memory.usedJSHeapSize;
        if (usedBytes && usedBytes > 0) {
          setMemoryUsage(`${(usedBytes / (1024 * 1024)).toFixed(1)} MB`);
          return;
        }
      }
      const heapEstimate = 15.2 + (textRef.current.length * 0.0004);
      setMemoryUsage(`${heapEstimate.toFixed(1)} MB`);
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  // System alerts / toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // DOM Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Compute matches & highlighted text with zero-latency memoization
  const matcher = useMemo(
    () => createRestrictedMatcher(restrictedWords, graspSubstrings),
    [restrictedWords, graspSubstrings]
  );
  const matchedRanges = useMemo(() => {
    const startedAt = performance.now();
    const result = matcher(text);
    reportSlowStage("restricted word detection", performance.now() - startedAt, {
      inputLength: text.length,
      patterns: restrictedWords.length,
      matches: result.length
    });
    return result;
  }, [matcher, text, restrictedWords.length]);

  const highlightedContent = useMemo(() => {
    const startedAt = performance.now();
    if (!text) return null;
    if (matchedRanges.length === 0) {
      reportSlowStage("highlight preparation", performance.now() - startedAt, {
        inputLength: text.length,
        matches: 0,
        highlightedMatches: 0
      });
      return text.endsWith("\n") ? text + " " : text;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const highlightCount = Math.min(matchedRanges.length, MAX_HIGHLIGHTED_MATCHES);
    for (let i = 0; i < highlightCount; i++) {
      const match = matchedRanges[i];
      if (match.start > lastIndex) {
        elements.push(text.slice(lastIndex, match.start));
      }
      const word = text.slice(match.start, match.end);
      elements.push(
        <mark
          key={`${match.start}-${i}`}
          className="bg-[rgba(240,136,62,0.22)] dark:bg-[rgba(240,136,62,0.35)] text-transparent border-b-2 border-[#f0883e] font-semibold rounded-[2px]"
        >
          {word}
        </mark>
      );
      lastIndex = match.end;
    }

    if (highlightCount < matchedRanges.length) {
      elements.push(text.slice(lastIndex));
    } else if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    if (text.endsWith("\n")) {
      elements.push(" ");
    }

    reportSlowStage("highlight preparation", performance.now() - startedAt, {
      inputLength: text.length,
      matches: matchedRanges.length,
      highlightedMatches: highlightCount
    });
    return elements;
  }, [text, matchedRanges]);

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

  const updateEditorContentDirectly = (_rawText?: string) => {
    // React state (setText) manages textarea value and backdrop overlay automatically
  };
  useEffect(() => {
    if (obfuscatedFeedback && text.indexOf("-") === -1) {
      setObfuscatedFeedback(null);
    }
  }, [text, obfuscatedFeedback]);

  // ==========================================
  // INPUT & SHORTCUT HANDLING
  // ==========================================
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    pushToHistory(newText, false);
    
    // Record keystroke for real-time WPM calculation
    const wpm = typingTracker.recordKeystroke(newText.length);
    setLiveWpm(wpm);
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = text.slice(0, start) + "  " + text.slice(end);

      setText(newText);
      pushToHistory(newText, false);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);

      const wpm = typingTracker.recordKeystroke(newText.length);
      setLiveWpm(wpm);
    }
  };

  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (backdropRef.current) {
        backdropRef.current.scrollTop = top;
        backdropRef.current.scrollLeft = left;
      }
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
    } else {
      addToast("Nothing to redo", "info");
    }
  };

  // ==========================================
  // BUTTON ACTIONS
  // ==========================================
  const handleClearEditor = () => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    setText("");
    setObfuscatedFeedback(null);
    typingTracker.reset();
    setLiveWpm(0);
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0;
      textareaRef.current.scrollLeft = 0;
      textareaRef.current.setSelectionRange(0, 0);
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = 0;
      backdropRef.current.scrollLeft = 0;
    }

    addToast("Editor buffer cleared.", "info");
    addLog("Editor buffer wiped by user.", "warn");
    setIsCommandPaletteOpen(false);
  };

  const triggerManualDetect = () => {
    if (matchedRanges.length > 0) {
      addToast(`Detected ${matchedRanges.length} restricted word(s)`, "info");
      addLog(`Linter re-scan complete: ${matchedRanges.length} restricted token(s) flagged.`, "warn");
    } else {
      addToast("No restricted words detected!", "success");
      addLog("Linter re-scan complete: 0 restricted tokens detected. Clean buffer.", "success");
    }
  };

  const triggerObfuscation = () => {
    if (matchedRanges.length === 0) {
      addToast("No words to obfuscate.", "info");
      addLog("Obfuscate triggered: buffer clean, 0 terms to transform.", "info");
      return;
    }
    const obText = obfuscateText(text, matchedRanges);
    setText(obText);
    pushToHistory(obText, true);
    setObfuscatedFeedback(`✅ ${matchedRanges.length} word(s) obfuscated`);
    addToast("Restricted terms hyphenated successfully!", "success");
    addLog(`Sanitizer transformed ${matchedRanges.length} flagged token(s) with hyphenation.`, "success");
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
    "Inbox Message Without Modification",
    "Fiverr Client Communication"
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
  // Word/char calculations
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const flaggedWords = useMemo(() => {
    const uniqueWords = new Set<string>();
    for (const match of matchedRanges) uniqueWords.add(match.word.toLowerCase());
    return [...uniqueWords];
  }, [matchedRanges]);
  const displayedMatchedRanges = matchedRanges.slice(0, MAX_DISPLAYED_MATCHES);

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

            {/* EDITOR WORKSPACE (High-Performance Overlay Textarea) */}
            <div className="flex flex-1 bg-[#fbfbfb] dark:bg-[#0a0e14] min-h-[280px] sm:min-h-[350px] overflow-hidden relative">
              {/* EDITOR CONTAINER WITH SYNCHRONIZED BACKDROP + TEXTAREA */}
              <div className="flex-1 relative min-h-[280px] sm:min-h-[350px] overflow-hidden bg-[#fbfbfb] dark:bg-[#0a0e14]">
                {/* HIGHLIGHT BACKDROP LAYER */}
                <div
                  ref={backdropRef}
                  aria-hidden="true"
                  className="absolute inset-0 p-3 sm:p-4 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none text-transparent border-none"
                  style={{ lineHeight: '1.625rem' }}
                >
                  {highlightedContent}
                </div>

                {/* FOREGROUND NATIVE TEXTAREA */}
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleTextAreaKeyDown}
                  onScroll={handleEditorScroll}
                  placeholder="Paste your Fiverr message here..."
                  className="absolute inset-0 w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words bg-transparent text-[#24292f] dark:text-[#c9d1d9] resize-none outline-none border-none focus:ring-0 selection:bg-[#58a6ff]/30"
                  style={{ lineHeight: '1.625rem' }}
                  spellCheck={false}
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
                    {flaggedWords.map((w, idx) => (
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
                      <span>System:</span> Restricted-word detection
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
                      displayedMatchedRanges.map((m, idx) => (
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
                  {activeConsoleTab === "problems" && matchedRanges.length > MAX_DISPLAYED_MATCHES && (
                    <div className="px-1 py-2 text-xs text-[#8b949e]">
                      Showing the first {MAX_DISPLAYED_MATCHES} of {matchedRanges.length} match rows. All matches remain active for detection and obfuscation.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* EDITOR TERMINAL STATUS BAR */}
            <div className="p-3 sm:p-4 bg-[#f6f8fa] dark:bg-[#161b22]/70 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Lines / Characters Counter / Speed & Memory Tracker */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-mono text-[#57606a] dark:text-[#8b949e]">
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
                  onClick={handleClearEditor}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#ffffff] dark:bg-[#0d1117] hover:bg-[#f85149]/10 border border-[#d0d7de] dark:border-[#30363d] text-[#f85149] text-[11px] sm:text-xs font-medium font-mono rounded-md transition-colors flex items-center gap-1.5 cursor-pointer h-8"
                  title="Clear the editor buffer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

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
            RIGHT WORKSPACE - RESTRICTED WORD RULES
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
                        maxLength={80}
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
                      handleClearEditor();
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
          onClick={handleClearEditor}
          className="flex flex-col items-center gap-1 text-[10px] text-[#f85149] p-1.5 cursor-pointer"
          title="Clear the editor buffer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>

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
// RENDER COMPONENT FOR RESTRICTED WORDS
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
}

function UnifiedSidebar({ restrictedWords, filteredWords, newWordInput, setNewWordInput, wordFilter, setWordFilter, handleAddWord, handleRemoveWord, handleResetWords, graspSubstrings, setGraspSubstrings }: UnifiedSidebarProps) {
  return (
    <div className="bg-[#f6f8fa] dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] p-4 flex flex-col gap-4 h-full">
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
              className="w-full py-2 bg-[#29C27A] border-[#29C27A] dark:bg-[#29C27A] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] text-white hover:text-[#f85149] border border-[#d0d7de] dark:border-[#29C27A] text-[#24292f] dark:text-[#c9d1d9] text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
      
    </div>
  );
}
