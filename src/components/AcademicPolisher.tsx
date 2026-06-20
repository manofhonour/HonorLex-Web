import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Undo,
  FileText, 
  AlertCircle, 
  ChevronRight, 
  HelpCircle,
  ToggleLeft,
  RefreshCw,
  SpellCheck,
  Award,
  Sliders,
  Flag,
  RotateCcw,
  BookOpen,
  Scale,
  EyeOff
} from 'lucide-react';
import { PolishResponse, ContextualSynonymResponse, PolishIssue, ChangeExplanation, AcademicRiskNote } from '../types';
import { simulatePolish } from '../lib/staticDemo';

interface AcademicPolisherProps {
  isStatic?: boolean;
  onOpenSynonyms: (word: string, phraseContext: string) => void;
  reloadState: any;
  onOperationComplete: (data: any) => void;
  text: string;
  setText: (t: string) => void;
  lang: 'en' | 'tr';
}

const TONES_DICT: Record<'en' | 'tr', Array<{ id: string; label: string }>> = {
  en: [
    { id: 'academic', label: 'Academic / High-Scholarly' },
    { id: 'objective', label: 'Objective / Unbiased' },
    { id: 'confident', label: 'Confident / Persuasive' },
    { id: 'tentative', label: 'Tentative / Cautious (Hedging)' },
    { id: 'direct', label: 'Direct / Clear prose' }
  ],
  tr: [
    { id: 'academic', label: 'Akademik / Yüksek Araştırmacı' },
    { id: 'objective', label: 'Objektif / Tarafsız Yaklaşım' },
    { id: 'confident', label: 'Kendinden Emin / İkna Edici' },
    { id: 'tentative', label: 'Temkini Koruyan (Hedging)' },
    { id: 'direct', label: 'Açık / Yalın Dil' }
  ]
};

const DIALECTS_DICT: Record<'en' | 'tr', Array<{ id: string; label: string }>> = {
  en: [
    { id: 'us', label: 'American English (US)' },
    { id: 'uk', label: 'British English (UK)' },
    { id: 'tr-us', label: 'Translate Turkish draft ➔ US English' },
    { id: 'tr-uk', label: 'Translate Turkish draft ➔ UK English' }
  ],
  tr: [
    { id: 'us', label: 'Amerikan İngilizcesi (US)' },
    { id: 'uk', label: 'Britanya İngilizcesi (UK)' },
    { id: 'tr-us', label: 'Türkçe Karalamayı Çevir ➔ US İngilizcesi' },
    { id: 'tr-uk', label: 'Türkçe Karalamayı Çevir ➔ UK İngilizcesi' }
  ]
};

const TASKS_DICT: Record<'en' | 'tr', Array<{ id: string; label: string; icon: any; description: string }>> = {
  en: [
    { id: 'grammar', label: 'Spelling & Grammar Fix', icon: SpellCheck, description: 'Correct errors, list issues.' },
    { id: 'rewrite', label: 'Scholarly Rewrite', icon: Award, description: 'Enhance academic flow and cohesion.' },
    { id: 'paraphrase', label: 'Smart Paraphrase', icon: RotateCcw, description: 'Recast phrases with multi-level variance.' },
    { id: 'formalize', label: 'Formalize Register', icon: Scale, description: 'Elevate casual speech to research grades.' },
    { id: 'simplify', label: 'Simplify & Clarify', icon: BookOpen, description: 'Enhance readability without data loss.' },
    { id: 'slip-slop', label: 'Slip-Slop', icon: EyeOff, description: 'Reduce formulaic & over-polished academic phrasing.' },
    { id: 'explain', label: 'Deconstruct & Explain', icon: Sliders, description: 'Rewrite & explain detail stylistic edits.' },
    { id: 'human', label: 'Organic Human Flow', icon: Sparkles, description: 'Vary rhythm, remove typical AI clichés.' },
    { id: 'shorten', label: 'Compress Narrative', icon: FileText, description: 'Deliver high punch in concise text.' },
    { id: 'expand', label: 'Elaborate Safely', icon: ChevronRight, description: 'Flesh out logical claims safely.' }
  ],
  tr: [
    { id: 'grammar', label: 'Yazım & Dilbilgisi Düzelt', icon: SpellCheck, description: 'Hataları bul ve listele.' },
    { id: 'rewrite', label: 'Akademik Yeniden Yazım', icon: Award, description: 'Bilimsel akıcılık ve tutarlılığı artır.' },
    { id: 'paraphrase', label: 'Anlam Korumalı Değişim', icon: RotateCcw, description: 'İfadeleri anlam kaybı olmadan çeşitlendir.' },
    { id: 'formalize', label: 'Seviyeyi Resmileştir', icon: Scale, description: 'Sıradan dili araştırma düzeyine yükselt.' },
    { id: 'simplify', label: 'Basitleştir & Netleştir', icon: BookOpen, description: 'Akıcılığı sade ama eksiksiz hale getir.' },
    { id: 'slip-slop', label: 'Slip-Slop Temizleyici', icon: EyeOff, description: 'Tekrarlayan ve aşırı yapay şablonları kaldır.' },
    { id: 'explain', label: 'Çözümle & Açıkla', icon: Sliders, description: 'Değişikliklerin gerekçesini detaylıca göster.' },
    { id: 'human', label: 'Doğal İnsan Akışı', icon: Sparkles, description: 'Yapay zeka kokan kalıpları ve ritimleri kaldır.' },
    { id: 'shorten', label: 'Metni Kısalt', icon: FileText, description: 'Fikirleri daha özcü ve vurucu bir dille yaz.' },
    { id: 'expand', label: 'Güvenle Detaylandır', icon: ChevronRight, description: 'Mantıksal iddiaları akademik kanıtlarla aç.' }
  ]
};

