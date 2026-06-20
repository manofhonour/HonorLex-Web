import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Lightbulb,
  BookMarked, 
  FileSearch, 
  Cpu, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CornerDownRight, 
  ArrowRightLeft,
  ChevronRight,
  Info,
  Clock,
  Trash2,
  Download,
  ChevronDown,
  Check,
  FileText,
  BookOpen,
  Zap,
  Compass,
  Cloud,
  CloudUpload,
  CloudLightning,
  Trash,
  Edit2,
  Save,
  Loader2,
  Database,
  Lock,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';

import { ContextualSynonymResponse } from './types';
import AcademicPolisher from './components/AcademicPolisher';
import CitationAuditor from './components/CitationAuditor';
import BibliographyScanner from './components/BibliographyScanner';
import SynonymDrawer from './components/SynonymDrawer';
import ScholarlyHub from './components/ScholarlyHub';
import ELTWritingCoach from './components/ELTWritingCoach';
import TopicSuggestor from './components/TopicSuggestor';
import GeminiChatbot from './components/GeminiChatbot';
import { isStaticDemoMode, setStaticDemoMode, simulateContextualSynonyms } from './lib/staticDemo';
import AuthManager from './components/AuthManager';
import { saveOutput, fetchSavedOutputs, deleteSavedOutput, updateSavedOutput, SavedOutput } from './lib/dbService';
import { translations } from './lib/translations';

interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'polisher' | 'auditor' | 'scanner';
  label: string;
  data: any;
}


function countSyllablesInWord(word: string): number {
  word = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;
  let count = 0;
  const vowels = "aeiouy";
  let isPrevVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !isPrevVowel) {
      count++;
    }
    isPrevVowel = isVowel;
  }

  if (word.endsWith('e')) {
    if (word.length > 2 && !vowels.includes(word[word.length - 2])) {
      count--;
    }
  }

  return count > 0 ? count : 1;
}

