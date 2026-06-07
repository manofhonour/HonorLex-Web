import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  CornerDownRight, 
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { ContextualSynonymResponse, SynonymSuggestion } from '../types';

interface SynonymDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  synonymData: ContextualSynonymResponse | null;
  loading: boolean;
  onApplySynonym: (newWord: string) => void;
}

export default function SynonymDrawer({
  isOpen,
  onClose,
  synonymData,
  loading,
  onApplySynonym
}: SynonymDrawerProps) {
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const getSafetyBadgeStyle = (safety: 'safe' | 'slightly_different' | 'risky') => {
    switch (safety) {
      case 'safe':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400';
      case 'slightly_different':
        return 'bg-amber-950/60 border-amber-800/80 text-amber-400';
      case 'risky':
        return 'bg-rose-950/60 border-rose-800/80 text-rose-400';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  const getRegisterBadgeStyle = (reg: 'academic' | 'formal' | 'neutral' | 'informal') => {
    switch (reg) {
      case 'academic':
        return 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400';
      case 'formal':
        return 'bg-purple-950/60 border-purple-800/60 text-purple-400';
      case 'neutral':
        return 'bg-slate-900 border-slate-800 text-slate-300';
      case 'informal':
        return 'bg-rose-950/40 border-rose-900/30 text-rose-300';
      default:
        return 'bg-slate-950 border-slate-900 text-slate-500';
    }
  };

  return (
    <div 
      id="synonym_drawer_overlay"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
    >
      {/* Click-outside zone */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer Body */}
      <div 
        id="synonym_drawer_body"
        className="relative w-full max-w-lg h-full bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-905 flex items-center justify-between bg-slate-950/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-extrabold text-white text-base md:text-lg">
              Contextual Thesaurus
            </h3>
          </div>
          <button 
            id="close_synonym_drawer_btn"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-90 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium font-sans">
                Analyzing word semantics, register, & part-of-speech context...
              </p>
            </div>
          ) : !synonymData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-semibold font-display">
                No Phrase Selected
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                Double-click or highlight any word in your edited draft to explore academic synonyms tailored exactly to its local context.
              </p>
            </div>
          ) : (
            <>
              {/* Core Phrase Header Info */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
                  <span id="synonym_word_badge" className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-2 py-0.5 rounded">
                    "{synonymData.selected_text}"
                  </span>
                  <span id="synonym_pos_badge" className="text-[10px] tracking-wider font-mono font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {synonymData.part_of_speech}
                  </span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                    Contextual Interpretation
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-0.5">
                    {synonymData.detected_meaning}
                  </p>
                </div>
                {synonymData.paragraph_topic && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                    <span className="text-slate-500 font-medium">Domain:</span>
                    <span className="font-semibold text-slate-300 capitalize">{synonymData.paragraph_topic}</span>
                  </div>
                )}
              </div>

              {/* Meaning Shift Amber Warning, if relevant */}
              {synonymData.meaning_warning && (
                <div id="synonym_meaning_warning" className="p-3.5 bg-amber-950/20 border border-amber-900/60 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-amber-200 uppercase tracking-wide font-display">
                      Sensitive Academic Term Warning
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                      {synonymData.meaning_warning}
                    </p>
                  </div>
                </div>
              )}

              {/* Top Choice Match */}
              {synonymData.best_suggestion && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                    Prime Stylistic Replacement
                  </h4>
                  <div 
                    id="best_synonym_card"
                    className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/20 transition cursor-pointer flex flex-col justify-between"
                    onClick={() => onApplySynonym(synonymData.best_suggestion.word)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-display text-white">
                        {synonymData.best_suggestion.word}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                        Score {synonymData.best_suggestion.fit_score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 font-sans font-medium">
                      {synonymData.best_suggestion.reason}
                    </p>
                    <div className="mt-3 text-[10px] text-cyan-300 hover:underline flex items-center gap-1 font-mono tracking-wide">
                      Click to apply immediately
                      <CornerDownRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* Main List of scored Alternatives */}
              {synonymData.suggestions && synonymData.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                    All Evaluated Scholarly Candidates
                  </h4>
                  <div className="space-y-2">
                    {synonymData.suggestions.map((sug, sIdx) => {
                      const isExpanded = selectedSuggestionIndex === sIdx;
                      return (
                        <div 
                          key={`sug_${sIdx}`}
                          className={`rounded-xl border transition-all duration-150 ${
                            isExpanded 
                              ? 'border-slate-800 bg-slate-900/30' 
                              : 'border-slate-900 bg-slate-950 hover:border-slate-800 hover:bg-slate-900/10'
                          }`}
                        >
                          {/* Row Header */}
                          <div 
                            className="p-3 flex items-center justify-between cursor-pointer"
                            onClick={() => setSelectedSuggestionIndex(isExpanded ? null : sIdx)}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-200 font-sans">
                                {sug.word}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${getRegisterBadgeStyle(sug.register)}`}>
                                  {sug.register}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${getSafetyBadgeStyle(sug.meaning_safety)}`}>
                                  {sug.meaning_safety.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                {sug.fit_score}% match
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApplySynonym(sug.word);
                                }}
                                className="px-2.5 py-1 bg-slate-90 rounded border border-slate-800 text-[10px] font-semibold text-cyan-400 hover:bg-cyan-950/20 hover:border-cyan-800/80 transition cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          </div>

                          {/* Row Details (Collapsible Drawer) */}
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-900/60 bg-slate-950 rounded-b-xl space-y-2 text-[11px] text-slate-400">
                              {sug.collocation_note && (
                                <p className="font-sans leading-relaxed">
                                  <strong className="text-slate-300">Phrasing Fit:</strong> {sug.collocation_note}
                                </p>
                              )}
                              {sug.example_sentence && (
                                <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block mb-1">Contextual Swap Draft</span>
                                  <span className="italic text-slate-350 font-sans leading-relaxed">"{sug.example_sentence}"</span>
                                </div>
                              )}
                              {sug.comment && (
                                <p className="font-sans font-medium text-slate-400 border-l-2 border-slate-805 pl-2">
                                  {sug.comment}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items to Avoid fully explained */}
              {synonymData.avoid && synonymData.avoid.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                    Stylistic Red Flags (Avoid in context)
                  </h4>
                  <div className="space-y-2 bg-rose-950/5 border border-rose-950/30 rounded-2xl p-4">
                    {synonymData.avoid.map((av, avIdx) => (
                      <div 
                        key={`avoid_${avIdx}`}
                        className="flex items-start gap-2.5 text-[11px] leading-relaxed"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono font-bold text-rose-400 line-through">
                            {av.word}
                          </span>
                          <p className="text-slate-400 font-sans mt-0.5">
                            {av.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info label */}
        <div className="p-3.5 border-t border-slate-909 bg-slate-950 text-[10px] text-center text-slate-500 font-mono tracking-wide leading-relaxed">
          Synonyms evaluated by Datamuse APIs & cross-checked dynamically with Gemini models.
        </div>
      </div>
    </div>
  );
}
