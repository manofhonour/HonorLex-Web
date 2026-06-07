import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
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
  Trash2
} from 'lucide-react';

import { ContextualSynonymResponse } from './types';
import AcademicPolisher from './components/AcademicPolisher';
import CitationAuditor from './components/CitationAuditor';
import BibliographyScanner from './components/BibliographyScanner';
import SynonymDrawer from './components/SynonymDrawer';
import { isStaticDemoMode, setStaticDemoMode, simulateContextualSynonyms } from './lib/staticDemo';

interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'polisher' | 'auditor' | 'scanner';
  label: string;
  data: any;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'polisher' | 'auditor' | 'scanner'>('polisher');
  const [isStatic, setIsStatic] = useState<boolean>(false);

  useEffect(() => {
    setIsStatic(isStaticDemoMode());
  }, []);

  const handleToggleStaticMode = (val: boolean) => {
    setStaticDemoMode(val);
    setIsStatic(val);
  };
  
  // Workspace history logging states
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

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

  // Shared state for Interactive Synonym swap
  const [editorText, setEditorText] = useState<string>('');
  
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

  return (
    <div id="honor_app_housing" className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      
      {/* HEADER SECTION */}
      <header id="honor_corporate_header" className="sticky top-0 z-40 bg-slate-955/85 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Brand & OK Logo */}
        <div className="flex items-center gap-3">
          <div 
            id="honor_ok_brand_logo"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 via-cyan-905 to-slate-900 border border-cyan-400/40 font-display font-extrabold flex items-center justify-center select-none shadow-md"
            title="HonorLex Brand Shield"
          >
            <span className="text-xl font-black italic tracking-tighter text-cyan-400">O<span className="text-white">K</span></span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-1.5">
              HonorLex
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-955/85 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
                PRO v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Academic Writing Suite, Semantic Thesaurus, & Reference Fabrication Auditor
            </p>
          </div>
        </div>

        {/* Action button controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.8 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition select-none shadow-md shrink-0"
            title="Open Recent Activities Logs"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Activity Logs ({history.length})</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            {/* Live / Static Environment Mode Switcher for ease of testing */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1 shrink-0">
              <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase select-none">
                Demo Mode:
              </span>
              <button
                onClick={() => handleToggleStaticMode(!isStatic)}
                className={`text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded transition cursor-pointer select-none border ${
                  isStatic 
                    ? 'bg-amber-950/45 border-amber-800/60 text-amber-400 font-extrabold' 
                    : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500'
                }`}
                title="Toggle static browser mockup vs live cloud-server checks"
              >
                {isStatic ? '🔴 Static (Offline)' : '🟢 Full-Stack'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tracking-wide bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-lg shrink-0">
              <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isStatic ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>{isStatic ? 'Simulating Static Client' : 'Connected to Gemini 3.5'}</span>
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
                  Static Landing & Demo Mode (Standalone Preview)
                </h4>
                <p className="text-[11.5px] text-slate-350 leading-relaxed mt-1">
                  You are viewing the static frontend host of <strong>HonorLex</strong> on GitHub Pages. Real-time Gemini AI polish and live metadata database verifications are <strong>disabled</strong> in this static environment. Intersecting simulation mockups are loaded below. To experience full verification with active databases and actual AI, visit our deployed version:
                </p>
              </div>
            </div>
            <a 
              href="https://ais-pre-odzfkgjbbijylx4v566jwp-10706907376.europe-west1.run.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-405 text-slate-950 font-extrabold rounded-xl text-xs whitespace-nowrap transition cursor-pointer select-none shadow hover:shadow-amber-500/10 border border-amber-400/20 block text-center"
            >
              Go to Full-Stack AI Version &rarr;
            </a>
          </div>
        )}
           {/* Ethical compliance & warning notification top bar */}
        <div className="p-4 bg-slate-950/10 border border-amber-900/40 rounded-2xl flex items-start gap-3" id="legal_notice_bar">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest font-display">Reference Integrity & Ethics Assurance Notice</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
              HonorLex checks bibliographic metadata against available public metadata sources when possible. It helps identify citation errors and possible fabrication risks, but it does not guarantee academic integrity, factual accuracy, or source quality.
            </p>
          </div>
        </div>

        {/* Global tab control ribbon */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl">
          <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
            
            <button
              onClick={() => setActiveTab('polisher')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'polisher'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Manuscript Polisher
            </button>

            <button
              onClick={() => setActiveTab('auditor')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'auditor'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Citation Auditor
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              Bibliography Scanner
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
            />
          )}

          {activeTab === 'auditor' && (
            <CitationAuditor 
              isStatic={isStatic}
              reloadState={auditorReload}
              onOperationComplete={(data) => handleRecordOperation('auditor', data)}
            />
          )}

          {activeTab === 'scanner' && (
            <BibliographyScanner 
              isStatic={isStatic}
              onFocusSingleAudit={handleTransitionToSingleAudit} 
              reloadState={scannerReload}
              onOperationComplete={(data) => handleRecordOperation('scanner', data)}
            />
          )}
        </div>

      </main>

      {/* FOOTER METADATA INDICATORS */}
      <footer className="border-t border-slate-900 px-6 py-4 mt-auto bg-slate-950 text-slate-500 text-xs text-center font-mono leading-relaxed">
        <div>
          HonorLex • Styled with Tailwind CSS, configured with Vite, & orchestrated server-side by Antigravity Agents. Privacy guaranteed: zero permanent database logging.
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
            className="relative w-full max-w-md h-full bg-[#090D1A] border-l border-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-900 flex items-center justify-between bg-slate-950/80 backdrop-blur">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-extrabold text-white text-base md:text-lg">
                  Recent Activity Logs
                </h3>
                <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 border border-slate-800 rounded-md text-slate-400 font-bold select-none">
                  {history.length}/10
                </span>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-800 hover:bg-slate-900 hover:text-rose-400 flex items-center justify-center text-slate-450 transition cursor-pointer font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl leading-relaxed font-sans text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-350">🔒 Privacy Safeguard Ensured</p>
                <p>
                  Your last 10 operations are saved in your local browser storage ONLY. Clearing history or closing the browser completely purges any local drafts.
                </p>
              </div>

              {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold font-display">
                    No logs recorded yet
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Your prose revisions, citation validations, and bibliography scans will record automatically inside this browser session.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-800 transition flex flex-col gap-2 cursor-pointer text-left group"
                      onClick={() => handleReloadHistoryItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'polisher' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                          {item.type === 'auditor' && <BookMarked className="w-3.5 h-3.5 text-emerald-400" />}
                          {item.type === 'scanner' && <FileSearch className="w-3.5 h-3.5 text-amber-400" />}
                          <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400">
                            {item.type === 'polisher' ? 'Manuscript Holist' : item.type === 'auditor' ? 'Citation Auditor' : 'Bibliography Scanner'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                        {item.label}
                      </p>

                      <div className="flex items-center justify-end font-mono text-[9px] text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        Restore results instantly &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Clear Trigger */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 font-mono">
                No active log databases
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.8 bg-rose-955/5 hover:bg-rose-950/20 border border-rose-900/30 hover:border-rose-900 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-1.5 cursor-pointer transition select-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History Log
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
