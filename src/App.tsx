import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Layers, 
  Eye, 
  Columns, 
  HelpCircle, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw,
  Scale,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ShieldAlert
} from 'lucide-react';

import { SlidePage, OCRegion, OCRConfidenceWarning } from './types';
import PDFUploader from './components/PDFUploader';
import SlideEditor from './components/SlideEditor';
import BeforeAfterViewer from './components/BeforeAfterViewer';
import LegalNotice from './components/LegalNotice';
import { exportToPPTX } from './components/PPTXExporter';

export default function App() {
  const [slides, setSlides] = useState<SlidePage[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [exporting, setExporting] = useState(false);
  const [filename, setFilename] = useState('HonorLM_Presentation.pptx');

  // Load a demonstration slide deck immediately on launch to support immediate click-testing
  useEffect(() => {
    loadDemoSlideDeck();
  }, []);

  const loadDemoSlideDeck = () => {
    const demoSlides: SlidePage[] = [];
    const templates = [
      {
        title: 'NEURAL SYSTEM PRINCIPLES',
        subtitle: 'Lecture 12: Sequence Models and Recurrent Operations',
        badge: 'AI-2026',
        watermark: 'CONFIDENTIAL COPY - UNAUTHORIZED SHARING PROHIBITED',
        bgColor: '#0B132B', // Deep obsidian blue slide
        fgColor: '#F4F4F9',
        accentColor: '#38BDF8',
      },
      {
        title: 'DATA FLOW & INTERFACE DESIGN',
        subtitle: 'Optimizing interactive telemetry layers',
        badge: 'UIX-CORE',
        watermark: 'PROPERTY OF ACADEMIA CORP - DRAFT ONLY',
        bgColor: '#FFFFFF', // High-contrast clean white slide
        fgColor: '#0F172A',
        accentColor: '#0284C7',
      }
    ];

    for (let idx = 0; idx < templates.length; idx++) {
      const template = templates[idx];
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Render template background
        ctx.fillStyle = template.bgColor;
        ctx.fillRect(0, 0, 960, 540);

        // Render elegant grid backing lines to represent an academic template layout
        ctx.strokeStyle = template.bgColor === '#FFFFFF' ? '#F1F5F9' : '#1E293B';
        ctx.lineWidth = 1.5;
        for (let xOffset = 60; xOffset < 960; xOffset += 120) {
          ctx.beginPath();
          ctx.moveTo(xOffset, 0);
          ctx.lineTo(xOffset, 540);
          ctx.stroke();
        }

        // Sidebar Accent Stripe
        ctx.fillStyle = template.accentColor;
        ctx.fillRect(80, 110, 6, 110);

        // Drawing title texts
        ctx.fillStyle = template.fgColor;
        ctx.font = 'bold 36px "Outfit", sans-serif';
        ctx.fillText(template.title, 110, 150);

        ctx.font = '16px "Inter", sans-serif';
        ctx.fillStyle = template.bgColor === '#FFFFFF' ? '#475569' : '#94A3B8';
        ctx.fillText(template.subtitle, 110, 195);

        // Render code badge
        ctx.fillStyle = template.accentColor + '20'; // 12% opacity Hex
        ctx.fillRect(110, 225, 95, 28);
        ctx.strokeStyle = template.accentColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(110, 225, 95, 28);
        ctx.fillStyle = template.accentColor;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(template.badge, 130, 242);

        // Draw slide artwork block representing a diagram (OCR safely ignores this region!)
        ctx.strokeStyle = template.accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(580, 110, 280, 260);
        ctx.fillStyle = template.bgColor === '#FFFFFF' ? '#F8FAFC' : '#111827';
        ctx.fillRect(581, 111, 278, 258);

        ctx.beginPath();
        ctx.arc(720, 220, 45, 0, 2 * Math.PI);
        ctx.fillStyle = template.accentColor + '30';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = template.fgColor;
        ctx.font = 'bold 13px "Inter", sans-serif';
        ctx.fillText('Central Flow Processor', 655, 305);

        // Render the unwanted copyright watermark branding text lines (which the user can redact or clear out!)
        ctx.fillStyle = '#EF4444'; // Glowing red
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillText(`[WATERMARK: ${template.watermark}]`, 110, 480);

        // Footer Metadata Indicator
        ctx.fillStyle = '#64748B';
        ctx.font = '11px monospace';
        ctx.fillText(`HONORLM CONVERTER DECK • SLIDE PAGE 0${idx + 1} OF 02`, 110, 510);
      }

      demoSlides.push({
        pageNumber: idx + 1,
        width: 960,
        height: 540,
        aspectRatio: 16/9,
        dataUrl: canvas.toDataURL('image/png'),
        regions: [
          // Pre-populate an OCR Region
          {
            id: `demo_ocr_${idx}`,
            x: 10.5,
            y: 21,
            width: 46,
            height: 9,
            action: 'ocr',
            ocrText: template.title,
            ocrConfidence: 98,
            formatting: {
              fontSize: 22,
              fontColor: template.fgColor === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
              fontWeight: 'bold',
              fontStyle: 'normal',
              align: 'left',
              backgroundColor: template.bgColor
            },
            originalImageBytes: ''
          },
          // Pre-populate a Low Confidence OCR Region for illustration
          {
            id: `demo_warn_${idx}`,
            x: 68,
            y: 53.5,
            width: 14,
            height: 4.5,
            action: 'ocr',
            ocrText: 'F|ow Froc',
            ocrConfidence: 58, // Low confidence to trigger warnings UI block
            formatting: {
              fontSize: 12,
              fontColor: template.accentColor,
              fontWeight: 'bold',
              fontStyle: 'normal',
              align: 'center',
              backgroundColor: template.bgColor === '#FFFFFF' ? '#F8FAFC' : '#111827'
            },
            originalImageBytes: ''
          },
          // Pre-populate a Redaction Region over the unwanted watermark
          {
            id: `demo_redact_${idx}`,
            x: 11,
            y: 86.5,
            width: 53,
            height: 4,
            action: 'redact',
            ocrText: '',
            ocrConfidence: 0,
            formatting: {
              fontSize: 11,
              fontColor: '#000000',
              fontWeight: 'normal',
              fontStyle: 'normal',
              align: 'left',
              backgroundColor: template.bgColor
            }
          }
        ]
      });
    }

    setSlides(demoSlides);
    setSelectedSlideIndex(0);
  };

  const handleUploadSuccess = (newSlides: SlidePage[]) => {
    setSlides(newSlides);
    setSelectedSlideIndex(0);
  };

  const updateSlideRegions = (slideIndex: number, newRegions: OCRegion[]) => {
    const updated = slides.map((slide, idx) => {
      if (idx === slideIndex) {
        return { ...slide, regions: newRegions };
      }
      return slide;
    });
    setSlides(updated);
  };

  const handleExport = async () => {
    if (slides.length === 0) return;
    setExporting(true);
    try {
      await exportToPPTX(slides, filename.endsWith('.pptx') ? filename : `${filename}.pptx`);
    } catch (err) {
      console.error('Failed to compile PowerPoint deck', err);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Discard current document and reset?')) {
      setSlides([]);
      setSelectedSlideIndex(0);
    }
  };

  // Compile OCR warnings with low confidence (< 75%) from all pages
  const confidenceWarnings: OCRConfidenceWarning[] = [];
  slides.forEach((sl) => {
    sl.regions.forEach((reg) => {
      if (reg.action === 'ocr' && reg.ocrConfidence > 0 && reg.ocrConfidence < 75) {
        confidenceWarnings.push({
          slideNumber: sl.pageNumber,
          regionId: reg.id,
          text: reg.ocrText,
          confidence: reg.ocrConfidence
        });
      }
    });
  });

  const activeSlide = slides[selectedSlideIndex];

  return (
    <div id="honor_app_root" className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      
      {/* HEADER SECTION WITH OK LOGO */}
      <header id="honor_main_header" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & OK Logo */}
        <div className="flex items-center gap-3">
          <div 
            id="honor_ok_logo"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 via-cyan-900 to-slate-900 border border-cyan-400/40 font-display font-extrabold flex items-center justify-center select-none shadow-md"
            title="HonorLM Logo"
          >
            <span className="text-xl font-black italic tracking-tighter text-cyan-400">O<span className="text-white">K</span></span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-1.5">
              HonorLM
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
                v1.2 PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Convert Scanned PDF Slide Decks to Editable PowerPoint Decks
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {slides.length > 0 && (
            <>
              {/* File name editor */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-2 font-mono">Export:</span>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-transparent text-xs font-semibold font-mono text-slate-200 focus:outline-none w-44 border-0"
                  placeholder="presentation_name.pptx"
                />
              </div>

              {/* Reset state */}
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-400 transition"
                title="Reset Workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Export PPTX Trigger Action */}
              <button
                onClick={handleExport}
                disabled={exporting}
                id="btn_build_presentation"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs md:text-sm shadow-lg shadow-cyan-950/20 flex items-center gap-2 transition cursor-pointer"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Packaging PPTX...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export PowerPoint (.pptx)
                  </>
                )}
              </button>
            </>
          )}

          {slides.length === 0 && (
            <button
              onClick={loadDemoSlideDeck}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 font-semibold rounded-lg text-xs border border-slate-800 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Load Demo Presentation
            </button>
          )}
        </div>
      </header>

      {/* WORKSPACE CHASSIS GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Mandated Legal & Ethical Notice bar */}
        <LegalNotice />

        {slides.length === 0 ? (
          /* Empty / Upload View */
          <div className="max-w-2xl mx-auto py-12" id="empty_uploader_workspace">
            <PDFUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          /* Editor Dashboard View */
          <div className="space-y-6" id="loaded_dashboard_workspace">
            
            {/* Slide Navigation Ribbon & Ribbon Toolbar */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
              
              {/* Toolbar metadata */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-b border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-display font-medium text-slate-200">
                    Deck Slide Pages ({slides.length})
                  </span>
                  <div className="h-4 w-px bg-slate-800" />
                  <span className="text-slate-400">
                    Active page: <strong className="text-cyan-400">Slide #{selectedSlideIndex + 1}</strong>
                  </span>
                </div>

                {/* Main View Mode Selector Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/80 p-1 border border-slate-850 rounded-lg">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'editor'
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Regions Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Before/After Preview
                  </button>
                </div>
              </div>

              {/* Slider Thumbnail ribbons */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {slides.map((sl, idx) => {
                  const isSelected = selectedSlideIndex === idx;
                  const regionsCount = sl.regions.length;
                  const ocrCount = sl.regions.filter(r => r.action === 'ocr').length;
                  const redactCount = sl.regions.filter(r => r.action === 'redact').length;

                  return (
                    <button
                      key={`thumb_${idx}`}
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`flex-none group relative w-36 aspect-[16/9] bg-slate-900 border-2 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-400 ring-2 ring-cyan-950 scale-102' 
                          : 'border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      {/* Image Thumbnail representer */}
                      <img 
                        src={sl.dataUrl} 
                        alt={`Slide ${idx + 1}`} 
                        className="w-full h-full object-cover select-none pointer-events-none opacity-80 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />

                      {/* Number Indicator badge */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-slate-950/80 text-[10px] font-mono font-bold rounded border border-slate-800 text-slate-300">
                        P.{sl.pageNumber}
                      </div>

                      {/* Region counts overlays */}
                      {regionsCount > 0 && (
                        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                          {ocrCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-800/60 text-[8.5px] font-bold rounded text-cyan-400 font-mono">
                              O:{ocrCount}
                            </span>
                          )}
                          {redactCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-rose-950 border border-rose-900/60 text-[8.5px] font-bold rounded text-rose-400 font-mono">
                              R:{redactCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* MAIN INTERACTIVE INTERFACES */}
            {activeTab === 'editor' ? (
              <SlideEditor 
                slide={activeSlide}
                onUpdateRegions={(regions) => updateSlideRegions(selectedSlideIndex, regions)}
              />
            ) : (
              <BeforeAfterViewer slide={activeSlide} />
            )}

            {/* OCR QUALITY HEALTH WARNING CONTROL BOARD */}
            {confidenceWarnings.length > 0 && (
              <div className="p-5 bg-amber-950/10 border border-amber-950 rounded-2xl space-y-3.5" id="global_confidence_dashboard">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-900/30">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <h4 className="font-display font-semibold text-amber-200 text-sm md:text-base">
                    Document-Wide OCR Confidence Alerts ({confidenceWarnings.length})
                  </h4>
                </div>
                
                <p className="text-slate-400 text-xs">
                  The following scanned fields generated lower OCR confidence statistics due to font scales, noise, or template elements. We recommend manually checking these zones to verify correct characters:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {confidenceWarnings.map((warn, wIdx) => (
                    <div 
                      key={`warn_${wIdx}`}
                      onClick={() => {
                        setSelectedSlideIndex(warn.slideNumber - 1);
                        setActiveTab('editor');
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-amber-900/80 transition cursor-pointer flex flex-col justify-between gap-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-cyan-400 font-bold hover:underline">Slide #{warn.slideNumber}</span>
                        <span className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/20 font-bold">
                          {warn.confidence}% Accuracy
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-md italic text-slate-300 text-xs border border-slate-850 truncate">
                        "{warn.text || '(empty field)'}"
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans tracking-wide mt-1 text-right">
                        Click to focus slide page →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER CREDIT BAR */}
      <footer className="border-t border-slate-900 px-6 py-4 mt-auto bg-slate-950 text-slate-500 text-xs text-center font-mono">
        <div>
          HonorLM • Built with React, Vite, and Tesseract.js. All conversions executed strictly client-side to ensure compliance and data hygiene.
        </div>
      </footer>

    </div>
  );
}
