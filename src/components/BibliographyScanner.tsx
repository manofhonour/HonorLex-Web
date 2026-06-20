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
  Check,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BatchScanSummaryResponse, BatchScanReferenceItem } from '../types';
import { simulateScanReferences } from '../lib/staticDemo';
import { 
  parseReference, 
  formatAPA7, 
  formatMLA9, 
  formatBibTeX 
} from '../lib/citationExporter';

interface BibliographyScannerProps {
  isStatic?: boolean;
  onFocusSingleAudit: (query: string) => void;
  reloadState: any;
  onOperationComplete: (data: any) => void;
  lang: 'en' | 'tr';
}

export default function BibliographyScanner({ isStatic, onFocusSingleAudit, reloadState, onOperationComplete, lang }: BibliographyScannerProps) {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<BatchScanSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedStyleIdx, setCopiedStyleIdx] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [exportFormat, setExportFormat] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Convert references to parsed representation and format them
  const formattedBibliography = scanResult ? scanResult.references.map((ref, idx) => {
    const parsed = parseReference(ref);
    if (exportFormat === 'apa') {
      return {
        raw: formatAPA7(parsed),
        clean: formatAPA7(parsed).replace(/\*/g, '')
      };
    } else if (exportFormat === 'mla') {
      return {
        raw: formatMLA9(parsed),
        clean: formatMLA9(parsed).replace(/\*/g, '')
      };
    } else {
      return {
        raw: formatBibTeX(parsed, idx),
        clean: formatBibTeX(parsed, idx)
      };
    }
  }) : [];

  const handleCopyAll = () => {
    const delimiter = exportFormat === 'bibtex' ? '\n\n' : '\n';
    const textToCopy = formattedBibliography.map((item, idx) => {
      if (exportFormat === 'bibtex') {
        return item.clean;
      } else {
        return `${idx + 1}. ${item.clean}`;
      }
    }).join(delimiter);

    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadFile = () => {
    const delimiter = exportFormat === 'bibtex' ? '\n\n' : '\n';
    const textToDownload = formattedBibliography.map((item, idx) => {
      if (exportFormat === 'bibtex') {
        return item.clean;
      } else {
        return `${idx + 1}. ${item.clean}`;
      }
    }).join(delimiter);

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFormat === 'bibtex' ? 'bibliography.bib' : `bibliography_${exportFormat}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderFormattedLine = (line: string) => {
    const parts = line.split('*');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <span key={index} className="italic text-cyan-350 font-medium">{part}</span>;
      }
      return part;
    });
  };

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

  const handleCopyStyle = (refItem: BatchScanReferenceItem, index: number) => {
    const parsed = parseReference(refItem);
    let text = '';
    if (exportFormat === 'apa') {
      text = formatAPA7(parsed).replace(/\*/g, '');
    } else if (exportFormat === 'mla') {
      text = formatMLA9(parsed).replace(/\*/g, '');
    } else {
      text = formatBibTeX(parsed, index);
    }
    navigator.clipboard.writeText(text);
    setCopiedStyleIdx(index);
    setTimeout(() => setCopiedStyleIdx(null), 2000);
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'Verified':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400';
      case 'Partially verified':
        return 'bg-cyan-950/60 border-cyan-800/80 text-cyan-400';
      case 'DOI mismatch':
        return 'bg-amber-950/40 border-amber-900/35 text-amber-400';
      case 'Unverified':
        return 'bg-slate-900/50 border-slate-800 text-slate-400';
      case 'Possible fabricated citation':
      case 'High-risk citation':
        return 'bg-rose-950/20 border-rose-900/40 text-rose-400 font-bold';
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
        <div className="p-4 bg-rose-950/10 border border-rose-900/50 rounded-2xl flex items-start gap-2.5">
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

          {/* Bibliography Export Panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl" id="bibliography_export_panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3.5">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Format & Export Bibliography
                </h3>
                <p className="text-[10px] text-slate-500 font-sans">
                  Export verified references in standardized citation styles
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">Style:</span>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition cursor-pointer font-sans font-medium"
                >
                  <option value="apa" className="bg-slate-950 text-white font-sans">APA 7th Edition</option>
                  <option value="mla" className="bg-slate-950 text-white font-sans">MLA 9th Edition</option>
                  <option value="bibtex" className="bg-slate-950 text-white font-sans">BibTeX (.bib)</option>
                </select>
              </div>
            </div>

            {/* Display formatted list */}
            <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl p-4 max-h-[250px] overflow-y-auto space-y-3 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {exportFormat === 'bibtex' ? (
                <pre className="font-mono text-[10.5px] text-cyan-200/90 leading-relaxed whitespace-pre select-all" id="bibtex_code_block">
                  {formattedBibliography.map(item => item.clean).join('\n\n')}
                </pre>
              ) : (
                <ol className="list-decimal pl-4.5 space-y-2.5 text-slate-350 leading-relaxed" id="formatted_citations_list">
                  {formattedBibliography.map((item, idx) => (
                    <li key={`formatted_${idx}`} className="pl-1">
                      {renderFormattedLine(item.raw)}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Actions for exporter */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyAll}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer min-w-[110px]"
                id="export_copy_all_btn"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copiedAll ? (
                    <motion.span
                      key="copied_all"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5 text-emerald-450 font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Copied All!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy_all"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy All
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <button
                onClick={handleDownloadFile}
                className="px-4 py-2 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-900/50 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                id="export_download_file_btn"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
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
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(ref.raw_reference, idx);
                        }}
                        className="px-2.5 py-1.2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition flex items-center justify-center gap-1 shrink-0 cursor-pointer min-w-[70px]"
                        id={`copy_raw_reference_btn_${idx}`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {copiedIdx === idx ? (
                            <motion.span
                              key="copied_raw"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.12 }}
                              className="flex items-center gap-1 text-emerald-450 font-bold animate-pulse"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy_raw"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.12 }}
                              className="flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              Copy
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-900/80 bg-slate-950/40 space-y-4">
                      
                      {/* Extracted Metadata identifiers block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                        <div className="p-3 rounded-lg border border-slate-900 bg-slate-900/30">
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-0.5">Parsed Item Authors</span>
                          <span className="text-slate-300 font-medium font-sans flex items-center gap-1">
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

                      {/* Individual formatted item box */}
                      <div className="p-3 rounded-lg border border-slate-900 bg-slate-900/20 space-y-2.5 font-sans">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Selected Style Preview</span>
                            <span className="text-[9.5px] font-mono text-cyan-400 uppercase font-black tracking-wider block">{exportFormat} style</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleCopyStyle(ref, idx)}
                            className="px-2.5 py-1 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-slate-705 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 min-w-[75px]"
                            title="Copy Formatted Citation"
                            id={`copy_formatted_citation_detail_${idx}`}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {copiedStyleIdx === idx ? (
                                <motion.span
                                  key="copied_style"
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.7, opacity: 0 }}
                                  transition={{ duration: 0.12 }}
                                  className="flex items-center gap-1 text-[10px] text-emerald-450 font-semibold"
                                >
                                  <Check className="w-3 h-3" />
                                  Copied
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy_style"
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.7, opacity: 0 }}
                                  transition={{ duration: 0.12 }}
                                  className="flex items-center gap-1 text-[10px]"
                                >
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  Copy Style
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                        <div className="text-[11.5px] text-slate-200 bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-lg leading-relaxed select-all">
                          {exportFormat === 'bibtex' ? (
                            <pre className="font-mono text-[10.5px] text-cyan-200/90 whitespace-pre">{formatBibTeX(parseReference(ref), idx)}</pre>
                          ) : (
                            renderFormattedLine(exportFormat === 'apa' ? formatAPA7(parseReference(ref)) : formatMLA9(parseReference(ref)))
                          )}
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
