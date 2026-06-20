import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  RotateCcw,
  BookMarked,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  ExternalLink,
  Table,
  Cpu,
  Loader2,
  Calendar,
  User,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReferenceVerificationResponse, MetadataComparisonRow } from '../types';
import { simulateVerifyReference } from '../lib/staticDemo';
import { 
  getCitationFromVerification, 
  formatAPA7, 
  formatMLA9, 
  formatChicago,
  parseReference
} from '../lib/citationExporter';

interface StyleInfo {
  style: 'APA' | 'MLA' | 'Unknown';
  confidence: number;
  indicators: string[];
}

function analyzeCitationStyle(text: string): StyleInfo {
  const trimmed = text.trim();
  if (trimmed.length < 15) {
    return { style: 'Unknown', confidence: 0, indicators: [] };
  }

  let apaScore = 0;
  let mlaScore = 0;
  const indicators: string[] = [];

  // 1. Check for Year in Parentheses (APA indicator)
  const apaYearRegex = /\(\s*(17|18|19|20)\d{2}\s*\)/;
  if (apaYearRegex.test(trimmed)) {
    apaScore += 45;
    indicators.push('Year in parentheses (APA)');
  }

  // 2. Check for Ampersand between authors (APA indicator)
  if (/\b&\s+[A-Za-z]/.test(trimmed) || /,\s*&\s*/.test(trimmed)) {
    apaScore += 35;
    indicators.push('Ampersand (&) author separator (APA)');
  }

  // 3. Vol(issue) pattern without vol. or no. prefix (APA indicator)
  const volIssueRegex = /\b\d+\s*\(\s*\d+\s*\)\s*,\s*\d+/;
  if (volIssueRegex.test(trimmed)) {
    apaScore += 30;
    indicators.push('Volume(issue) layout like 15(4) (APA)');
  }

  // 4. Double quotes for title (MLA indicator)
  const mlaQuoteTitleRegex = /"([^"]+)"/;
  if (mlaQuoteTitleRegex.test(trimmed)) {
    mlaScore += 40;
    indicators.push('Title in double quotes (MLA)');
  }

  // 5. vol. or no. qualifiers (MLA indicator)
  if (/\bvol\.\s*\d+/i.test(trimmed)) {
    mlaScore += 30;
    indicators.push('"vol." prefix designation (MLA)');
  }
  if (/\bno\.\s*\d+/i.test(trimmed)) {
    mlaScore += 30;
    indicators.push('"no." prefix designation (MLA)');
  }

  // 6. pp. or p. indicators (MLA indicator)
  if (/\bpp?\.\s*\d+/.test(trimmed)) {
    mlaScore += 25;
    indicators.push('"p."/"pp." page indicator (MLA)');
  }

  // 7. "and" author separator (MLA indicator)
  if (/\b,?\s+and\s+[A-Z]/.test(trimmed) && !/&/.test(trimmed)) {
    mlaScore += 20;
    indicators.push('"and" spelling separator (MLA)');
  }

  if (apaScore > mlaScore && apaScore >= 35) {
    return {
      style: 'APA',
      confidence: Math.min(100, apaScore),
      indicators
    };
  } else if (mlaScore > apaScore && mlaScore >= 35) {
    return {
      style: 'MLA',
      confidence: Math.min(100, mlaScore),
      indicators
    };
  }

  return {
    style: 'Unknown',
    confidence: 0,
    indicators: ['Mixed formatting markers / non-standard layout']
  };
}

interface CitationAuditorProps {
  isStatic?: boolean;
  reloadState: any;
  onOperationComplete: (data: any) => void;
  lang: 'en' | 'tr';
}

