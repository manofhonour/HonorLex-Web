import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  Check, 
  Copy, 
  RotateCcw, 
  FileEdit, 
  RefreshCw, 
  CornerDownRight, 
  CheckCircle2, 
  MessageSquare,
  ShieldAlert,
  HelpCircle as HelpIcon,
  Globe,
  Link,
  Info
} from 'lucide-react';
import { runLocalCoachScan, generateGenericCritique } from '../lib/coachUtils.ts';

interface ELTWritingCoachProps {
  isStatic?: boolean;
  text: string;
  setText: (t: string) => void;
  lang: 'en' | 'tr';
  onOperationComplete?: (data: any) => void;
}

interface PitfallItem {
  id: string;
  category: string;
  severity: string;
  startIdx: number;
  originalPhrasing: string;
  suggestion: string;
  explanation: string;
  typeLabel: string;
}

export default function ELTWritingCoach({
  isStatic = false,
  text,
  setText,
  lang,
  onOperationComplete
}: ELTWritingCoachProps) {
  const [inputText, setInputText] = useState<string>(text || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [coachResult, setCoachResult] = useState<{
    pitfalls: PitfallItem[];
    overallCritique: string;
    suggestionsList: string[];
    is_fallback?: boolean;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'transition' | 'passive' | 'l1_interference' | 'cliché'>('all');
  const [selectedPitfall, setSelectedPitfall] = useState<PitfallItem | null>(null);
  const [rewriteTask, setRewriteTask] = useState<string>('slip-slop');
  const [rewriting, setRewriting] = useState<boolean>(false);
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync internal state with prop text when it loads initially
  useEffect(() => {
    if (text && !inputText) {
      setInputText(text);
    }
  }, [text]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleImportFromPolisher = () => {
    setInputText(text);
    showToast(lang === 'tr' ? "Metin İyileştiriciden kopyalandı." : "Imported text from Manuscript Polisher.");
  };

  const handleSyncToPolisher = () => {
    setText(inputText);
    showToast(lang === 'tr' ? "Metniniz ana İyileştiriciye aktarıldı." : "Synced text back to Manuscript Polisher.");
  };

  const localPitfalls = runLocalCoachScan(inputText);

  const handleRunCoachAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setRewriteResult(null);
    setSelectedPitfall(null);

    if (isStatic) {
      // Simulate API call
      setTimeout(() => {
        setCoachResult({
          pitfalls: localPitfalls,
          overallCritique: generateGenericCritique(inputText, localPitfalls.length),
          suggestionsList: [
            lang === 'tr' 
              ? "Akademik bağlaçlarda çeşitlilik sağlayarak okuyucunun mantıksal takibini kolaylaştırın." 
              : "Diversify your academic transitions to assist the reader's logical progression.",
            lang === 'tr' 
              ? "Gereksiz edilgen çatılardan kaçının; 'Çalışma gösterilmiştir' yerine 'Veriler ... ortaya koymaktadır' gibi etken fiiller kullanın." 
              : "Avoid excessive passive voice; utilize active reporting verbs to specify human or evidentiary agency.",
            lang === 'tr' 
              ? "Ana dildeki doğrudan çevirilerden (örn. 'research yapmak') kaçınarak doğru eşdizimlilikler kurun." 
              : "Eschew literal direct translations (e.g. 'making a research') in favor of standard disciplinary collocations.",
            lang === 'tr' 
              ? "Makale girişlerinde 'Günümüzün hızla değişen dünyasında' gibi basmakalıp ifadeler yerine doğrudan konuya odaklanın." 
              : "Omit universal cliché openings in abstracts or introductions to engage the editor directly."
          ]
        });
        setLoading(false);
        showToast(lang === 'tr' ? "Lokal Analiz Başarılı." : "Local Scan Compiled.");
      }, 700);
      return;
    }

    try {
      const res = await fetch('/api/coach-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          focusArea: 'all_pitfalls'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setCoachResult(data);
      if (onOperationComplete) {
        onOperationComplete({
          timestamp: new Date().toISOString(),
          type: 'elt_coach_review',
          textLength: inputText.length,
          pitfallsCount: data.pitfalls?.length || 0
        });
      }
    } catch (err: any) {
      console.error(err);
      // Fallback to local scan output
      setCoachResult({
        pitfalls: localPitfalls,
        overallCritique: generateGenericCritique(inputText, localPitfalls.length),
        suggestionsList: [
          "Diversify transition markers and sentence lengths.",
          "Check and reduce redundant passive Reporting frames.",
          "Verify grammatical SLA collocations to minimize L1 interference.",
          "Remove repetitive placeholder meta-text sequences."
        ],
        is_fallback: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Run initial analyze automatically or on submit
  useState(() => {
    if (inputText.trim()) {
      // safe trigger
    }
  });

  const handleRewriteSelectedPitfall = async (pitfall: PitfallItem) => {
    setRewriting(true);
    setRewriteResult(null);

    const replacementPrompt = `original: "${pitfall.originalPhrasing}", suggestion: "${pitfall.suggestion}", context: "${inputText.substring(Math.max(0, pitfall.startIdx - 40), Math.min(inputText.length, pitfall.startIdx + pitfall.originalPhrasing.length + 40))}"`;

    if (isStatic) {
      setTimeout(() => {
        const sentence = findSentenceContaining(inputText, pitfall.originalPhrasing);
        const corrected = sentence.replace(new RegExp(pitfall.originalPhrasing, 'i'), pitfall.suggestion);
        setRewriteResult(corrected);
        setRewriting(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: findSentenceContaining(inputText, pitfall.originalPhrasing),
          task: 'slip-slop',
          tone: 'academic'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRewriteResult(data.revised_text);
      } else {
        throw new Error();
      }
    } catch {
      const sentence = findSentenceContaining(inputText, pitfall.originalPhrasing);
      const corrected = sentence.replace(new RegExp(pitfall.originalPhrasing, 'i'), pitfall.suggestion);
      setRewriteResult(corrected);
    } finally {
      setRewriting(false);
    }
  };

  const handleApplyQuickFix = (pitfall: PitfallItem) => {
    const regex = new RegExp(escapeRegExp(pitfall.originalPhrasing), 'i');
    const updated = inputText.replace(regex, pitfall.suggestion);
    setInputText(updated);
    
    // Update local or coached pitfalls lists by removing the corrected item
    if (coachResult) {
      setCoachResult({
        ...coachResult,
        pitfalls: coachResult.pitfalls.filter(p => p.id !== pitfall.id)
      });
    }
    setSelectedPitfall(null);
    setRewriteResult(null);
    showToast(lang === 'tr' ? "Düzeltme başarıyla uygulandı!" : "Correction applied successfully!");
  };

  const findSentenceContaining = (fullText: string, substring: string): string => {
    const sentences = fullText.split(/[.!?]+(?:\s+|$)/);
    const match = sentences.find(s => s.toLowerCase().includes(substring.toLowerCase()));
    return match ? match.trim() + '.' : substring;
  };

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handlePolishingAction = async () => {
    if (!inputText.trim()) return;
    setRewriting(true);
    setRewriteResult(null);

    if (isStatic) {
      setTimeout(() => {
        let mocked = inputText;
        if (rewriteTask === 'simplify') {
          mocked = "We examined English acquisition in classrooms. Findings indicate that direct visual triggers increase focus levels substantially.";
        } else if (rewriteTask === 'slip-slop') {
          mocked = "Consequently, the empirical data suggests a substantial correlation; however, researchers should evaluate these parameters rigorously in further designs.";
        } else {
          mocked = "Notably, the preliminary review confirms that SLA scholars utilize active agency strategies to engage reading speeds.";
        }
        setRewriteResult(mocked);
        setRewriting(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          task: rewriteTask,
          tone: 'academic'
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setRewriteResult(data.revised_text);
    } catch {
      setRewriteResult(inputText + "\n\n(AI service experienced a temporary delay, check fallback registers)");
    } finally {
      setRewriting(false);
    }
  };

  const handleApplyBulkRewrite = () => {
    if (rewriteResult) {
      setInputText(rewriteResult);
      setRewriteResult(null);
      showToast(lang === 'tr' ? "Metin AI düzenlemesi ile güncellendi!" : "Text updated with AI rewrite!");
    }
  };

  // Helper to highlight terms inside text string
  const getRenderableJSXWithHighlights = () => {
    if (!inputText) return <span className="text-slate-500 italic font-sans">{lang === 'tr' ? "Ekran boş..." : "Paste something to analyze..."}</span>;

    const currentPitfalls = coachResult ? coachResult.pitfalls : localPitfalls;
    if (currentPitfalls.length === 0) return <span className="font-sans text-slate-300 leading-relaxed whitespace-pre-wrap">{inputText}</span>;

    // Sort pitfalls by startIdx
    const sorted = [...currentPitfalls].sort((a, b) => a.startIdx - b.startIdx);
    
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    sorted.forEach((pitfall, idx) => {
      const { startIdx, originalPhrasing } = pitfall;
      
      // Double check start index validity
      const actualOffset = inputText.toLowerCase().indexOf(originalPhrasing.toLowerCase(), lastIdx);
      if (actualOffset === -1) return;

      if (actualOffset > lastIdx) {
        elements.push(inputText.substring(lastIdx, actualOffset));
      }

      const categoryColors: { [key: string]: string } = {
        transition: 'bg-cyan-500/15 border-b-2 border-cyan-400 text-cyan-200 hover:bg-cyan-500/25',
        passive: 'bg-purple-500/15 border-b-2 border-purple-400 text-purple-200 hover:bg-purple-500/25',
        l1_interference: 'bg-rose-500/15 border-b-2 border-rose-450 text-rose-200 hover:bg-rose-500/25',
        cliché: 'bg-amber-500/15 border-b-2 border-amber-400 text-amber-200 hover:bg-amber-500/25',
        nominalization: 'bg-teal-500/15 border-b-2 border-teal-400 text-teal-200 hover:bg-teal-500/25'
      };

      const selectedClass = selectedPitfall?.id === pitfall.id ? 'ring-2 ring-white scale-102 transition' : '';

      elements.push(
        <span
          key={`highlight-${pitfall.id}-${idx}`}
          id={`coach-highlight-${pitfall.id}`}
          onClick={() => {
            setSelectedPitfall(pitfall);
            setRewriteResult(null);
          }}
          className={`cursor-pointer px-1 py-0.5 rounded mr-0.5 font-semibold transition duration-150 relative inline-block select-all ${categoryColors[pitfall.category] || 'bg-slate-800/80 border-b-2 border-slate-400 text-slate-100'} ${selectedClass}`}
          title={`${pitfall.typeLabel} -> click to inspect`}
        >
          {inputText.substring(actualOffset, actualOffset + originalPhrasing.length)}
          <span className="absolute -top-3.5 left-0 text-[8px] bg-slate-950 border border-slate-700 font-mono text-slate-400 px-1 py-px rounded tracking-tight uppercase leading-none select-none opacity-0 hover:opacity-100">
            {pitfall.category}
          </span>
        </span>
      );

      lastIdx = actualOffset + originalPhrasing.length;
    });

    if (lastIdx < inputText.length) {
      elements.push(inputText.substring(lastIdx));
    }

    return <div className="leading-relaxed font-sans whitespace-pre-wrap">{elements}</div>;
  };

  const getFilteredPitfalls = () => {
    const list = coachResult ? coachResult.pitfalls : localPitfalls;
    if (activeTab === 'all') return list;
    return list.filter(p => p.category === activeTab);
  };

  const getCategoryCount = (cat: string) => {
    const list = coachResult ? coachResult.pitfalls : localPitfalls;
    if (cat === 'all') return list.length;
    return list.filter(p => p.category === cat).length;
  };

  return (
    <div id="elt_writing_coach_module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-800/85 text-cyan-400 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 select-none">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* LEFT COLUMN (7 cols): Text Input pane & Interactive Visual Highlight area */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Main Workspace Frame */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                {lang === 'tr' ? "ELT Antrenör Taslak Alanı" : "ELT Coach Prose Lab"}
              </span>
            </div>
            
            <div className="flex gap-2.5">
              <button 
                onClick={handleImportFromPolisher}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800/80 hover:border-slate-800 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
                title={lang === 'tr' ? "Metin iyileştiriciden kopyala" : "Pull current text from the mainstream polisher"}
              >
                <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
                {lang === 'tr' ? "Ana Editörden Yükle" : "Import from Polisher"}
              </button>

              <button 
                onClick={handleSyncToPolisher}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-slate-900 border border-slate-800/80 hover:border-slate-800 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
                title={lang === 'tr' ? "Metni ana polisher'a geri gönder" : "Push edited draft back to main editor"}
              >
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                {lang === 'tr' ? "Ana Editöre Aktar" : "Sync back to Polisher"}
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400 font-sans">
            <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === 'tr' ? 
                "Bu modül; SLA (İkinci Dil Edinimi) ve Uygulamalı Dilbilim yazılarındaki yapısal, L1 kaynaklı eşdizim hatalarını ve aşırı edilgenlik barındıran zayıf geçişleri algılar." :
                "This specialized module diagnoses structural collocations, L1 influence pitfalls, and weak transitions common in Applied Linguistics and SLA manuscripts."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase font-black text-slate-500">{lang === 'tr' ? "Metin Düzenleme" : "Editable Draft"}</label>
                <button 
                  onClick={() => { setInputText(''); setCoachResult(null); }}
                  className="text-[10px] font-bold text-rose-450 hover:text-rose-400"
                >
                  {lang === 'tr' ? "Temizle" : "Clear Draft"}
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={11}
                className="w-full bg-slate-950/60 border border-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl p-3.5 text-xs font-sans text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-none selection:bg-cyan-500/30 selection:text-cyan-100"
                placeholder={lang === 'tr' ? "Geri bildirim almak istediğiniz makale paragraflarınızı buraya yazın..." : "Type or paste your linguistics study paragraphs here..."}
              />
            </div>

            {/* Live Interactive Highlight Window */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase font-black text-slate-500 flex items-center justify-between">
                <span>{lang === 'tr' ? "İnteraktif Tarama & İşaretçi" : "Interactive Scanner Screen"}</span>
                <span className="text-[9px] text-cyan-400 bg-cyan-950 border border-cyan-800 px-1.5 py-px rounded font-mono font-bold animate-pulse">{getCategoryCount('all')} {lang === 'tr' ? "Bulgu" : "Findings"}</span>
              </label>
              <div className="w-full h-[216px] overflow-y-auto bg-slate-900/30 border border-slate-900 rounded-xl p-4 text-xs select-text scrollbar-thin">
                {getRenderableJSXWithHighlights()}
              </div>
            </div>
          </div>

          {/* Action Trigger Drawer */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-900">
            <div className="text-[10px] text-slate-500 font-mono">
              {lang === 'tr' ? "Tip: Farklı bir bulguya tıklayarak detaylı yapay zeka analizini açın." : "Tip: Click any colored highlight to start the interactive AI micro-rewriting tool."}
            </div>

            <button
              onClick={handleRunCoachAnalyze}
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-900 disabled:to-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shrink-0 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {lang === 'tr' ? "Gemini Makaleyi İnceliyor..." : "Gemini Analyzing Manuscript..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  {lang === 'tr' ? "Yapay Zeka Antrenörünü Çalıştır" : "Request Deep AI Analysis"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Rewrite Features Integration Workspace */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-900 pb-2.5">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <FileEdit className="w-4 h-4 text-indigo-400" />
              {lang === 'tr' ? "Entegre Akademik AI Yeniden Yazıcı" : "Integrated Academic AI Rewrite Workspace"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {lang === 'tr' ? "Metninizi doğrudan iyileştirici motorlarından geçirin ve elde edilen sonuçları seanslar arası koruyun." : "Route your work through the central polisher engine directly from this coach desk."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-4 space-y-3 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl">
              <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{lang === 'tr' ? "Hedef İyileştirme Modu" : "Polisher Engine Select"}</label>
              
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => setRewriteTask('slip-slop')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${rewriteTask === 'slip-slop' ? 'bg-cyan-950 border border-cyan-850 text-cyan-400' : 'bg-transparent text-slate-400 hover:bg-slate-900 border border-transparent'}`}
                >
                  <span>{lang === 'tr' ? "Anti-Template Slip-Slop" : "Anti-Template Slip-Slop"}</span>
                  <span className="text-[9px] bg-cyan-900/60 text-cyan-300 font-mono px-1 py-px rounded uppercase">PRO</span>
                </button>

                <button
                  onClick={() => setRewriteTask('simplify')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${rewriteTask === 'simplify' ? 'bg-cyan-950 border border-cyan-850 text-cyan-400' : 'bg-transparent text-slate-400 hover:bg-slate-900 border border-transparent'}`}
                >
                  <span>{lang === 'tr' ? "Sadeleştir (De-Jargonize)" : "Simplify (De-Jargonize)"}</span>
                </button>

                <button
                  onClick={() => setRewriteTask('paraphrase')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${rewriteTask === 'paraphrase' ? 'bg-cyan-950 border border-cyan-850 text-cyan-400' : 'bg-transparent text-slate-400 hover:bg-slate-900 border border-transparent'}`}
                >
                  <span>{lang === 'tr' ? "Özgünleştir (Paraphrase)" : "Paraphrase Academic"}</span>
                </button>

                <button
                  onClick={() => setRewriteTask('grammar')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${rewriteTask === 'grammar' ? 'bg-cyan-950 border border-cyan-850 text-cyan-400' : 'bg-transparent text-slate-400 hover:bg-slate-900 border border-transparent'}`}
                >
                  <span>{lang === 'tr' ? "Hassas Dilbilgisi Kontrolü" : "Strict Grammar Check"}</span>
                </button>
              </div>

              <button
                onClick={handlePolishingAction}
                disabled={rewriting || !inputText.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-900 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
              >
                {rewriting ? (
                  <>
                    <RefreshCw className="w-3 H-3 animate-spin" />
                    {lang === 'tr' ? "Çevriliyor..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    {lang === 'tr' ? "Metni Yeniden Yaz" : "Execute Rewrite"}
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-8 space-y-2">
              <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">{lang === 'tr' ? "AI Analiz ve Revize Sonucu" : "AI Rewrite Outcome Preview"}</label>
              
              <div className="w-full bg-slate-900/35 border border-slate-900 rounded-xl p-4 min-h-[148px] max-h-[160px] overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
                {rewriting ? (
                  <div className="space-y-2.5 py-4 animate-pulse">
                    <div className="h-3.5 bg-slate-900 rounded w-5/6" />
                    <div className="h-3.5 bg-slate-900 rounded w-full" />
                    <div className="h-3.5 bg-slate-900 rounded w-4/5" />
                  </div>
                ) : rewriteResult ? (
                  <p className="whitespace-pre-wrap">{rewriteResult}</p>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-6 h-6 mx-auto stroke-1 text-slate-700 mb-1" />
                    <span>{lang === 'tr' ? "Sol taraftan dilediğiniz iyileştirme algoritmasını seçerek yeni çıktıyı buraya yansıtın." : "Run an integrated polishing operation from the menu to inspect outcomes here."}</span>
                  </div>
                )}
              </div>

              {rewriteResult && (
                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rewriteResult);
                      showToast(lang === 'tr' ? "Geçici çıktı kopyalandı." : "Copied rewrite result.");
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 text-[10.5px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {lang === 'tr' ? "Kopyala" : "Copy"}
                  </button>

                  <button
                    onClick={handleApplyBulkRewrite}
                    className="px-3 py-1.5 bg-cyan-900/30 text-cyan-400 hover:text-cyan-300 border border-cyan-900/60 hover:bg-cyan-900/40 text-[10.5px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'tr' ? "Drafta Uygula" : "Keep & Apply to Draft"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (5 cols): Diagnostic results dashboard and micro interactive correction card */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* If a pitfall is active, render interactive feedback card */}
        {selectedPitfall ? (
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl ring-1 ring-cyan-500/25">
            <div className="flex items-center justify-between border-b border-rose-950/20 pb-3">
              <span className="text-[10px] font-mono tracking-widest font-black uppercase text-rose-450 bg-rose-955/20 border border-rose-900/35 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {selectedPitfall.typeLabel}
              </span>
              <button 
                onClick={() => { setSelectedPitfall(null); setRewriteResult(null); }}
                className="text-slate-500 hover:text-slate-350 text-xs font-bold"
              >
                {lang === 'tr' ? "Kapat" : "Close"}
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block uppercase">{lang === 'tr' ? "Belirlenen Metin Dizini" : "Identified Phrase"}</span>
                <p className="text-xs font-bold text-rose-300 line-through decoration-rose-400/50 pt-0.5 font-mono">{selectedPitfall.originalPhrasing}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block uppercase">{lang === 'tr' ? "Önerilen Alternatif" : "Suggested Prose Alternative"}</span>
                <p className="text-xs font-bold text-emerald-400 pt-0.5 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {selectedPitfall.suggestion}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-black text-slate-500 block uppercase">{lang === 'tr' ? "Akademik Gerekçelendirme" : "Applied Linguistics Rationale"}</span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 select-text bg-slate-900/20 p-2.5 rounded-lg border border-slate-900">{selectedPitfall.explanation}</p>
              </div>

              <div className="border-t border-slate-900 pt-3.5 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={() => handleRewriteSelectedPitfall(selectedPitfall)}
                  disabled={rewriting}
                  className="px-3 py-1.8 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {rewriting ? (lang === 'tr' ? "Ajan Analizinde..." : "AI analyzing...") : (lang === 'tr' ? "AI İyileştirme" : "Optimize Sentence with AI")}
                </button>

                <button
                  onClick={() => handleApplyQuickFix(selectedPitfall)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-505 hover:to-teal-505 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  {lang === 'tr' ? "Değişikliği Uygula" : "Update Academic Text"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* General High Level Dashboard stats overview */
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              {lang === 'tr' ? "Uygulamalı Dilbilim Geribildirim Masası" : "ELT Applied Linguistics Overview"}
            </h3>

            {coachResult ? (
              <div className="space-y-4">
                {/* Overall Analysis Box */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-900 select-text font-sans">
                  <span className="text-[9px] uppercase font-mono font-black text-slate-500 tracking-widest block">{lang === 'tr' ? "Genel Akademik Ses Değerlendirmesi" : "Overall Scholarly Flow Assessment"}</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{coachResult.overallCritique}</p>
                  {coachResult.is_fallback && (
                    <span className="inline-block mt-2 text-[8.5px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-850/80 px-2 py-0.5 rounded">
                      ⚡ LOCAL DIAGNOSTIC AGENT
                    </span>
                  )}
                </div>

                {/* Suggestions List Accordion */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">{lang === 'tr' ? "Önemli Yazım Tavsiyeleri" : "Publishing Coach Action Guidance"}</span>
                  <div className="space-y-1.5">
                    {coachResult.suggestionsList ? coachResult.suggestionsList.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-900/20 p-2 border border-slate-900/70 rounded-lg text-xs font-sans text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{tip}</span>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-500 italic font-sans">{lang === 'tr' ? "Aktif yayın önerisi yok." : "No strategic criteria logs posted."}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600 space-y-1.5">
                <HelpIcon className="w-8 h-8 text-slate-800 mx-auto stroke-1" />
                <h4 className="font-mono text-[10px] font-black uppercase tracking-wider">{lang === 'tr' ? "Yayın Analiz Raporu Yok" : "Awaiting Deep Critique"}</h4>
                <p className="text-xs font-sans max-w-xs mx-auto text-slate-550 leading-relaxed">
                  {lang === 'tr' ? "Taslağınızı hazırlayın ve detaylı kelime tespiti, L1 müdahale incelemeleri ve süzgeçler için 'Yapay Zeka Analiz' butonuna basın." : "Click 'Request Deep AI Analysis' under the edit area to populate this overview with scholastic recommendations."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categories timeline box list */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-900 pb-2.5 gap-2">
            <h4 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {lang === 'tr' ? "Kategoriler & Tespit Edilen Riskler" : "Pitfalls & Scholarly Clichés Timeline"}
            </h4>

            {/* Micro Tabs filter ribbon */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-1 rounded text-[9px] font-mono font-semibold transition ${activeTab === 'all' ? 'bg-slate-900 border border-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-350 bg-transparent border border-transparent'}`}
              >
                All ({getCategoryCount('all')})
              </button>

              <button
                onClick={() => setActiveTab('transition')}
                className={`px-2 py-1 rounded text-[9px] font-mono font-semibold transition ${activeTab === 'transition' ? 'bg-cyan-950 border border-cyan-850 text-cyan-400' : 'text-slate-500 hover:text-slate-350 bg-transparent border border-transparent'}`}
              >
                Trans ({getCategoryCount('transition')})
              </button>

              <button
                onClick={() => setActiveTab('passive')}
                className={`px-2 py-1 rounded text-[9px] font-mono font-semibold transition ${activeTab === 'passive' ? 'bg-purple-950 border border-purple-850 text-purple-400' : 'text-slate-500 hover:text-slate-350 bg-transparent border border-transparent'}`}
              >
                Pass ({getCategoryCount('passive')})
              </button>

              <button
                onClick={() => setActiveTab('l1_interference')}
                className={`px-2 py-1 rounded text-[9px] font-mono font-semibold transition ${activeTab === 'l1_interference' ? 'bg-rose-955 border border-rose-900 text-rose-450' : 'text-slate-500 hover:text-slate-350 bg-transparent border border-transparent'}`}
              >
                L1 ({getCategoryCount('l1_interference')})
              </button>

              <button
                onClick={() => setActiveTab('cliché')}
                className={`px-2 py-1 rounded text-[9px] font-mono font-semibold transition ${activeTab === 'cliché' ? 'bg-amber-950 border border-amber-850 text-amber-400' : 'text-slate-500 hover:text-slate-350 bg-transparent border border-transparent'}`}
              >
                Cliche ({getCategoryCount('cliché')})
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-thin">
            {getFilteredPitfalls().length > 0 ? (
              getFilteredPitfalls().map((pitfall) => {
                const colors: { [key: string]: string } = {
                  transition: 'border-cyan-850 bg-cyan-955/5 hover:bg-cyan-955/15',
                  passive: 'border-purple-850 bg-purple-955/5 hover:bg-purple-955/15',
                  l1_interference: 'border-rose-900 bg-rose-955/5 hover:bg-rose-900/15',
                  cliché: 'border-amber-850 bg-amber-955/5 hover:bg-amber-955/15',
                  nominalization: 'border-teal-850 bg-teal-955/5 hover:bg-teal-955/15'
                };

                const badges: { [key: string]: string } = {
                  transition: 'bg-cyan-950 text-cyan-400 border-cyan-800',
                  passive: 'bg-purple-955 text-purple-450 border-purple-900',
                  l1_interference: 'bg-rose-955 text-rose-450 border-rose-900',
                  cliché: 'bg-amber-950 text-amber-400 border-amber-800',
                  nominalization: 'bg-teal-950 text-teal-400 border-teal-800'
                };

                return (
                  <div
                    key={pitfall.id}
                    onClick={() => {
                      setSelectedPitfall(pitfall);
                      setRewriteResult(null);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${colors[pitfall.category] || 'border-slate-800 bg-slate-900/5 hover:bg-slate-905'} ${selectedPitfall?.id === pitfall.id ? 'ring-1 ring-white bg-slate-900/60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8.5px] font-mono tracking-wider px-2 py-0.5 rounded border uppercase font-bold leading-normal ${badges[pitfall.category] || 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                        {pitfall.typeLabel}
                      </span>
                      <span className={`text-[9px] font-mono font-medium ${pitfall.severity === 'high' ? 'text-rose-400' : pitfall.severity === 'medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {pitfall.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-sans">
                      <span className="text-slate-400 line-through shrink-0 font-mono">{pitfall.originalPhrasing}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-emerald-400 font-bold font-mono">{pitfall.suggestion}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {pitfall.explanation}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-500 italic font-sans text-xs">
                {lang === 'tr' ? "Bu başlık altında çözülmemiş risk/bulgu bulunmuyor." : "No resolved or current findings available under this category."}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
