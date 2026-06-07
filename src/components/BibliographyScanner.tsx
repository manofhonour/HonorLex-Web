import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  CornerDownRight, 
  ListOrdered,
  FileSearch,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { BatchScanSummaryResponse, BatchScanReferenceItem } from '../types';
import { simulateScanReferences } from '../lib/staticDemo';

interface BibliographyScannerProps {
  isStatic?: boolean;
  onFocusSingleAudit: (query: string) => void;
  reloadState: any;
  onOperationComplete: (data: any) => void;
}

export default function BibliographyScanner({ isStatic, onFocusSingleAudit, reloadState, onOperationComplete }: BibliographyScannerProps) {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<BatchScanSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Sync internal state with history select reload
  useEffect(() => {
    if (reloadState) {
      setText(reloadState.text || '');
      setScanResult(reloadState.result || null);
    }
  }, [reloadState]);
  
  const handleScan = async (demoText?: string) => {
    const activeText = demoText || text;
    if (!activeText.trim()) return;

    setLoading(true);
    setError(null);
    setScanResult(null);

    if (isStatic) {
      setTimeout(() => {
        const dummy = simulateScanReferences(activeText);
        setScanResult(dummy);
        onOperationComplete({
          text: activeText,
          result: dummy
        });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch('/api/scan-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activeText })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server returned ${response.status}`);
      }

      const resData = await response.json();
      setScanResult(resData);

      // Report scan details back to parent history
      onOperationComplete({
        text: activeText,
        result: resData
      });
    } catch (err: any) {
      console.error('[Scan API error]: font size', err);
      setError(err.message || 'Error processing bibliographic scans. Check server configuration.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    // Standard bibliography block with a mix of safe DOIs, review layouts, and fake AI-sounding titles
    const bibStr = `1. Watson, J. D., & Crick, F. H. (1953). Molecular structure of nucleic acids. Nature, 171(4356), 737-738. DOI: 10.1038/171737a0
2. Thompson, G. R. (2026). Exploring the Impact of Machine Learning Frameworks on Computational Fluid Efficiency. Journal of Neural Cybernetics Management, 14(2), 112-132.
3. Fairclough, N. (1992). Discourse and Social Change. Cambridge: Polity Press.
4. Carter, S. L. and Jackson, M. (2024). A Comprehensive Study of Intelligent Grid Design under Generative Adversarial Networks. Systems Logistics Research Letters, 28(4), 450-466.`;
    
    setText(bibStr);
    handleScan(bibStr);
  };

  const handleCopy = (citation: string, idx: number) => {
    navigator.clipboard.writeText(citation);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'Verified':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400';
      case 'Partially verified':
        return 'bg-cyan-950/60 border-cyan-800/80 text-cyan-400';
      case 'DOI mismatch':
        return 'bg-amber-955/40 border-amber-900/35 text-amber-450';
      case 'Unverified':
        return 'bg-slate-900/50 border-slate-800 text-slate-400';
      case 'Possible fabricated citation':
      case 'High-risk citation':
        return 'bg-rose-955/65 border-rose-900/40 text-rose-455 font-bold';
      default:
        return 'bg-slate-950 border-slate-900 text-slate-500';
    }
  };

  const handleClear = () => {
    setText('');
    setScanResult(null);
    setError(null);
  };

  return (
    <div id="bibliography_scanner_module" className="space-y-6">
      
      {/* Entry Panel Card */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5 matches-guide">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            Batch Bibliography Scanner
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Scans and audit-screens up to 10 references from paper lists
          </span>
        </div>

        {/* Privacy Note Banner */}
        <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400 font-sans">
          <AlertTriangle className="w-4 h-4 text-cyan-450 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your text is processed through the AI model to generate suggestions. Do not paste sensitive personal data.
          </p>
        </div>

        <div className="space-y-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            id="batch_citations_input_field"
            className="w-full bg-slate-95 /60 border border-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-xl p-3.5 text-xs font-sans text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-y"
            placeholder="Paste raw bibliography blocks or scientific paper citation lists here. Each entry should preferably be on separate lines or numbered lists..."
          />
        </div>

        {/* Control and triggers */}
        <div className="flex items-center justify-between border-t border-slate-909 pt-3">
          <div className="flex gap-2">
            <button 
              onClick={loadDemo}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-905 border border-slate-800 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
            >
              Load Bibliography Demo
            </button>
            {text && (
              <button 
                onClick={handleClear}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                title="Clear Workspace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleScan()}
            disabled={loading || !text.trim()}
            id="batch_scan_cta_btn"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-950/20 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Interrogating Scholarly Registries & Verifying Fabrications...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-cyan-250" />
                Audit Bibliography List
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-955/10 border border-rose-900/50 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-400 font-semibold font-sans">
            {error}
          </p>
        </div>
      )}

      {/* Scanned outcome layout reports */}
      {scanResult && (
        <div className="space-y-6">
          
          {/* Summary Box */}
          <div className="p-5 bg-cyan-950/10 border border-cyan-950 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider">
              Summary Report Dashboard
            </span>
            <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
              {scanResult.scan_summary}
            </p>
          </div>

          {/* List of scanned cards with responsive headers */}
          <div className="space-y-3" id="batch_scanned_references_list">
            <h4 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 pl-1">
              Iterated Bibliography Items
            </h4>

            {scanResult.references.map((ref, idx) => {
              const isExpanded = expandedIndex === idx;
              const classificationBadgeColor = getClassificationBadge(ref.classification);
              const isHighRisk = ref.risk_score >= 60;

              return (
                <div 
                  key={`scan_${idx}`}
                  className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
                    isExpanded 
                      ? 'border-slate-805 bg-slate-950 shadow-xl' 
                      : 'border-slate-900 bg-slate-950/60 hover:border-slate-800'
                  }`}
                >
                  {/* Card Header row click listener */}
                  <div 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  >
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono font-extrabold text-slate-400 shrink-0 select-none">
                          {idx + 1}
                        </span>
                        <span className={`text-[9.5px] font-mono font-black uppercase tracking-wide px-2 py-0.5 rounded border ${classificationBadgeColor}`}>
                          {ref.classification}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          isHighRisk ? 'border-rose-900/60 text-rose-400 bg-rose-950/20' : 'border-slate-800 text-slate-400 bg-slate-900/40'
                        }`}>
                          Risk Score: {ref.risk_score}%
                        </span>
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-205 leading-relaxed truncate font-sans pr-4">
                        {ref.raw_reference}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-sans text-xs font-semibold self-end sm:self-center shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(ref.raw_reference, idx);
                        }}
                        className="px-2.5 py-1.2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-450 hover:bg-slate-850 hover:text-slate-300 transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-900/80 bg-slate-950/40 space-y-4">
                      
                      {/* Extracted Metadata identifiers block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                        <div className="p-3 rounded-lg border border-slate-900 bg-slate-900/30">
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Parsed Item Authors</span>
                          <span className="text-slate-300 font-medium font-sans">
                            {ref.extracted_authors || (
                              <span className="italic text-slate-650">Could not resolve</span>
                            )}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-slate-900 bg-slate-900/30">
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Parsed Work Title</span>
                          <span className="text-slate-300 font-medium font-sans italic">
                            {ref.extracted_title || (
                              <span className="italic text-slate-650">Could not resolve</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* AI-Annotated explanation alerts */}
                      <div className="p-3.5 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-900 font-sans text-[11px]">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <AlertTriangle className="w-4 h-4 text-cyan-400" />
                          <span className="font-extrabold uppercase font-mono tracking-wide text-[9px]">Audit Inspection Note</span>
                        </div>
                        <p className="text-slate-200">
                          {ref.alert_message}
                        </p>
                        <p className="text-slate-450 leading-relaxed border-l-2 border-slate-800 pl-2.5 mt-2">
                          {ref.rationale}
                        </p>
                      </div>

                      {/* Individual Citation Auditor action deep dive */}
                      <div className="flex items-center justify-end gap-1.5 text-[10.5px] font-mono tracking-wide">
                        <button
                          onClick={() => onFocusSingleAudit(ref.raw_reference)}
                          className="text-cyan-400 hover:underline flex items-center gap-1 transition cursor-pointer"
                        >
                          Send to Citation Auditor for deep-dive metadata validation
                          <CornerDownRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