export default function CitationAuditor({ isStatic, reloadState, onOperationComplete, lang }: CitationAuditorProps) {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReferenceVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedParenthetical, setCopiedParenthetical] = useState<boolean>(false);
  const [copiedNarrative, setCopiedNarrative] = useState<boolean>(false);
  const [activeStyle, setActiveStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const [lastQueryBeforeFormat, setLastQueryBeforeFormat] = useState<string | null>(null);
  const [formatChangeSuccess, setFormatChangeSuccess] = useState<boolean>(false);
  const [formattingLoading, setFormattingLoading] = useState<boolean>(false);

  // Formatter utilities
  const handleAutoFormat = async (targetStyle: 'apa' | 'mla' | 'chicago') => {
    if (!query.trim() || formattingLoading) return;
    
    setLastQueryBeforeFormat(query);
    
    if (isStatic) {
      const parsed = parseReference({
        raw_reference: query,
        classification: 'Unverified',
        risk_score: 0,
        alert_message: '',
        rationale: ''
      });

      let formatted = '';
      if (targetStyle === 'apa') {
        formatted = formatAPA7(parsed);
      } else if (targetStyle === 'mla') {
        formatted = formatMLA9(parsed);
      } else if (targetStyle === 'chicago') {
        formatted = formatChicago(parsed);
      }

      if (formatted) {
        setQuery(formatted);
        setFormatChangeSuccess(true);
        setTimeout(() => setFormatChangeSuccess(false), 3050);
      }
    } else {
      setFormattingLoading(true);
      try {
        const response = await fetch('/api/format-citation-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ citation: query, targetStyle })
        });
        if (!response.ok) throw new Error('AI formatting API error');
        const data = await response.json();
        if (data && data.formatted) {
          const rawNoStars = data.formatted.replace(/\*/g, '');
          setQuery(rawNoStars);
          setFormatChangeSuccess(true);
          setTimeout(() => setFormatChangeSuccess(false), 3050);
        }
      } catch (err) {
        console.error('AI Citation Formatter failed, reverting to local parser:', err);
        const parsed = parseReference({
          raw_reference: query,
          classification: 'Unverified',
          risk_score: 0,
          alert_message: '',
          rationale: ''
        });

        let formatted = '';
        if (targetStyle === 'apa') {
          formatted = formatAPA7(parsed);
        } else if (targetStyle === 'mla') {
          formatted = formatMLA9(parsed);
        } else if (targetStyle === 'chicago') {
          formatted = formatChicago(parsed);
        }

        if (formatted) {
          setQuery(formatted);
          setFormatChangeSuccess(true);
          setTimeout(() => setFormatChangeSuccess(false), 3050);
        }
      } finally {
        setFormattingLoading(false);
      }
    }
  };

  const handleUndoFormat = () => {
    if (lastQueryBeforeFormat) {
      setQuery(lastQueryBeforeFormat);
      setLastQueryBeforeFormat(null);
    }
  };

  // Sync internal state with history select reload
  useEffect(() => {
    if (reloadState) {
      setQuery(reloadState.query || '');
      setResult(reloadState.result || null);
    }
  }, [reloadState]);
  
  const handleVerify = async (textQuery?: string) => {
    const activeQuery = textQuery || query;
    if (!activeQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    if (isStatic) {
      setTimeout(() => {
        const dummy = simulateVerifyReference(activeQuery);
        setResult(dummy);
        onOperationComplete({
          query: activeQuery,
          result: dummy
        });
        setLoading(false);
      }, 750);
      return;
    }

    try {
      const response = await fetch('/api/verify-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeQuery })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${response.status}`);
      }

      const resData = await response.json();
      setResult(resData);

      // Report to historical activities log
      onOperationComplete({
        query: activeQuery,
        result: resData
      });
    } catch (err: any) {
      console.error('[Verify API search error]:', err);
      setError(err.message || 'Failure connecting to Scholarly APIs. Check internet connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyParenthetical = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedParenthetical(true);
    setTimeout(() => setCopiedParenthetical(false), 2000);
  };

  const handleCopyNarrative = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 2000);
  };

  const loadDemo = (type: string) => {
    let demoStr = '';
    switch (type) {
      case 'watson_crick_mismatch':
        // Famous Paper with several user input errors
        demoStr = 'Selinker, L. (1973). Interlanguage processes in EFL. IRAL - International Review of Applied Linguistics, 10, 209-231.';
        break;
      case 'book_review_trap':
        // Book review traits
        demoStr = 'Canagarajah, A. S. (2000). Resisting Linguistic Imperialism in English Teaching. Oxford University Press, 1999. TESOL Quarterly, 34(3), 567-571. DOI: 10.2307/3587747';
        break;
      case 'fabricated':
        // Purely fake citation with AI style
        demoStr = 'Thompson, G. R., & Reynolds, M. L. (2025). Cognitive Load Optimization of Vocabulary Retrieval in Gamified Turkish EFL Environments. Journal of Language Teaching and Neural Acquisition, 14(2), pp. 112-132.';
        break;
      case 'doi_only':
        // Quick DOI check
        demoStr = '10.1145/3313831.3376135';
        break;
      default:
        demoStr = '';
    }
    setQuery(demoStr);
    handleVerify(demoStr);
  };

  const getRiskLabelColor = (score: number) => {
    if (score >= 76) return 'text-rose-500 border-rose-900/50 bg-rose-950/20';
    if (score >= 51) return 'text-orange-500 border-orange-900/50 bg-orange-950/20';
    if (score >= 21) return 'text-amber-500 border-amber-900/50 bg-amber-950/20';
    return 'text-emerald-500 border-emerald-900/50 bg-emerald-950/20';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'match':
        return 'text-emerald-400';
      case 'mismatch':
        return 'text-rose-400 font-bold bg-rose-950/20 px-1 border border-rose-900/40 rounded';
      case 'added from verified metadata':
        return 'text-cyan-400 bg-cyan-950/30 font-medium px-1.5 border border-cyan-800/40 rounded';
      case 'partial match; initials corrected':
        return 'text-amber-400 font-semibold bg-amber-955/20 px-1 border border-amber-900/35 rounded';
      case 'parsed from input':
        return 'text-blue-400 bg-blue-950/20 px-1.5 border border-blue-900/30 rounded';
      case 'not verified':
        return 'text-amber-500 bg-amber-950/20 px-1.5 border border-amber-900/30 rounded';
      default:
        return 'text-slate-400';
    }
  };

  const getFormattedCitation = () => {
    if (!result) return '';
    if (activeStyle === 'apa') {
      return result.apa7_reference;
    }
    const parsed = getCitationFromVerification(result.metadata_comparison, query);
    if (activeStyle === 'mla') {
      return formatMLA9(parsed);
    }
    if (activeStyle === 'chicago') {
      return formatChicago(parsed);
    }
    return result.apa7_reference;
  };

  const formattedValue = getFormattedCitation();

  return (
    <div id="citation_auditor_wrapper" className="space-y-6">
      
      {/* Entry Control Panel */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
            <BookMarked className="w-4 h-4 text-cyan-400" />
            Bibliographic Reference Auditor
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Analyzes fabrication risks & Book Review Traps
          </span>
        </div>

        {/* Privacy Note Banner */}
        <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400 font-sans">
          <AlertTriangle className="w-4 h-4 text-cyan-550 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your text is processed through the AI model to generate suggestions. Do not paste sensitive personal data.
          </p>
        </div>

        <div className="space-y-1">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            id="single_citation_input_field"
            className="w-full bg-slate-955/60 border border-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl p-3.5 text-xs font-sans text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-none"
            placeholder="Paste raw academic APA formatted citation, article title, DOI index, or ISBN book code..."
          />
        </div>

        {/* Style Detector & Auto-formatter utility */}
        {query.trim().length >= 15 && (() => {
          const styleAnalysis = analyzeCitationStyle(query);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 space-y-3 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-slate-300 animate-pulse">
                    Citation Style Intelligence
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border tracking-wider uppercase ${
                    styleAnalysis.style === 'APA' 
                      ? 'bg-blue-950/50 border-blue-800/30 text-blue-400 font-mono' 
                      : styleAnalysis.style === 'MLA'
                        ? 'bg-purple-950/50 border-purple-800/30 text-purple-400 font-mono'
                        : 'bg-slate-950 border-slate-900 text-slate-450 font-mono'
                  }`}>
                    {styleAnalysis.style === 'Unknown' ? 'Unknown Schema' : `${styleAnalysis.style} Format Detected (~${styleAnalysis.confidence}% Conf)`}
                  </span>
                </div>

                {lastQueryBeforeFormat && (
                  <button
                    onClick={handleUndoFormat}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer transition select-none"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Undo Formatting
                  </button>
                )}
              </div>

              {styleAnalysis.indicators.length > 0 && (
                <div className="text-[10px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-slate-450 uppercase font-mono text-[9px]">Heuristic Matches:</span>
                  <span className="text-slate-400 italic">{styleAnalysis.indicators.join(', ')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Auto-Format Text To:</span>
                  <button
                    onClick={() => handleAutoFormat('apa')}
                    id="auto_format_btn_apa"
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      styleAnalysis.style === 'APA'
                        ? 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed hover:bg-transparent'
                        : 'bg-slate-950 border-slate-850 text-cyan-400 hover:text-cyan-300 hover:border-slate-800'
                    } ${formattingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={styleAnalysis.style === 'APA' || formattingLoading}
                  >
                    APA 7th Standard
                  </button>
                  <button
                    onClick={() => handleAutoFormat('mla')}
                    id="auto_format_btn_mla"
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      styleAnalysis.style === 'MLA'
                        ? 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed hover:bg-transparent'
                        : 'bg-slate-950 border-slate-850 text-cyan-400 hover:text-cyan-300 hover:border-slate-800'
                    } ${formattingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={styleAnalysis.style === 'MLA' || formattingLoading}
                  >
                    MLA 9th Standard
                  </button>
                  <button
                    onClick={() => handleAutoFormat('chicago')}
                    id="auto_format_btn_chicago"
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-slate-950 border-slate-850 text-cyan-400 hover:text-cyan-300 hover:border-slate-800 transition cursor-pointer ${formattingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={formattingLoading}
                  >
                    Chicago 17th
                  </button>
                </div>

                {formattingLoading && (
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                    AI Modeli Biçimlendiriyor...
                  </span>
                )}

                {formatChangeSuccess && !formattingLoading && (
                  <span id="format_success_toast" className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1 animate-pulse">
                    <Check className="w-3.5 h-3.5 text-emerald-450" />
                    Clean formatted!
                  </span>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* Action controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-909 pt-3">
          
          {/* Quick Loading Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Demos:</span>
            <button 
              onClick={() => loadDemo('watson_crick_mismatch')}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
            >
              Watson & Crick (Corrections)
            </button>
            <button 
              onClick={() => loadDemo('book_review_trap')}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
            >
              Book Review Trap Case
            </button>
            <button 
              onClick={() => loadDemo('fabricated')}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
            >
              Fabricated Citation Demo
            </button>
            <button 
              onClick={() => loadDemo('doi_only')}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
            >
              DOI-Only check
            </button>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || !query.trim()}
            id="verify_citation_cta_btn"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-950/20 shrink-0 self-end"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Interrogating Scholarly Registries...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-cyan-250" />
                Audit Bibliographic Citation
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-900/10 border border-rose-900/40 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-400 font-semibold font-sans">
            {error}
          </p>
        </div>
      )}

      {/* Audit Outcome Presentation Screen */}
      {result && (
        <div id="citation_audit_report" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Primary Column: Field comparison & formatting (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Field comparison dataset layout */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Table className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-extrabold text-white text-xs md:text-sm uppercase tracking-wide">
                  Bibliographic Field Audit
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table id="metadata_comparison_grid" className="w-full text-[11px] font-sans border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-2.5 pr-4">Bibliographic Field</th>
                      <th className="py-2.5 px-4 w-1/3">Parsed User Input</th>
                      <th className="py-2.5 px-4 w-1/3">Verified Registry Metadata</th>
                      <th className="py-2.5 pl-4 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {result.metadata_comparison.map((row, rIdx) => (
                      <tr key={`row_${rIdx}`} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-2.5 pr-4 font-semibold text-slate-400 uppercase tracking-wide text-[9px] font-mono">
                          {row.field}
                        </td>
                        <td className="py-2.5 px-4 text-slate-350 truncate max-w-[150px]" title={row.user_input}>
                          {row.user_input || (
                            <span className="italic text-slate-650">Not Provided</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-200 font-medium truncate max-w-[160px]" title={row.retrieved_metadata}>
                          {row.retrieved_metadata || (
                            <span className="italic text-slate-650">Not resolved</span>
                          )}
                        </td>
                        <td className={`py-2.5 pl-4 text-right text-[10px] ${getStatusStyle(row.status)}`}>
                          {row.status.replace(/_/g, ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Perfect Bibliography Output (Interactive Style Picker) */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
                    <FileCheck className="w-4 h-4 text-emerald-450" />
                    Corrected Bibliography Entry
                  </span>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Toggle between standard academic styles
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl" id="citations_style_picker_tabs">
                    <button
                      onClick={() => setActiveStyle('apa')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                        activeStyle === 'apa' 
                          ? 'bg-cyan-950/65 text-cyan-400 border border-cyan-850/45' 
                          : 'text-slate-450 hover:text-slate-350 border border-transparent'
                      }`}
                    >
                      APA 7th
                    </button>
                    <button
                      onClick={() => setActiveStyle('mla')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                        activeStyle === 'mla' 
                          ? 'bg-cyan-950/65 text-cyan-400 border border-cyan-850/45' 
                          : 'text-slate-450 hover:text-slate-350 border border-transparent'
                      }`}
                    >
                      MLA 9th
                    </button>
                    <button
                      onClick={() => setActiveStyle('chicago')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                        activeStyle === 'chicago' 
                          ? 'bg-cyan-950/65 text-cyan-400 border border-cyan-850/45' 
                          : 'text-slate-450 hover:text-slate-350 border border-transparent'
                      }`}
                    >
                      Chicago
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(formattedValue.replace(/\*/g, ''))}
                    className="px-2.5 py-1.5 bg-slate-905 border border-slate-800 hover:border-slate-705 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer font-sans shrink-0 min-w-[100px]"
                    id="copy_corrected_entry_btn"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="copied_entry"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-450 font-black" />
                          Copied
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy_entry"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          Copy Entry
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Verified Textbox */}
              <div 
                id="corrected_citation_preview"
                className="p-4 bg-slate-900/40 border border-emerald-950/30 text-xs text-slate-200 leading-relaxed font-sans select-all selection:bg-emerald-500/30 rounded-xl"
              >
                {/* We render simple Markdown styling like *Nature* */}
                {formattedValue.split('*').map((part, pIdx) => {
                  if (pIdx % 2 === 1) {
                    return <em key={`em_${pIdx}`} className="text-cyan-455 font-semibold italic">{part}</em>;
                  }
                  return part;
                })}
              </div>

              {/* Unverified DOI section displaying if DOI is not found */}
              {result.unverified_doi && (
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1.5" id="unverified_doi_container">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                      User-supplied DOI, not verified:
                    </span>
                    <span className="text-xs font-mono text-cyan-400 select-all font-medium transition break-all" id="unverified_doi_link">
                      {result.unverified_doi}
                    </span>
                  </div>

                  <div className="p-4 bg-amber-950/15 border border-amber-500/20 rounded-xl flex items-start gap-2.5" id="unverified_doi_warning_badge">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-display">Unverified Identifier Warning</h5>
                      <p className="text-[11px] text-slate-350 font-sans font-medium leading-relaxed mt-1">
                        This reference is formatted from user input only and is not externally verified. The DOI could not be found in DOI registries. Do not cite this source until manually verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Citations in text formats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-sans">
                <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 flex items-center justify-between gap-3 shadow-sm hover:border-slate-800 transition-colors">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Parenthetical Citation formula</span>
                    <span className="text-slate-200 font-mono block select-all truncate font-medium">{result.parenthetical_citation}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleCopyParenthetical(result.parenthetical_citation)}
                    className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-slate-700/80 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center min-w-[32px] min-h-[32px]"
                    title="Copy Parenthetical Citation"
                    id="copy_parenthetical_citation_btn"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copiedParenthetical ? (
                        <motion.span
                          key="copied_parenthetical"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="w-4 h-4 text-emerald-450" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy_parenthetical"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Copy className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 flex items-center justify-between gap-3 shadow-sm hover:border-slate-800 transition-colors">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Narrative Citation formula</span>
                    <span className="text-slate-200 font-sans block select-all truncate font-medium">{result.narrative_citation}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleCopyNarrative(result.narrative_citation)}
                    className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-slate-700/80 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center min-w-[32px] min-h-[32px]"
                    title="Copy Narrative Citation"
                    id="copy_narrative_citation_btn"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copiedNarrative ? (
                        <motion.span
                          key="copied_narrative"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy_narrative"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Copy className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
              
              {result.formatting_note && (
                <p className="text-[10px] font-sans font-medium text-amber-500 flex items-center gap-1.5 pl-1 italic">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Formatting advice: {result.formatting_note}
                </p>
              )}
            </div>

            {/* If Book review trap rejected match card alerts */}
            {result.rejected_matches && result.rejected_matches.length > 0 && (
              <div className="bg-rose-950/10 p-4 border border-rose-900/30 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h4 className="font-display font-black text-xs md:text-sm uppercase tracking-wide">
                    Rejected Trap Candidate Log ({result.rejected_matches.length})
                  </h4>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  The following catalog query match candidates were identified as Reviews or unrelated trap citations, and were subsequently filtered to avoid incorrect data attachment:
                </p>

                <div className="divide-y divide-rose-950/40 space-y-3">
                  {result.rejected_matches.map((rej, rejIdx) => (
                    <div key={`rej_${rejIdx}`} className="pt-2 text-[11px] space-y-1 text-slate-300 font-sans">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-rose-400 font-bold">Registry Hit Rejected</span>
                        <span className="text-slate-500">DOI: {rej.retrieved_doi}</span>
                      </div>
                      <p className="leading-relaxed">
                        <strong className="text-slate-400">Title:</strong> "{rej.retrieved_title}" ({rej.retrieved_year}) by {rej.retrieved_author}
                      </p>
                      <p className="text-rose-400 font-semibold mt-1 bg-rose-950/20 p-2 rounded border border-rose-900/20">
                        <strong className="text-rose-300 pr-1">Audit Filter Action:</strong> {rej.rejection_reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of general warning/problems found */}
            {result.problems_found && result.problems_found.length > 0 && (
              <div className="bg-amber-950/5 border border-amber-900/30 p-4 rounded-2xl space-y-2 shadow-xl">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500 block">
                  Errors corrected in bibliography item
                </span>
                <ul className="text-[11px] text-slate-350 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
                  {result.problems_found.map((prob, pIdx) => (
                    <li key={`prob_${pIdx}`}>
                      {prob}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Secondary Column: Risk analysis & databases hits (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Fabrication Risk Gauge score representing a safety level */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-5 text-center shadow-xl">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                Verification Safeguard Index
              </span>

              {/* Large circular/badge score indicator with color highlight */}
              <div id="risk_score_radial_meter" className="flex flex-col items-center justify-center p-4">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${getRiskLabelColor(result.fabrication_risk_score)}`}>
                  <span id="fabrication_risk_numerical" className="text-3xl font-black font-display tracking-tighter">
                    {result.fabrication_risk_score}
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wide text-slate-400">
                    Risk score
                  </span>
                </div>
                
                <span id="fabrication_risk_state" className={`text-xs font-black uppercase tracking-wider font-display mt-3.5 px-3 py-1 rounded border ${getRiskLabelColor(result.fabrication_risk_score)}`}>
                  {result.fabrication_risk_label}
                </span>
              </div>

              {/* Model safe advice message */}
              <p id="system_safe_user_message" className="text-[11px] text-slate-350 leading-relaxed font-sans font-medium bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                "{result.safe_user_message}"
              </p>

              {/* Bullet analysis issues */}
              {result.risk_reasons && result.risk_reasons.length > 0 && (
                <div id="risk_audit_factors" className="space-y-2 text-left">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                    Risk assessment factors
                  </span>
                  <div className="space-y-1.5">
                    {result.risk_reasons.map((rsn, rsnIdx) => (
                      <div 
                        key={`rsn_${rsnIdx}`}
                        className="p-2.5 rounded-lg border border-slate-900 bg-slate-900/30 text-[11px] text-slate-400"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${rsn.severity === 'critical' || rsn.severity === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                          <span className="font-bold text-slate-300 truncate font-display">{rsn.reason}</span>
                        </div>
                        <p className="font-sans leading-relaxed text-[10.5px]">
                          {rsn.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action CTA */}
              <div className="pt-3 border-t border-slate-900 text-left">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                  Recommended Action
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                  {result.recommended_action}
                </p>
              </div>
            </div>

            {/* Registries query check evidence log */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-extrabold text-white text-xs md:text-sm uppercase tracking-wide">
                  Registry Diagnostics
                </h3>
              </div>

              <div id="scholarly_evidence_logs" className="space-y-3">
                {result.verification_evidence.map((evi, evIdx) => (
                  <div 
                    key={`evi_${evIdx}`}
                    className="p-3 rounded-xl border border-slate-900 bg-slate-900/20 flex flex-col gap-1 text-[11px]"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                      <span className="font-extrabold text-slate-300">{evi.source}</span>
                      <span className={`px-1.5 py-0.2 rounded border font-bold ${
                        evi.status === 'matched' 
                          ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                          : evi.status === 'partially matched'
                            ? 'bg-amber-950/35 border-amber-900/35 text-amber-400'
                            : 'bg-rose-950/30 border-rose-900/35 text-rose-400'
                      }`}>
                        {evi.status}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed font-sans bg-slate-950/60 p-2 mt-1.5 rounded text-[10.5px] border border-slate-900">
                      {evi.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