export default function AcademicPolisher({ 
  isStatic, 
  onOpenSynonyms, 
  reloadState, 
  onOperationComplete,
  text,
  setText,
  lang
}: AcademicPolisherProps) {
  const [selectedTask, setSelectedTask] = useState<string>('rewrite');
  const [selectedDialect, setSelectedDialect] = useState<string>('uk');
  const [selectedTone, setSelectedTone] = useState<string>('academic');
  const [paraphraseMode, setParaphraseMode] = useState<string>('balanced');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [polishResult, setPolishResult] = useState<PolishResponse | null>(null);
  const [polishingError, setPolishingError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedAltIdx, setCopiedAltIdx] = useState<number | null>(null);
  
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState<'issues' | 'changes' | 'risks'>('changes');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  // Dynamic sentence splitter
  const sentenceCount = text.trim() ? text.trim().split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0).length : 0;

  const getEstimatedReadingTime = (words: number) => {
    if (words === 0) return '0s';
    const wpm = 180; // Scholar standard reading pace
    const totalSeconds = Math.round((words / wpm) * 60);
    if (totalSeconds < 10) return '< 10s';
    if (totalSeconds < 60) return `~${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (secs === 0) return `~${mins} min`;
    return `~${mins}m ${secs}s`;
  };
  const readingTime = getEstimatedReadingTime(wordCount);

  // Sync internal states with historical reloads
  useEffect(() => {
    if (reloadState) {
      setText(reloadState.text || '');
      setSelectedTask(reloadState.task || 'rewrite');
      setSelectedDialect(reloadState.dialect || 'us');
      setSelectedTone(reloadState.tone || 'academic');
      setParaphraseMode(reloadState.paraphraseMode || 'balanced');
      setPolishResult(reloadState.result || null);
    }
  }, [reloadState]);

  const handlePolish = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setPolishingError(null);
    setPolishResult(null);

    if (isStatic) {
      setTimeout(() => {
        const resData = simulatePolish(text, selectedTask, selectedTone, selectedDialect);
        setPolishResult(resData);
        // Auto-set optimal diagnostic tab based on outcome
        if (resData.issues && resData.issues.length > 0) {
          setActiveDiagnosticTab('issues');
        } else if (resData.academic_risk_notes && resData.academic_risk_notes.length > 0) {
          setActiveDiagnosticTab('risks');
        } else {
          setActiveDiagnosticTab('changes');
        }

        // Record successful transaction to browser history
        onOperationComplete({
          text,
          task: selectedTask,
          dialect: selectedDialect,
          tone: selectedTone,
          paraphraseMode,
          result: resData
        });
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          task: selectedTask,
          paraphraseMode,
          tone: selectedTone,
          englishVariety: selectedDialect
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${response.status}`);
      }

      const resData = await response.json();
      setPolishResult(resData);
      
      // Auto-set optimal diagnostic tab based on outcome
      if (resData.issues && resData.issues.length > 0) {
        setActiveDiagnosticTab('issues');
      } else if (resData.academic_risk_notes && resData.academic_risk_notes.length > 0) {
        setActiveDiagnosticTab('risks');
      } else {
        setActiveDiagnosticTab('changes');
      }

      // Record successful transaction to browser history
      onOperationComplete({
        text,
        task: selectedTask,
        dialect: selectedDialect,
        tone: selectedTone,
        paraphraseMode,
        result: resData
      });
    } catch (err: any) {
      console.error('[Polish API error]:', err);
      setPolishingError(err.message || 'Failed to establish connection with HonorLex AI. Verify network state.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (content: string, isAlt: boolean = false, altIdx: number | null = null) => {
    navigator.clipboard.writeText(content);
    if (isAlt && altIdx !== null) {
      setCopiedAltIdx(altIdx);
      setTimeout(() => setCopiedAltIdx(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyAlternative = (altText: string, altIdx: number) => {
    if (!polishResult) return;
    const oldRevisedText = polishResult.revised_text;
    const updatedAlternatives = [...polishResult.alternatives];
    updatedAlternatives[altIdx] = oldRevisedText;
    
    setPolishResult({
      ...polishResult,
      revised_text: altText,
      alternatives: updatedAlternatives
    });
  };

  const handleClear = () => {
    setText('');
    setPolishResult(null);
    setPolishingError(null);
  };

  // Listen to mouse actions for word selections to invoke inline contextual synonym tracker
  const handleSelectionOrDoubleClick = () => {
    const area = textareaRef.current;
    if (!area) return;

    const start = area.selectionStart;
    const end = area.selectionEnd;
    
    // Check if user highlighted a specific word or phrase
    if (start !== end && end - start > 1 && end - start < 100) {
      const selectedWord = text.substring(start, end).trim();
      if (selectedWord && !selectedWord.includes('\n')) {
        // Build surrounding phrase paragraph context
        const contextStart = Math.max(0, start - 250);
        const contextEnd = Math.min(text.length, end + 250);
        const paragraphContext = text.substring(contextStart, contextEnd);

        onOpenSynonyms(selectedWord, paragraphContext);
      }
    }
  };

  const loadDemoText = () => {
    const demos: Record<string, string> = {
      grammar: "The participants of this study who does the EFL examinations clearly shows that translanguaging strategies are much more better than single language policy. Furthermore, it dont make any stupid anxiety for English language learners.",
      rewrite: "The primary purpose of this paper is to explore how L2 learners acquire syntax. We did various classroom runs, and we found that if you add collaborative tasks, the student gets pretty smart, pretty fast at speaking target languages.",
      paraphrase: "A high volume of researchers currently claim that integrating gamified mobile applications into English as a Foreign Language (EFL) classrooms can enhance vocabulary retention.",
      tr_us: "Yabancı dil olarak İngilizce öğretiminde (EFL), öğrencilerin anadillerini (L1) sınıf içinde stratejik olarak kullanmaları (translanguaging) öğrenme motivasyonunu artırır. Ancak bazı öğretmenler hala bunun sınıf içi hedef dili olumsuz etkileyeceğine inanmaktadır.",
      'slip-slop': "Overall, the quantitative results show that using MAXQDA for analyzing the qualitative findings sheds light on how SLA students learn. Taken together, it plays a crucial role and this suggests robust insights."
    };
    
    const targetKey = selectedDialect.startsWith('tr') ? 'tr_us' : selectedTask;
    setText(demos[targetKey] || demos.rewrite);
    setPolishResult(null);
    setPolishingError(null);
  };

  return (
    <div id="academic_polisher_module" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Controls & Input Drawer (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Main Text Editor Workspace Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
              <FileText className="w-4 h-4 text-cyan-400" />
              {lang === 'tr' ? "Orijinal Yazı Taslağı" : "Original Manuscript Draft"}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={loadDemoText}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                {lang === 'tr' ? "Örnek Yazı Yükle" : "Load Demo Script"}
              </button>
              {text && (
                <button 
                  onClick={handleClear}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                  title={lang === 'tr' ? "Metni Temizle" : "Clear Editor"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Privacy Note Banner */}
          <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400 font-sans">
            <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === 'tr' ? "Metniniz öneri üretmek amacıyla yapay zeka modeline iletilir. Lütfen kişisel veya hassas verilerinizi yapıştırmayın." : "Your text is processed through the AI model to generate suggestions. Do not paste sensitive personal data."}
            </p>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onMouseUp={handleSelectionOrDoubleClick}
              onDoubleClick={handleSelectionOrDoubleClick}
              rows={11}
              id="raw_manuscript_draft_input"
              className="w-full bg-slate-950/60 border border-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl p-4 text-xs font-sans text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-y selection:bg-cyan-500/30 selection:text-cyan-100"
              placeholder={lang === 'tr' ? "Akademik makale taslaklarınızı veya paragraflarınızı buraya yapıştırın... Bağlamsal akademik eş anlamlı sözlük yardımcısını açmak için bu paneldeki herhangi bir kelimeye çift tıklayabilirsiniz." : "Paste your research manuscript paragraphs or drafts here... Double-click any word or phrase in this pane to activate the contextual academic suggestion engine."}
            />
            
            {/* Inline Helpful Hint badge */}
            <div className="absolute bottom-3 right-3 text-[9px] text-slate-550 font-mono tracking-wider bg-slate-950/90 px-2 py-0.5 rounded border border-slate-900/80 pointer-events-none select-none uppercase">
              {lang === 'tr' ? "kelimelere çift tıklayarak eş anlamlı arayın" : "double-click words for synonym helper"}
            </div>
          </div>

          {/* Real-Time Document Statistics & Reading Time Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5" id="manuscript_realtime_counters">
            <div className="bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 p-2.5 rounded-xl text-center space-y-1 transition duration-200 shadow-inner">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider block">{lang === 'tr' ? "Kelime" : "Words"}</span>
              <span className="text-sm font-mono font-black text-cyan-400" id="counter_word_val">
                {wordCount.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 p-2.5 rounded-xl text-center space-y-1 transition duration-200 shadow-inner">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider block">{lang === 'tr' ? "Karakter" : "Characters"}</span>
              <span className="text-sm font-mono font-semibold text-slate-300" id="counter_char_val">
                {charCount.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 p-2.5 rounded-xl text-center space-y-1 transition duration-200 shadow-inner">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider block">{lang === 'tr' ? "Cümle" : "Sentences"}</span>
              <span className="text-sm font-mono font-semibold text-slate-300" id="counter_sentence_val">
                {sentenceCount.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 p-2.5 rounded-xl text-center space-y-1 transition duration-200 shadow-inner">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider block">{lang === 'tr' ? "Tahmini Okuma" : "Est. Reading Time"}</span>
              <span className="text-sm font-mono font-medium text-indigo-400 flex items-center justify-center gap-1.5" id="counter_read_time_val">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400/95 shrink-0" />
                {readingTime}
              </span>
            </div>
          </div>
        </div>

        {/* Polisher Config Panel Card */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-extrabold text-white text-xs md:text-sm uppercase tracking-wide">
              {lang === 'tr' ? "Bilimsel Ayarlar & Aksiyonlar" : "Scholarly Tuning & Actions"}
            </h3>
          </div>

          {/* Grid setup for secondary options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Target Dialect Box */}
            <div className="space-y-1.5">
              <label id="dialect_combo_label" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {lang === 'tr' ? "Hedef Dil Varyasyonu" : "Target Language Variety"}
              </label>
              <select
                id="dialect_variety_dropdown"
                value={selectedDialect}
                onChange={(e) => setSelectedDialect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {DIALECTS_DICT[lang].map((dial) => (
                  <option key={dial.id} value={dial.id} className="bg-slate-950 text-white font-sans">
                    {dial.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Academic Register Tone Box */}
            <div className="space-y-1.5">
              <label id="tone_combo_label" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {lang === 'tr' ? "Hedef Biçim Seviyesi & Ton" : "Target Style Register & Tone"}
              </label>
              <select
                id="tone_dropdown"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {TONES_DICT[lang].map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-950 text-white font-sans">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-paraphrase preferences: only visible if "paraphrase" task is selected */}
          {selectedTask === 'paraphrase' && (
            <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-2 mt-2 animation-ease-in-out">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
                {lang === 'tr' ? "Açımlama Tercihleri" : "Paraphrase Mode Preferences"}
              </span>
              <div className="flex gap-2">
                {['conservative', 'balanced', 'creative'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setParaphraseMode(m)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wide transition cursor-pointer ${
                      paraphraseMode === m
                        ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 'conservative' ? (lang === 'tr' ? 'Koruyucu' : 'Conservative') : m === 'balanced' ? (lang === 'tr' ? 'Dengeli' : 'Balanced') : (lang === 'tr' ? 'Yaratıcı' : 'Creative')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Task Action Selector Grid with scannable badges */}
          <div className="space-y-2">
            <span id="task_selector_label" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {lang === 'tr' ? "Temel Düzenleme & İyileştirme" : "Core Styling Operations"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TASKS_DICT[lang].map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTask === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(t.id)}
                    title={t.id === 'slip-slop' ? (lang === 'tr' ? "Anlamı korurken mekanik ve aşırı süslü akademik kalıpları seyreltir." : "Reduce formulaic and over-polished academic phrasing while preserving your meaning.") : t.description}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400/80 bg-cyan-950/10 text-slate-150 shadow shadow-cyan-950/30'
                        : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold truncate font-sans">
                        {t.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-sans">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Polish CTA action bar */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-900 pt-3">
            {polishingError && (
              <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 bg-rose-950/20 border border-rose-950/40 px-3 py-1.5 rounded-lg max-w-sm">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{polishingError}</span>
              </div>
            )}
            
            <button
              onClick={handlePolish}
              disabled={loading || !text.trim()}
              id="polish_manuscript_btn"
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-950/20 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Styling Draft with Gemini API...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Apply Academic Polishing
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Results, Before/After & Diagnostics (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        {!polishResult && !loading ? (
          <div className="h-full min-h-[460px] bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
            <Sparkles className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
            <h3 className="font-display font-extrabold text-slate-400 text-sm md:text-base uppercase tracking-wide">
              Awaiting Document
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-2 font-sans">
              Apply a core styling operation on the left pane to analyze structural grammar items, change-explanations, and academic writing safety alerts side-by-side.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Outcome Card */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Revised Outcome Manuscript
                </span>
                
                {polishResult && (
                  <button
                    onClick={() => handleCopyText(polishResult.revised_text)}
                    className="px-2.5 py-1 bg-slate-90 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-350 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        Copy text
                      </>
                    )}
                  </button>
                )}
              </div>

              {loading ? (
                <div id="polished_outcome_skeleton" className="py-12 space-y-3">
                  <div className="h-4 bg-slate-900 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-slate-900 rounded w-full animate-pulse" />
                  <div className="h-4 bg-slate-900 rounded w-4/5 animate-pulse" />
                  <div className="h-4 bg-slate-900 rounded w-11/12 animate-pulse" />
                </div>
              ) : (
                polishResult && (
                  <div 
                    id="polished_manuscript_output"
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-xs text-slate-200 leading-relaxed font-sans select-text max-h-[280px] overflow-y-auto"
                  >
                    {polishResult.revised_text}
                  </div>
                )
              )}
            </div>

            {/* Alternatives Drawer (Only shown for paraphrase or if available) */}
            {polishResult && polishResult.alternatives && polishResult.alternatives.length > 0 && (
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-xl">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                  Other Style Variations Suggested
                </span>
                <div className="space-y-2">
                  {polishResult.alternatives.map((alt, aIdx) => (
                    <div 
                      key={`alt_${aIdx}`}
                      className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-450 font-bold capitalize">Variation #{aIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyAlternative(alt, aIdx)}
                            className="px-2 py-0.5 bg-cyan-950/45 hover:bg-cyan-900 border border-cyan-800/50 hover:border-cyan-500 text-cyan-400 text-[9.5px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 select-none font-sans"
                            title="Bu varyasyonu ana sonuç ekranına uygula"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            Apply / Uygula
                          </button>
                          <button
                            onClick={() => handleCopyText(alt, true, aIdx)}
                            className="text-slate-500 hover:text-cyan-400 transition cursor-pointer p-1 rounded hover:bg-slate-900"
                            title="Copy alternative"
                          >
                            {copiedAltIdx === aIdx ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{alt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic Control Tabs */}
            {polishResult && (
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4 shadow-xl">
                
                {/* Diagnostics Tab select menu */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-1 border border-slate-900 rounded-lg text-[10px] font-semibold">
                  <button
                    onClick={() => setActiveDiagnosticTab('changes')}
                    className={`flex-1 py-1 px-1.5 rounded transition font-bold font-mono tracking-wide cursor-pointer ${
                      activeDiagnosticTab === 'changes'
                        ? 'bg-slate-800 text-cyan-450 font-extrabold'
                        : 'text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    Changes ({polishResult.change_explanations.length})
                  </button>
                  <button
                    onClick={() => setActiveDiagnosticTab('issues')}
                    className={`flex-1 py-1 px-1.5 rounded transition font-bold font-mono tracking-wide cursor-pointer ${
                      activeDiagnosticTab === 'issues'
                        ? 'bg-slate-800 text-cyan-450 font-extrabold'
                        : 'text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    Errors ({polishResult.issues.length})
                  </button>
                  <button
                    onClick={() => setActiveDiagnosticTab('risks')}
                    className={`flex-1 py-1 px-1.5 rounded transition font-bold font-mono tracking-wide cursor-pointer ${
                      activeDiagnosticTab === 'risks'
                        ? 'bg-slate-800 text-cyan-455 font-extrabold'
                        : 'text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    Risks ({polishResult.academic_risk_notes.length})
                  </button>
                </div>

                {/* Tab Pane 1: Change explanations */}
                {activeDiagnosticTab === 'changes' && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {polishResult.change_explanations.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-sans italic text-center py-4">No major structural shifts identified. Text was polished minimally.</p>
                    ) : (
                      polishResult.change_explanations.map((ch, chIdx) => (
                        <div 
                          key={`ch_${chIdx}`}
                          className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono tracking-wider font-bold uppercase bg-slate-850 px-1.5 py-0.2 rounded text-slate-400 border border-slate-750">
                              {ch.type}
                            </span>
                          </div>
                          
                          {/* Diff representation layout */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
                            <div className="bg-rose-950/20 border border-rose-900/30 rounded p-1.5 line-through text-rose-450 truncate" title={ch.original}>
                              {ch.original || '(empty)'}
                            </div>
                            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded p-1.5 text-emerald-400 font-semibold truncate" title={ch.revised}>
                              {ch.revised}
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-slate-350 leading-relaxed font-sans pl-2 border-l border-slate-800">
                            {ch.reason}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab Pane 2: Spelling/Grammar Errors found */}
                {activeDiagnosticTab === 'issues' && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {polishResult.issues.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-sans italic text-center py-4">Congratulations! No orthographical or grammatical errors detected.</p>
                    ) : (
                      polishResult.issues.map((iss, iIdx) => (
                        <div 
                          key={`iss_${iIdx}`}
                          className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono tracking-wider font-bold uppercase bg-slate-850 px-1.5 py-0.2 rounded text-slate-400 border border-slate-750">
                              {iss.category.replace('_', ' ')}
                            </span>
                            <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              iss.severity === 'high' 
                                ? 'bg-rose-950/40 border-rose-800/80 text-rose-450' 
                                : iss.severity === 'medium'
                                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-450'
                                  : 'bg-slate-800 border-slate-700 text-slate-350'
                            }`}>
                              {iss.severity} risk
                            </span>
                          </div>
                          
                          <div className="text-[11px] font-sans flex flex-col gap-0.5 leading-relaxed mt-1">
                            <p className="text-slate-400 line-through">
                              Original phrase: <span className="font-semibold text-rose-400">"{iss.original}"</span>
                            </p>
                            <p className="text-slate-300 font-medium">
                              Recommendation: <span className="font-bold text-emerald-400">"{iss.suggestion}"</span>
                            </p>
                            <p className="text-slate-450 text-[10.5px] italic border-l border-slate-800 pl-2 mt-1">
                              {iss.explanation}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab Pane 3: Academic risk notes */}
                {activeDiagnosticTab === 'risks' && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {polishResult.academic_risk_notes.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-sans italic text-center py-4">No logical, hedging or referencing risks flagged in this draft.</p>
                    ) : (
                      polishResult.academic_risk_notes.map((risk, rIdx) => (
                        <div 
                          key={`risk_${rIdx}`}
                          className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center gap-1 text-rose-500">
                            <Flag className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-wide font-display text-rose-400">
                              {risk.risk}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                            {risk.explanation}
                          </p>

                          <div className="text-[11px] bg-slate-900 p-2 border border-slate-850 rounded text-emerald-400 font-medium font-sans">
                            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block mb-1">Prescription advice</span>
                            {risk.suggestion}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