function calculateFleschKincaid(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ease: 100, grade: 0, label: 'No Text', color: 'text-slate-400 border-slate-900 bg-slate-950/20' };
  }

  const sentences = trimmed.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  const words = trimmed.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length || 1;

  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countSyllablesInWord(w);
  }

  const asl = wordCount / sentenceCount;
  const asw = syllableCount / wordCount;

  let ease = 206.835 - (1.015 * asl) - (84.6 * asw);
  let grade = (0.39 * asl) + (11.8 * asw) - 15.59;

  ease = Math.max(0, Math.min(100, ease));
  grade = Math.max(0, grade);

  let label = 'Easy';
  let color = 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20';

  if (grade > 16) {
    label = 'Graduate/PhD';
    color = 'text-purple-400 border-purple-900/40 bg-purple-950/20';
  } else if (grade > 12) {
    label = 'Undergraduate';
    color = 'text-indigo-400 border-indigo-900/40 bg-indigo-950/20';
  } else if (grade > 10) {
    label = 'High School';
    color = 'text-cyan-400 border-cyan-900/40 bg-cyan-950/20';
  } else if (grade > 7) {
    label = 'Junior High';
    color = 'text-amber-400 border-amber-900/40 bg-amber-950/20';
  } else {
    label = 'Elementary';
    color = 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20';
  }

  return {
    ease: Math.round(ease * 10) / 10,
    grade: Math.round(grade * 10) / 10,
    label,
    color,
    wordCount,
    sentenceCount
  };
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'tr'>(() => {
    const saved = localStorage.getItem('honorlex_lang');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });

  useEffect(() => {
    localStorage.setItem('honorlex_lang', lang);
  }, [lang]);

  const [activeTab, setActiveTab] = useState<'polisher' | 'coach' | 'suggestor' | 'auditor' | 'scanner' | 'hub' | 'chat'>('polisher');
  const [isStatic, setIsStatic] = useState<boolean>(false);
  const [apiHealthError, setApiHealthError] = useState<string | null>(null);

  // Readability font scale state (Yazı Puntosu) - large (Büyük) olarak sabitlendi
  const [fontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  useEffect(() => {
    setIsStatic(isStaticDemoMode());
  }, []);

  useEffect(() => {
    if (isStatic) {
      setApiHealthError(null);
      return;
    }

    fetch('/api/health')
      .then(async (res) => {
        if (res.status === 404) {
          setApiHealthError("Vercel API function is not deployed. Check /api/[...path].ts and vercel.json.");
          return;
        }
        if (!res.ok) {
          setApiHealthError(`Server health check failed with status ${res.status} (${res.statusText})`);
          return;
        }
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.hasGeminiKey === false) {
            setApiHealthError("GEMINI_API_KEY is missing in Vercel Environment Variables.");
          } else {
            setApiHealthError(null);
          }
        } catch (parseErr: any) {
          console.error("Health check response parsing failed:", parseErr, "Text:", text);
          setApiHealthError(`Unrecognized response format from server health endpoint. Raw: "${text.substring(0, 80)}"`);
        }
      })
      .catch((err) => {
        console.error("Health check fetch failed:", err);
        setApiHealthError(`Health check connection failed: ${err.message || err}`);
      });
  }, [isStatic]);

  const handleToggleStaticMode = (val: boolean) => {
    setStaticDemoMode(val);
    setIsStatic(val);
  };
  
  // Workspace history logging states
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Firebase Auth & Cloud Savings State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [cloudOutputs, setCloudOutputs] = useState<SavedOutput[]>([]);
  const [isFetchingCloud, setIsFetchingCloud] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'local' | 'cloud'>('local');
  
  // Custom manual Save to Cloud workflow states
  const [outputToSave, setOutputToSave] = useState<HistoryItem | null>(null);
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [saveNotes, setSaveNotes] = useState<string>('');
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);

  // Editing existing saved state
  const [editingDoc, setEditingDoc] = useState<SavedOutput | null>(null);

  const loadCloudOutputs = async () => {
    if (!firebaseUser) return;
    setIsFetchingCloud(true);
    try {
      const data = await fetchSavedOutputs(firebaseUser.uid);
      setCloudOutputs(data);
    } catch (err) {
      console.error("Error fetching cloud data:", err);
    } finally {
      setIsFetchingCloud(false);
    }
  };

  useEffect(() => {
    if (firebaseUser && isHistoryOpen) {
      loadCloudOutputs();
    }
  }, [firebaseUser, isHistoryOpen]);

  // States to pass down list values for reloading
  const [polisherReload, setPolisherReload] = useState<any>(null);
  const [auditorReload, setAuditorReload] = useState<any>(null);
  const [scannerReload, setScannerReload] = useState<any>(null);

  // Load history logs from browser localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('honorlex_history_pro');
    if (saved) {
      try {
        setHistory(JSON.parse(saved).slice(0, 10));
      } catch (err) {
        console.error('Failed parsing history database:', err);
      }
    }
  }, []);

  const handleRecordOperation = (type: 'polisher' | 'auditor' | 'scanner', data: any) => {
    let label = '';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'polisher') {
      const taskLabel = data.task.charAt(0).toUpperCase() + data.task.slice(1);
      const textPreview = data.text.length > 30 ? data.text.substring(0, 30) + '...' : data.text;
      label = `Polished: ${taskLabel} (${textPreview})`;
    } else if (type === 'auditor') {
      const textPreview = data.query.length > 30 ? data.query.substring(0, 30) + '...' : data.query;
      label = `Audited Reference: ${textPreview}`;
    } else if (type === 'scanner') {
      const textPreview = data.text.length > 30 ? data.text.substring(0, 30) + '...' : data.text;
      label = `Scanned list (${data.result.references?.length || 0} items) (${textPreview})`;
    }

    const newItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      timestamp: timeStr,
      type,
      label,
      data
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 10);
      localStorage.setItem('honorlex_history_pro', JSON.stringify(updated));
      return updated;
    });

    // Auto-save to cloud if user is signed in!
    if (firebaseUser) {
      saveOutput(firebaseUser.uid, {
        type: type,
        label: label,
        data: data,
        title: label.length > 40 ? label.substring(0, 40) + '...' : label,
        notes: `Otomatik olarak yedeklendi (${timeStr})`
      }).then(() => {
        loadCloudOutputs();
      }).catch(err => {
        console.error('Auto-save to cloud failed:', err);
      });
    }
  };

  const handleReloadHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.type);
    
    // Wipe others to avoid side conflicts
    setPolisherReload(null);
    setAuditorReload(null);
    setScannerReload(null);

    // Short timeout to trigger tab transition, then apply reloadState
    setTimeout(() => {
      if (item.type === 'polisher') {
        setPolisherReload(item.data);
      } else if (item.type === 'auditor') {
        setAuditorReload(item.data);
      } else if (item.type === 'scanner') {
        setScannerReload(item.data);
      }
    }, 50);

    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('honorlex_history_pro');
    
    setPolisherReload(null);
    setAuditorReload(null);
    setScannerReload(null);
  };

  // State filtering query for cloud outputs
  const [cloudSearchQuery, setCloudSearchQuery] = useState<string>('');

  const handleReloadCloudItem = (item: SavedOutput) => {
    setActiveTab(item.type as any);
    
    setPolisherReload(null);
    setAuditorReload(null);
    setScannerReload(null);

    setTimeout(() => {
      if (item.type === 'polisher') {
        setPolisherReload(item.data);
      } else if (item.type === 'auditor') {
        setAuditorReload(item.data);
      } else if (item.type === 'scanner') {
        setScannerReload(item.data);
      }
    }, 50);

    setIsHistoryOpen(false);
  };

  const handleDeleteCloudItem = async (e: React.MouseEvent, outputId: string) => {
    e.stopPropagation();
    if (!firebaseUser) return;
    if (window.confirm('Bu kaydı bulut deposundan kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteSavedOutput(firebaseUser.uid, outputId);
        setCloudOutputs((prev) => prev.filter((o) => o.id !== outputId));
      } catch (err) {
        console.error('Failed to delete cloud item:', err);
      }
    }
  };

  const handleUpdateCloudItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !editingDoc) return;
    try {
      await updateSavedOutput(firebaseUser.uid, editingDoc.id, {
        title: editingDoc.title,
        notes: editingDoc.notes || ''
      });
      setCloudOutputs((prev) =>
        prev.map((o) => (o.id === editingDoc.id ? { ...o, title: editingDoc.title, notes: editingDoc.notes } : o))
      );
      setEditingDoc(null);
    } catch (err) {
      console.error('Failed to update cloud item:', err);
    }
  };

  const handleManualSaveToCloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !outputToSave) return;
    setIsSavingToCloud(true);
    try {
      await saveOutput(firebaseUser.uid, {
        type: outputToSave.type,
        label: outputToSave.label,
        data: outputToSave.data,
        title: saveTitle.trim() || outputToSave.label,
        notes: saveNotes.trim()
      });
      setOutputToSave(null);
      setSaveTitle('');
      setSaveNotes('');
      loadCloudOutputs();
    } catch (err) {
      console.error('Manual save to cloud failed:', err);
    } finally {
      setIsSavingToCloud(false);
    }
  };


  // Shared state for Interactive Synonym swap
  const [editorText, setEditorText] = useState<string>(() => {
    return localStorage.getItem('honorlex_editor_text') || '';
  });
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [showExportFeedback, setShowExportFeedback] = useState<'txt' | 'docx' | null>(null);

  // Auto-saved toast notification state
  const [showAutosaveToast, setShowAutosaveToast] = useState<boolean>(false);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem('honorlex_editor_text', editorText);
      setShowAutosaveToast(true);

      const hideTimer = setTimeout(() => {
        setShowAutosaveToast(false);
      }, 1800);

      return () => clearTimeout(hideTimer);
    }, 1200); // 1.2s typing pause debounce

    return () => clearTimeout(timer);
  }, [editorText]);

  const handleExportManuscript = (format: 'txt' | 'docx') => {
    if (!editorText.trim()) return;

    if (format === 'txt') {
      const element = document.createElement("a");
      const file = new Blob([editorText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `HonorLex_Manuscript_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // High fidelity HTML-to-Docx compatibility template
      const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>HonorLex Scholarly Manuscript</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1.0in 1.0in 1.0in 1.0in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
              mso-paper-source: 0;
            }
            body {
              font-family: "Times New Roman", Times, serif;
              font-size: 12pt;
              line-height: 2.0;
              color: #000000;
            }
            .header-info {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              color: #555555;
              margin-bottom: 24pt;
              border-bottom: 1px solid #cccccc;
              padding-bottom: 6pt;
              line-height: 1.3;
            }
            h1 {
              font-family: Arial, sans-serif;
              font-size: 18pt;
              font-weight: bold;
              text-align: center;
              margin-top: 0;
              margin-bottom: 18pt;
              color: #111111;
            }
            p {
              margin-top: 0;
              margin-bottom: 12pt;
              text-indent: 0.5in;
              text-align: justify;
            }
            p.no-indent {
              text-indent: 0;
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <strong>HONORLEX PRO ACADEMIC SUITE</strong><br/>
            Export Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br/>
            Reading Metrics: ${editorText.split(/\\s+/).filter(Boolean).length} words | ${editorText.length} characters
          </div>
          
          <h1>Academic Manuscript Draft</h1>
          
          <div class="content">
            ${editorText
              .split('\n\n')
              .map((p, idx) => {
                const cleaned = p.trim().replace(/\n/g, '<br/>');
                if (!cleaned) return '';
                const className = idx === 0 ? 'class="no-indent"' : '';
                return `<p ${className}>${cleaned}</p>`;
              })
              .join('')}
          </div>
        </body>
        </html>
      `;
      
      const file = new Blob(['\ufeff' + template], { type: 'application/msword;charset=utf-8' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = `HonorLex_Manuscript_${new Date().toISOString().slice(0, 10)}.doc`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    
    setShowExportFeedback(format);
    setIsExportDropdownOpen(false);
    setTimeout(() => {
      setShowExportFeedback(null);
    }, 2500);
  };
  
  // Synonym drawer metrics state
  const [synonymWord, setSynonymWord] = useState<string>('');
  const [synonymContext, setSynonymContext] = useState<string>('');
  const [synonymData, setSynonymData] = useState<ContextualSynonymResponse | null>(null);
  const [synonymLoading, setSynonymLoading] = useState<boolean>(false);
  const [isSynonymOpen, setIsSynonymOpen] = useState<boolean>(false);

  // Shared state for citation verification target transition
  const [auditorQuery, setAuditorQuery] = useState<string>('');

  // Auto-focus single verification and populate
  const handleTransitionToSingleAudit = (rawCitation: string) => {
    // 1. Switch to Auditor tab
    setActiveTab('auditor');
    
    // 2. We can look up the element by ID and click, or let's use standard browser event trigger or direct document element injection!
    // Since CitationAuditor handles its own internal input state, let's write a simple selector dispatch or wait for DOM loading.
    setTimeout(() => {
      const field = document.getElementById('single_citation_input_field') as HTMLTextAreaElement;
      if (field) {
        field.value = rawCitation;
        // Trigger synthetic react onChange event
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(field, rawCitation);
        }
        const ev = new Event('input', { bubbles: true });
        field.dispatchEvent(ev);
        
        // Find and click the verification trigger
        const clickBtn = document.getElementById('verify_citation_cta_btn') as HTMLButtonElement;
        if (clickBtn) clickBtn.click();
      }
    }, 100);
  };

  // Double click / selection callback inside Academic Polisher
  const handleOpenSynonymDrawer = async (word: string, surroundingContext: string) => {
    setSynonymWord(word);
    setSynonymContext(surroundingContext);
    setIsSynonymOpen(true);
    setSynonymLoading(true);
    setSynonymData(null);

    if (isStatic) {
      setTimeout(() => {
        const dummy = simulateContextualSynonyms(word, surroundingContext);
        setSynonymData(dummy);
        setSynonymLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch('/api/contextual-synonyms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          sentence: word,
          paragraph: surroundingContext,
          tone: 'academic'
        })
      });

      if (!response.ok) {
        throw new Error(`Thesaurus API returned ${response.status}`);
      }

      const resData = await response.json();
      setSynonymData(resData);
    } catch (err) {
      console.error('[Thesaurus API error]:', err);
      // Construct logical minimal fallback response for better UX
      setSynonymData({
        selected_text: word,
        part_of_speech: 'noun / verb',
        detected_meaning: 'Parsed lexical reference token matching context.',
        sentence_context: word,
        paragraph_topic: 'general academic research',
        best_suggestion: { word: word, reason: 'Original selection term', fit_score: 100 },
        suggestions: [
          {
            word,
            fit_score: 95,
            register: 'academic',
            meaning_safety: 'safe',
            strength: 'similar',
            collocation_note: 'Maintains current sentence structure.',
            example_sentence: surroundingContext,
            comment: 'Original phrase matches standard terminology.'
          }
        ],
        avoid: [],
        meaning_warning: null,
        replacement_sentence: surroundingContext
      });
    } finally {
      setSynonymLoading(false);
    }
  };

  // Replace selected word in AcademicPolisher immediately with full word boundaries
  const handleApplySynonymIntoEditor = (newWord: string) => {
    if (!synonymWord) return;
    
    const textarea = document.getElementById('raw_manuscript_draft_input') as HTMLTextAreaElement;
    if (textarea) {
      const currentVal = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      let nextVal = '';
      if (start !== end) {
        // If there is active selection bounds, replace exactly at that coordinate span 
        nextVal = currentVal.substring(0, start) + newWord + currentVal.substring(end);
      } else {
        // Fallback string literal replace
        const escaped = synonymWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
        nextVal = currentVal.replace(regex, newWord);
      }

      // Propagate React state updates
      textarea.value = nextVal;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, nextVal);
      }
      const ev = new Event('input', { bubbles: true });
      textarea.dispatchEvent(ev);
    }

    setIsSynonymOpen(false);
  };

  const readability = calculateFleschKincaid(editorText);

  return (
    <div 
      id="honor_app_housing" 
      className={`min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans transition-all duration-200 ${
        fontSize === 'large' 
          ? 'font-scale-large' 
          : fontSize === 'xlarge' 
            ? 'font-scale-xlarge' 
            : ''
      }`}
    >
      
      {/* HEADER SECTION */}
      <header id="honor_corporate_header" className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand Brand & OK Logo */}
        <div className="flex items-center gap-3">
          <div 
            id="honor_ok_brand_logo"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 via-cyan-900 to-slate-900 border border-cyan-400/40 font-display font-extrabold flex items-center justify-center select-none shadow-md shrink-0 overflow-hidden"
            title="HonorLex Brand Shield"
          >
            <span className="text-lg font-black italic tracking-tighter text-cyan-400 leading-none flex items-center justify-center">
              O<span className="text-white">K</span>
            </span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-1.5">
              HonorLex
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
                PRO v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {translations[lang].brand_subtitle}
            </p>
          </div>
        </div>

        {/* Readability Score Metric Display */}
        <div id="readability_live_metric" className="flex items-center gap-3 bg-slate-900/35 hover:bg-slate-900/65 border border-slate-900 hover:border-slate-800/85 transition duration-200 rounded-xl px-4 py-1.8 text-xs font-sans max-w-full shadow-inner select-none">
          <div className="p-1.5 bg-cyan-950/40 border border-cyan-900/30 rounded-lg text-cyan-400 hidden sm:block shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                {translations[lang].readability_label}
              </span>
              {editorText.trim() ? (
                <>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold tracking-wider ${readability.color}`}>
                    GRADE {readability.grade}
                  </span>
                  <span className="text-slate-300 text-[11px] font-bold">({readability.label})</span>
                </>
              ) : (
                <span className="text-slate-500 text-[11px] font-medium italic">
                  {translations[lang].readability_empty}
                </span>
              )}
            </div>
            {editorText.trim() && (
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono flex items-center gap-2 flex-wrap">
                <span>{translations[lang].flesch_ease}: <strong className="text-slate-300">{readability.ease}</strong></span>
                <span className="text-slate-700 select-none">•</span>
                <span>{translations[lang].sentences}: <strong className="text-slate-300">{readability.sentenceCount}</strong></span>
                <span className="text-slate-700 select-none">•</span>
                <span>{translations[lang].words}: <strong className="text-slate-300">{readability.wordCount}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Action button controls */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Language flag selection tool */}
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-805 rounded-xl p-1 shrink-0" id="language_switcher_panel">
            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                lang === 'en'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title="Switch to English"
              id="switch_lang_en"
            >
              <span className="text-sm select-none">🇬🇧</span>
              <span className="text-[10px] font-mono">EN</span>
            </button>
            <button
              onClick={() => setLang('tr')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                lang === 'tr'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title="Türkçe'ye Geç"
              id="switch_lang_tr"
            >
              <span className="text-sm select-none">🇹🇷</span>
              <span className="text-[10px] font-mono">TR</span>
            </button>
          </div>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                if (!editorText.trim()) return;
                setIsExportDropdownOpen(!isExportDropdownOpen);
              }}
              disabled={!editorText.trim()}
              className={`flex items-center gap-1.5 px-3.5 py-1.8 border rounded-xl text-xs font-bold transition select-none shadow-md shrink-0 ${
                editorText.trim()
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-550 hover:from-cyan-550 hover:to-cyan-500 text-white border-cyan-500/30 cursor-pointer'
                  : 'bg-slate-900/40 text-slate-500 border-slate-900 cursor-not-allowed opacity-50'
              }`}
              title={editorText.trim() ? "Export current manuscript draft" : "Editor is empty - write or load some text first"}
              id="header_export_manuscript_btn"
            >
              <Download className="w-4 h-4" />
              <span>{translations[lang].export_title}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isExportDropdownOpen && (
                <>
                  {/* Backdrop hook to close dropdown on outside clicks */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsExportDropdownOpen(false)} />
                  
                  <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-1 block"
                    id="header_export_dropdown_menu"
                  >
                    <div className="px-2.5 py-1.5 border-b border-slate-900 mb-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider font-sans">
                        {translations[lang].export_select_format}
                      </span>
                    </div>

                    <button
                      onClick={() => handleExportManuscript('txt')}
                      className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition text-left font-sans"
                      id="export_txt_choice"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{translations[lang].export_plain_text}</span>
                    </button>

                    <button
                      onClick={() => handleExportManuscript('docx')}
                      className="w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition text-left font-sans"
                      id="export_docx_choice"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{translations[lang].export_word_doc}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Float visual toast/feedback on successful action */}
            <AnimatePresence>
              {showExportFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute right-0 top-11 bg-emerald-950 border border-emerald-800/80 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-emerald-400 shadow-xl whitespace-nowrap z-50 font-sans"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{translations[lang].export_toast_success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* Auth Manager Component */}
          <AuthManager onUserUpdate={setFirebaseUser} lang={lang} />

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.8 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition select-none shadow-md shrink-0"
            title="Open Recent Activities Logs"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{translations[lang].activity_logs} ({history.length})</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            {/* Live / Static Environment Mode Switcher with No-API-Key Explanation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-1.5 shrink-0 max-w-full" id="operation_mode_panel">
              <span className="text-[9.5px] font-mono text-slate-400 font-extrabold uppercase px-2 py-1 select-none flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{translations[lang].working_mode_title}</span>
              </span>
              
              <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded-xl border border-slate-900">
                <button
                  onClick={() => handleToggleStaticMode(true)}
                  className={`text-[9.5px] font-mono font-bold uppercase px-2.5 py-1.5 rounded-lg transition cursor-pointer select-none ${
                    isStatic 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Offline / Çevrimdışı Mod: Gemini API anahtarı olmadan tamamen yerel çalışır."
                  id="toggle_mode_offline"
                >
                  {translations[lang].off_mode}
                </button>
                <button
                  onClick={() => handleToggleStaticMode(false)}
                  className={`text-[9.5px] font-mono font-bold uppercase px-2.5 py-1.5 rounded-lg transition cursor-pointer select-none ${
                    !isStatic 
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-550 text-white font-black shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Yapay Zeka Modu: Canlı bulut sunucusu aracılığıyla Gemini 3.5 API'sini kullanan gelişmiş düzenleme modu."
                  id="toggle_mode_gemini"
                >
                  {translations[lang].on_mode}
                </button>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-2 text-[10px] text-slate-400 font-mono tracking-wide bg-slate-900/40 border border-slate-900/60 px-3 py-1.8 rounded-lg shrink-0">
              <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isStatic ? 'bg-amber-500' : 'bg-cyan-500'}`} />
              <span>
                {isStatic ? translations[lang].operating_offline_banner : translations[lang].working_state_indicator}
              </span>
            </div>
          </div>
        </div>

      </header>

      {/* CORE WORKSPACE CHASSIS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* Static Warning Banner */}
        {isStatic && (
          <div className="bg-amber-950/15 border border-amber-900/40 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in" id="static_pages_demo_banner">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-display">
                  {translations[lang].static_demo_title}
                </h4>
                <p className="text-[11.5px] text-slate-350 leading-relaxed mt-1">
                  {translations[lang].static_demo_desc}
                </p>
              </div>
            </div>
            <a 
              href="https://ais-pre-odzfkgjbbijylx4v566jwp-10706907376.europe-west1.run.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-405 text-slate-950 font-extrabold rounded-xl text-xs whitespace-nowrap transition cursor-pointer select-none shadow hover:shadow-amber-500/10 border border-amber-400/20 block text-center"
            >
              {translations[lang].static_demo_cta}
            </a>
          </div>
        )}
        {/* API Health / Deployment Error Banner */}
        {apiHealthError && (
          <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-2xl flex items-start gap-3 shadow-lg animate-fade-in" id="api_health_error_banner">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-display flex items-center gap-1.5">
                {translations[lang].system_env_api_warning}
              </h4>
              <p className="text-[11.5px] text-slate-300 leading-relaxed mt-1">
                {apiHealthError}
              </p>
            </div>
          </div>
        )}

        {/* Ethical compliance & warning notification top bar */}
        <div className="p-4 bg-slate-950/10 border border-amber-900/40 rounded-2xl flex items-start gap-3" id="legal_notice_bar">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest font-display">{translations[lang].ethical_notice_title}</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
              {translations[lang].ethical_notice_desc}
            </p>
          </div>
        </div>

        {/* Global tab control ribbon */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl">
          <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
            
            <button
              id="tab_trigger_polisher"
              onClick={() => setActiveTab('polisher')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'polisher'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Cpu className="w-4 h-4" />
              {translations[lang].tab_polisher}
            </button>

            <button
              id="tab_trigger_coach"
              onClick={() => setActiveTab('coach')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'coach'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {translations[lang].tab_coach}
            </button>

            <button
              id="tab_trigger_suggestor"
              onClick={() => setActiveTab('suggestor')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'suggestor'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              {translations[lang].tab_suggestor}
            </button>

            <button
              id="tab_trigger_auditor"
              onClick={() => setActiveTab('auditor')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'auditor'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              {translations[lang].tab_auditor}
            </button>

            <button
              id="tab_trigger_scanner"
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              {translations[lang].tab_scanner}
            </button>

            <button
              id="tab_trigger_hub"
              onClick={() => setActiveTab('hub')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4" />
              {translations[lang].tab_hub}
            </button>

            <button
              id="tab_trigger_chat"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {translations[lang].tab_chat}
            </button>

          </div>

          <div className="text-[10px] text-slate-500 font-mono tracking-wide px-3 select-none hidden sm:block">
            HonorLex Interactive Workspace
          </div>
        </div>

        {/* ACTIVE WORKSPACE GRID PANEL */}
        <div id="active_workspace_grid" className="min-h-[500px]">
          {activeTab === 'polisher' && (
            <AcademicPolisher 
              isStatic={isStatic}
              onOpenSynonyms={handleOpenSynonymDrawer} 
              reloadState={polisherReload}
              onOperationComplete={(data) => handleRecordOperation('polisher', data)}
              text={editorText}
              setText={setEditorText}
              lang={lang}
            />
          )}

          {activeTab === 'coach' && (
            <ELTWritingCoach 
              isStatic={isStatic}
              onOperationComplete={(data) => handleRecordOperation('coach' as any, data)}
              text={editorText}
              setText={setEditorText}
              lang={lang}
            />
          )}

          {activeTab === 'suggestor' && (
            <TopicSuggestor 
              isStatic={isStatic}
              lang={lang}
            />
          )}

          {activeTab === 'auditor' && (
            <CitationAuditor 
              isStatic={isStatic}
              reloadState={auditorReload}
              onOperationComplete={(data) => handleRecordOperation('auditor', data)}
              lang={lang}
            />
          )}

          {activeTab === 'scanner' && (
            <BibliographyScanner 
              isStatic={isStatic}
              onFocusSingleAudit={handleTransitionToSingleAudit} 
              reloadState={scannerReload}
              onOperationComplete={(data) => handleRecordOperation('scanner', data)}
              lang={lang}
            />
          )}

          {activeTab === 'hub' && (
            <ScholarlyHub text={editorText} isStatic={isStatic} lang={lang} />
          )}

          {activeTab === 'chat' && (
            <GeminiChatbot lang={lang} isStaticMode={isStatic} />
          )}
        </div>

      </main>

      {/* FOOTER METADATA INDICATORS */}
      <footer className="border-t border-slate-900 px-6 py-4 mt-auto bg-slate-950 text-slate-500 text-xs text-center font-mono leading-relaxed">
        <div>
          {translations[lang].footer_text}
        </div>
      </footer>

      {/* FLOAT CONTEXT DICTIONARY BACKED DRAWER */}
      <SynonymDrawer 
        isOpen={isSynonymOpen}
        onClose={() => setIsSynonymOpen(false)}
        synonymData={synonymData}
        loading={synonymLoading}
        onApplySynonym={handleApplySynonymIntoEditor}
      />

      {/* FLOAT ACTIVITY HISTORY LOGS DRAWER */}
      {isHistoryOpen && (
        <div 
          id="history_drawer_overlay"
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
        >
          {/* Click-outside zone */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsHistoryOpen(false)} />

          {/* Drawer Body */}
          <div 
            id="history_drawer_body"
            className="relative w-full max-w-md h-full bg-[#060913] border-l border-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-900 bg-slate-950/90 backdrop-blur space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-display font-extrabold text-white text-base md:text-lg">
                    Academic Archive Suite
                  </h3>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-8 h-8 rounded-lg border border-slate-800 hover:bg-slate-900 hover:text-rose-400 flex items-center justify-center text-slate-450 transition cursor-pointer font-bold text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Drawer Segmented Tab Control */}
              <div className="grid grid-cols-2 gap-1 bg-slate-950/80 p-1 border border-slate-900 rounded-xl">
                <button
                  onClick={() => setDrawerTab('local')}
                  className={`text-[10.5px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                    drawerTab === 'local'
                      ? 'bg-slate-900 text-cyan-400 border border-slate-800/40 shadow-sm'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Yerel Geçmiş ({history.length})
                </button>
                <button
                  onClick={() => {
                    setDrawerTab('cloud');
                    if (firebaseUser) loadCloudOutputs();
                  }}
                  className={`text-[10.5px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                    drawerTab === 'cloud'
                      ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/45 shadow-sm'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Sonsuz Bulut Arşivi {firebaseUser ? `(${cloudOutputs.length})` : ''}
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-slate-950/20">
              
              {drawerTab === 'local' ? (
                /* LOCAL HISTORY VIEW */
                <>
                  <div className="bg-slate-950/70 p-3.5 border border-slate-900 rounded-xl leading-relaxed font-sans text-[11px] text-slate-400 space-y-1.5">
                    <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Yerel Seans Hafızası
                    </p>
                    <p>
                      Son 10 bilimsel analiziniz tarayıcı belleğinde geçici olarak saklanır. Oturumu kapattığınızda sıfırlanır.
                    </p>
                    {firebaseUser && (
                      <p className="text-[10px] text-cyan-400/80 font-mono italic">
                        ✓ Buluta otomatik yedekleme senkronizasyonu aktif!
                      </p>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl">
                      <Clock className="w-8 h-8 text-slate-700 mb-2" />
                      <p className="text-xs text-slate-400 font-semibold font-display">
                        Kayıt Bulunmamaktadır
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                        Metin iyileştirme, kaynakça denetimi ve veri analizleriniz yapıldıkça burada listelenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-800 transition flex flex-col gap-2 cursor-pointer text-left group"
                          onClick={() => handleReloadHistoryItem(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {item.type === 'polisher' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                              {item.type === 'auditor' && <BookMarked className="w-3.5 h-3.5 text-emerald-400" />}
                              {item.type === 'scanner' && <FileSearch className="w-3.5 h-3.5 text-amber-400" />}
                              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400">
                                {item.type === 'polisher' ? 'Prose polisher' : item.type === 'auditor' ? 'Reference Auditor' : 'Bibliography Scanner'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {item.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                            {item.label}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900/40 mt-1">
                            {firebaseUser ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOutputToSave(item);
                                  setSaveTitle(item.label.length > 50 ? item.label.substring(0, 50) + '...' : item.label);
                                  setSaveNotes('');
                                }}
                                className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-950 text-cyan-400 border border-cyan-900/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                                title="Buluta özel başlıkla kaydet"
                              >
                                <CloudUpload className="w-3 h-3 text-cyan-400" />
                                Buluta Yedekle
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-500 italic block">Misafir Modu</span>
                            )}
                            <div className="text-[9px] font-semibold text-cyan-400 group-hover:underline flex items-center gap-1">
                              Geri Yükle &rarr;
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* CLOUD ARCHIVE VIEW */
                <>
                  {!firebaseUser ? (
                    <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl space-y-4">
                      <Cloud className="w-12 h-12 text-slate-600 mb-1" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200 font-display">BULUT ARŞİVİ KİLİTLİ</p>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                          Yazı taslaklarınızı, editör raporlarınızı ve doğrulanan kaynakçalarınızı limitsiz ve kalıcı olarak kaydetmek için giriş yapın!
                        </p>
                      </div>
                      <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl text-[10px] text-cyan-400 text-left space-y-1">
                        <p className="font-bold">✨ Bulutun Ayrıcalıkları:</p>
                        <p>&bull; Süre sınırı olmadan sonsuz saklama</p>
                        <p>&bull; İstediğin an, dilediğin cihazdan anında geri yükleme</p>
                        <p>&bull; Kayıtlara özel bilimsel etiket & not ekleme</p>
                      </div>
                      <p className="text-[10px] text-slate-500 italic font-mono">
                        Header alanındaki 'Giriş Yap' butonu ile anında profil oluşturabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    /* Authenticated Cloud Archive View with Search and Filter */
                    <div className="space-y-4">
                      {/* Search Box */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={cloudSearchQuery}
                          onChange={(e) => setCloudSearchQuery(e.target.value)}
                          placeholder="Arşivlenen kayıtlarda arayın..."
                          className="w-full bg-slate-950/60 border border-slate-900 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-slate-100"
                        />
                        {cloudSearchQuery && (
                          <button
                            onClick={() => setCloudSearchQuery('')}
                            className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-350 cursor-pointer"
                          >
                            Temizle
                          </button>
                        )}
                      </div>

                      {isFetchingCloud ? (
                        <div className="h-48 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                            <p className="text-[10px] text-slate-400 font-mono">Bilimsel depodan yükleniyor...</p>
                          </div>
                        </div>
                      ) : cloudOutputs.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl">
                          <CloudLightning className="w-8 h-8 text-slate-700 mb-2" />
                          <p className="text-xs text-slate-400 font-semibold font-display">BULUT BOMBOŞ</p>
                          <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                            Henüz buluta kaydedilmiş akademik çıktı görünmüyor. Sol taraftan işlem yapıldığında otomatik kaydolur ya da yerel geçmişten 'Buluta Yedekle' butonuyla kendi özel adınızla ekleyebilirsiniz!
                          </p>
                        </div>
                      ) : (
                        /* List of items */
                        <div className="space-y-2.5">
                          {cloudOutputs
                            .filter(co => 
                              co.title.toLowerCase().includes(cloudSearchQuery.toLowerCase()) || 
                              co.label.toLowerCase().includes(cloudSearchQuery.toLowerCase()) ||
                              (co.notes && co.notes.toLowerCase().includes(cloudSearchQuery.toLowerCase()))
                            )
                            .map((item) => (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-xl border border-slate-900 bg-[#090D1A]/60 hover:border-slate-800 transition flex flex-col gap-2 cursor-pointer text-left group"
                                onClick={() => handleReloadCloudItem(item)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-cyan-400">
                                    {item.type === 'polisher' && <Cpu className="w-3.5 h-3.5" />}
                                    {item.type === 'auditor' && <BookMarked className="w-3.5 h-3.5" />}
                                    {item.type === 'scanner' && <FileSearch className="w-3.5 h-3.5" />}
                                    <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400">
                                      {item.type === 'polisher' ? 'Manuscript Holist' : item.type === 'auditor' ? 'Ref Auditor' : 'Bib Scanner'}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {item.timestamp}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-slate-100 font-sans group-hover:text-cyan-400 transition-colors leading-relaxed">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10.5px] text-slate-400 line-clamp-1 italic font-sans">
                                    {item.label}
                                  </p>
                                  {item.notes && (
                                    <p className="text-[10px] text-slate-500 font-mono italic bg-slate-950/40 p-1.5 rounded border border-slate-900/60 leading-normal">
                                      Not: {item.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-slate-900/40 mt-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDoc(item);
                                      }}
                                      className="p-1.5 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                                      title="Kaydı Düzenle"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteCloudItem(e, item.id)}
                                      className="p-1.5 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                      title="Buluttan Kalıcı Olarak Sil"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-[9.5px] font-semibold text-cyan-400 font-mono flex items-center gap-1">
                                    Buluttan Geri Yükle &rarr;
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with Clear Trigger */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 font-mono">
                {firebaseUser ? 'Bulut Arşivi Güvenle Bağlandı' : 'Çevrimdışı Sürüm'}
              </span>
              {drawerTab === 'local' && history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.8 bg-rose-955/5 hover:bg-rose-950/20 border border-rose-900/30 hover:border-rose-900 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-1.5 cursor-pointer transition select-none font-sans"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Görünümü Temizle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG: MANUAL SAVE TO CLOUD POPUP MODAL */}
      <AnimatePresence>
        {outputToSave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090D1A] border border-cyan-900/40 rounded-3xl p-6 shadow-2xl space-y-4"
              id="manual_save_dialog"
            >
              <div className="flex items-center gap-2.5 text-cyan-400">
                <CloudUpload className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">Bulut Deposuna Kaydet</h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Metninize özel başlık ve araştırma notu ekleyin.</p>
                </div>
              </div>

              <form onSubmit={handleManualSaveToCloudSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Akademik Başlık:</label>
                  <input
                    type="text"
                    required
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Örn: Giriş Revizyonu v2 (Bilimsel Akış)"
                    className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 rounded-2xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/35 text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block block">Gözlem / Notlar (Opsiyonel):</label>
                  <textarea
                    value={saveNotes}
                    onChange={(e) => setSaveNotes(e.target.value)}
                    rows={3}
                    placeholder="Metniniz, atıflarınız veya sonraki çalışmalar için ek notları buraya ekleyin..."
                    className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 rounded-2xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/35 text-slate-200 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOutputToSave(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingToCloud}
                    className="px-5 py-2.2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
                  >
                    {isSavingToCloud ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>Kaydoluyor...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Kalıcı Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: EDIT CLOUD ENTRY DETAILS MODAL */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#090D1A] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
              id="edit_cloud_entry_dialog"
            >
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Edit2 className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">Bulut Kaydını Düzenle</h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Arşiv ismini veya gözlem notlarınızı yenileyin.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateCloudItem} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Başlık:</label>
                  <input
                    type="text"
                    required
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 rounded-2xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/35 text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Gözlem Notları:</label>
                  <textarea
                    value={editingDoc.notes}
                    onChange={(e) => setEditingDoc({ ...editingDoc, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-[#020510] border border-slate-900 focus:border-cyan-500 rounded-2xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/35 text-slate-200 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Non-intrusive 'Auto-saved' Toast Notification */}
      <AnimatePresence>
        {showAutosaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A1024]/90 backdrop-blur-md border border-indigo-500/30 rounded-2xl py-3 px-4 flex items-center gap-3 shadow-2xl shadow-indigo-500/10"
            id="autosave_toast_box"
          >
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cloud className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-sans font-extrabold text-slate-100 tracking-wide">Autosave</span>
              <span className="text-[10px] text-slate-400 font-sans leading-relaxed">{translations[lang].autosaved_toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
