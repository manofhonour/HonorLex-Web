import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Type, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Slash, 
  X, 
  HeartHandshake,
  Paintbrush,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import * as Tesseract from 'tesseract.js';
import { SlidePage, OCRegion, RegionAction } from '../types';

interface SlideEditorProps {
  slide: SlidePage;
  onUpdateRegions: (regions: OCRegion[]) => void;
}

export default function SlideEditor({ slide, onUpdateRegions }: SlideEditorProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentDragRect, setCurrentDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ocrLoadingId, setOcrLoadingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-select newly created region or default to first region
  useEffect(() => {
    if (slide.regions.length > 0 && !selectedRegionId) {
      setSelectedRegionId(slide.regions[0].id);
    }
  }, [slide.regions, selectedRegionId]);

  // Helper to extract background color average to pre-fill regions
  const extractAverageColorOfCrop = (ctx: CanvasRenderingContext2D, w: number, h: number): string => {
    try {
      const data = ctx.getImageData(0, 0, Math.max(1, w), Math.max(1, h)).data;
      let r = 0, g = 0, b = 0, count = 0;
      // sample every 4th pixel
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      if (count === 0) return '#FFFFFF';
      const ravg = Math.round(r / count).toString(16).padStart(2, '0');
      const gavg = Math.round(g / count).toString(16).padStart(2, '0');
      const bavg = Math.round(b / count).toString(16).padStart(2, '0');
      return `#${ravg}${gavg}${bavg}`;
    } catch {
      return '#FFFFFF';
    }
  };

  // Run Tesseract OCR on a specific region
  const triggerOcrOnRegion = async (regionId: string) => {
    const region = slide.regions.find(r => r.id === regionId);
    if (!region) return;

    setOcrLoadingId(regionId);
    
    // Create an image object to crop contents
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not setup offscreen canvas.");

        // Convert percentage to absolute source pixels
        const pixelX = (region.x / 100) * img.width;
        const pixelY = (region.y / 100) * img.height;
        const pixelW = (region.width / 100) * img.width;
        const pixelH = (region.height / 100) * img.height;

        canvas.width = Math.max(1, pixelW);
        canvas.height = Math.max(1, pixelH);

        context.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
        
        const cropDataUrl = canvas.toDataURL('image/png');
        const sampledBackground = extractAverageColorOfCrop(context, canvas.width, canvas.height);

        // Run client-side Tesseract.js call
        const result = await Tesseract.recognize(
          cropDataUrl, 
          'eng',
          { logger: () => {} }
        );

        const text = result.data.text.trim();
        const conf = result.data.confidence;

        // Automatically estimate standard font size relative to crop height (scaled to points)
        // Usually, 1 slide is on average 540px tall, standard text height scales nicely.
        const estimatedFontSize = Math.max(10, Math.round(pixelH / 3.2));

        // Update target region state
        const updated = slide.regions.map(r => {
          if (r.id === regionId) {
            return {
              ...r,
              ocrText: text || 'Double click to write manual text...',
              ocrConfidence: conf,
              originalImageBytes: cropDataUrl,
              formatting: {
                ...r.formatting,
                fontSize: estimatedFontSize > 40 ? 18 : estimatedFontSize,
                backgroundColor: sampledBackground // Pre-fill with matching color mask!
              }
            };
          }
          return r;
        });

        onUpdateRegions(updated);
      } catch (err) {
        console.error("Tesseract Engine OCR error", err);
      } finally {
        setOcrLoadingId(null);
      }
    };
    img.src = slide.dataUrl;
  };

  // Convert client cursor coords to percentage values relative to the canvas container
  const getContainerRelativePercent = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y))
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Left-click only
    if (e.button !== 0) return;
    
    // Check if clicked inside an existing region (to select it), unless the drag is starting
    const target = e.target as HTMLElement;
    if (target.closest('.region-rect')) {
      return; 
    }

    const { x, y } = getContainerRelativePercent(e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentDragRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentDragRect) return;

    const { x, y } = getContainerRelativePercent(e.clientX, e.clientY);
    
    const minX = Math.min(startPos.x, x);
    const minY = Math.min(startPos.y, y);
    const w = Math.abs(startPos.x - x);
    const h = Math.abs(startPos.y - y);

    setCurrentDragRect({ x: minX, y: minY, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDragRect) return;
    setIsDrawing(false);

    // Only create regions that are substantial (e.g. at least 1% width/height)
    if (currentDragRect.w > 1.5 && currentDragRect.h > 1.5) {
      const newId = `region_${Date.now()}`;
      const newRegion: OCRegion = {
        id: newId,
        x: currentDragRect.x,
        y: currentDragRect.y,
        width: currentDragRect.w,
        height: currentDragRect.h,
        action: 'ocr', // default state
        ocrText: '',
        ocrConfidence: 0,
        formatting: {
          fontSize: 14,
          fontColor: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          align: 'left',
          backgroundColor: '#FFFFFF',
        }
      };

      const updated = [...slide.regions, newRegion];
      onUpdateRegions(updated);
      setSelectedRegionId(newId);
      
      // Auto-trigger OCR extraction on drawing complete
      triggerOcrOnRegion(newId);
    }

    setCurrentDragRect(null);
  };

  // Modify specific selected region parameter
  const updateSelectedRegion = (changes: Partial<OCRegion>) => {
    if (!selectedRegionId) return;
    const updated = slide.regions.map(r => {
      if (r.id === selectedRegionId) {
        return { ...r, ...changes };
      }
      return r;
    });
    onUpdateRegions(updated);
  };

  // Modify formatting attributes
  const updateSelectedFormatting = (changes: Partial<OCRegion['formatting']>) => {
    if (!selectedRegionId) return;
    const region = slide.regions.find(r => r.id === selectedRegionId);
    if (!region) return;

    updateSelectedRegion({
      formatting: {
        ...region.formatting,
        ...changes
      }
    });
  };

  const deleteRegion = (id: string) => {
    const updated = slide.regions.filter(r => r.id !== id);
    onUpdateRegions(updated);
    if (selectedRegionId === id) {
      setSelectedRegionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const selectedRegion = slide.regions.find(r => r.id === selectedRegionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="slide_workspace_panel">
      
      {/* LEFT: Live Interactive Interactive Drawing Deck (7 Columns) */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
          <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            Drawing Workspace Mode
          </span>
          <span>Click & drag on image to construct text boxes</span>
        </div>

        {/* Live Drawing Stage Wrapper */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          id="drawing_viewport_stage"
          className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 select-none shadow-2xl shadow-slate-950/80 cursor-crosshair group active:shadow-cyan-950/20 active:border-cyan-500/30 transition-all duration-300"
        >
          {/* Main Slide background image */}
          <img 
            src={slide.dataUrl} 
            alt={`Slide ${slide.pageNumber}`} 
            className="w-full h-auto pointer-events-none block"
            referrerPolicy="no-referrer"
          />

          {/* Render active drawn regions overlays */}
          {slide.regions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            let themeClass = 'border-cyan-400 bg-cyan-400/10 text-cyan-300'; // ocr default
            
            if (region.action === 'redact') {
              themeClass = 'border-rose-500 bg-rose-500/10 text-rose-300';
            } else if (region.action === 'keep') {
              themeClass = 'border-amber-400 bg-amber-400/10 text-amber-300';
            } else if (region.action === 'ignore') {
              themeClass = 'border-slate-500 bg-slate-500/5 text-slate-400';
            }

            return (
              <div
                key={region.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegionId(region.id);
                }}
                className={`absolute border region-rect region-highlight cursor-pointer ${themeClass} ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-cyan-400 z-30' : 'z-10'
                }`}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`
                }}
              >
                {/* Micro Action Badge Pin */}
                <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-slate-950/90 text-[10px] font-mono rounded border border-slate-800 font-bold backdrop-blur-xs flex items-center gap-1 shadow-md">
                  {region.action === 'ocr' && <Type className="w-3 h-3 text-cyan-400" />}
                  {region.action === 'redact' && <Paintbrush className="w-3 h-3 text-rose-400" />}
                  {region.action === 'keep' && <Sparkles className="w-3 h-3 text-amber-400" />}
                  {region.action === 'ignore' && <Slash className="w-3 h-3 text-slate-400" />}
                  {region.action.toUpperCase()}
                </span>

                {/* Micro quick-close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRegion(region.id);
                  }}
                  className="absolute -top-5 -right-1 px-1 py-0.5 bg-slate-950/80 text-rose-400 hover:text-rose-300 text-[10px] rounded border border-slate-800 backdrop-blur-xs flex items-center shadow"
                  title="Remove segment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Render active dragging selection helper box */}
          {currentDragRect && (
            <div 
              className="absolute border border-dashed border-cyan-400 bg-cyan-400/10 pointer-events-none z-40"
              style={{
                left: `${currentDragRect.x}%`,
                top: `${currentDragRect.y}%`,
                width: `${currentDragRect.w}%`,
                height: `${currentDragRect.h}%`
              }}
            />
          )}
        </div>

        <div className="text-center text-slate-500 text-[11px] font-mono italic">
          Tip: You can select, resize, and edit each highlighted bounding zone interactively.
        </div>
      </div>

      {/* RIGHT: Selected Region Control Inspector Dashboard (5 Columns) */}
      <div className="lg:col-span-12 xl:col-span-5 space-y-4">
        
        {/* Regions Index Summary Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h4 className="font-display font-bold text-slate-100 text-sm flex items-center justify-between">
            <span>Drawn Focus Regions ({slide.regions.length})</span>
            <span className="text-xs font-normal text-slate-400">Selected Slide #{slide.pageNumber}</span>
          </h4>

          {slide.regions.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-800/80 rounded-xl bg-slate-950/40 text-slate-500 text-xs px-4 space-y-2">
              <Scan className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
              <p>No active highlights detected on this slide page.</p>
              <p className="text-[10px]">Use the pointer tool on the left presentation window to frame target headings or paragraph blocks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {slide.regions.map((reg, idx) => {
                const isSelected = selectedRegionId === reg.id;
                return (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`p-2 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400/80 bg-cyan-950/20 text-slate-200 shadow-sm shadow-cyan-950/20'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Block #{idx + 1} ({reg.action})
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRegion(reg.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Individual Region Inspector Panel */}
        {selectedRegion ? (
          <div className="p-5 bg-slate-900 border border-cyan-950/40 rounded-xl space-y-4" id="region_inspector_panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                  Region Editor & Parameters
                </span>
                <h5 className="font-display font-semibold text-slate-200 text-sm">
                  Editing Coordinate Zone
                </h5>
              </div>

              <button
                onClick={() => deleteRegion(selectedRegion.id)}
                className="p-1 px-2.5 rounded-lg border border-red-900/40 bg-red-950/20 text-[11px] font-semibold text-rose-400 hover:bg-red-950/50 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Area
              </button>
            </div>

            {/* Action State Radio Toggles */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block font-mono">
                Assigned Deck Processing Action:
              </label>
              <div className="grid grid-cols-2 gap-2">
                
                {/* 1. OCR Action */}
                <button
                  onClick={() => updateSelectedRegion({ action: 'ocr' })}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 bg-slate-950 transition-all ${
                    selectedRegion.action === 'ocr'
                      ? 'border-cyan-400 text-cyan-400 shadow shadow-cyan-950/50'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>OCR text overlay</span>
                </button>

                {/* 2. Redact Action */}
                <button
                  onClick={() => updateSelectedRegion({ action: 'redact' })}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 bg-slate-950 transition-all ${
                    selectedRegion.action === 'redact'
                      ? 'border-rose-400 text-rose-400 shadow shadow-rose-950/50'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Redact watermarks or logos on slides"
                >
                  <Paintbrush className="w-4 h-4" />
                  <span>Redact branding</span>
                </button>

                {/* 3. Keep Action */}
                <button
                  onClick={() => updateSelectedRegion({ action: 'keep' })}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 bg-slate-950 transition-all ${
                    selectedRegion.action === 'keep'
                      ? 'border-amber-400 text-amber-400 shadow shadow-amber-950/50'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Keep as image</span>
                </button>

                {/* 4. Ignore Action */}
                <button
                  onClick={() => updateSelectedRegion({ action: 'ignore' })}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 bg-slate-950 transition-all ${
                    selectedRegion.action === 'ignore'
                      ? 'border-slate-700 text-slate-300'
                      : 'border-slate-850 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Slash className="w-4 h-4" />
                  <span>Ignore area</span>
                </button>

              </div>
            </div>

            {/* Sub-inspector views for different processing Actions */}

            {selectedRegion.action === 'redact' && (
              <div className="p-3 bg-rose-950/15 border border-rose-900/30 rounded-lg space-y-2.5 text-xs text-rose-300" id="action_redact_inspector">
                <span className="font-semibold block flex items-center gap-1.5 text-rose-400">
                  <Paintbrush className="w-3.5 h-3.5" />
                  Redact Branding Settings
                </span>
                <p>This action covers this specific rectangle with a solid vector block in the PowerPoint file, masking underlying watermarks, branding labels, page numbers, or unwanted markings.</p>
                <div className="flex items-center gap-2 pt-1 border-t border-rose-950/30">
                  <span>Redact Fill Color:</span>
                  <div className="flex gap-1.5">
                    {['#FFFFFF', '#0F172A', '#E2E8F0', '#000000'].map(col => (
                      <button
                        key={col}
                        onClick={() => updateSelectedFormatting({ backgroundColor: col })}
                        className={`w-6 h-6 rounded-md border ${
                          selectedRegion.formatting.backgroundColor === col ? 'ring-2 ring-cyan-400 border-white' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: col }}
                        title={col}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={selectedRegion.formatting.backgroundColor || '#FFFFFF'}
                    onChange={(e) => updateSelectedFormatting({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded bg-transparent cursor-pointer border-0"
                  />
                </div>
              </div>
            )}

            {selectedRegion.action === 'ocr' && (
              <div className="space-y-4" id="action_ocr_inspector">
                
                {/* Confidence Level & Status Banner */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Confidence Metric:</span>
                  {ocrLoadingId === selectedRegion.id ? (
                    <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Engine processing...
                    </span>
                  ) : selectedRegion.ocrConfidence > 0 ? (
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      selectedRegion.ocrConfidence < 75 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-green-950 text-green-300 border border-green-800'
                    }`}>
                      {selectedRegion.ocrConfidence}%
                    </span>
                  ) : (
                    <span className="text-slate-500">Not Analyzed</span>
                  )}
                </div>

                {/* Show OCR quality warnings */}
                {!ocrLoadingId && selectedRegion.ocrConfidence > 0 && selectedRegion.ocrConfidence < 75 && (
                  <div className="p-2.5 bg-amber-950/25 border border-amber-900 rounded-lg flex items-start gap-2 text-xs text-amber-300" id="ocr_confidence_warning">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Low OCR Confidence Warning:</span> Text recognition yields ambiguous character pairs inside charts or small graphics. Please manually check and double-check outputs below.
                    </div>
                  </div>
                )}

                {/* Visual before/after crop comparers */}
                {selectedRegion.originalImageBytes && (
                  <div className="grid grid-cols-2 gap-2 border border-slate-800 rounded-lg p-2.5 bg-slate-950">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 font-mono block">Original Image Crop</span>
                      <div className="bg-slate-900 rounded border border-slate-800 p-1 flex items-center justify-center min-h-[50px] overflow-hidden">
                        <img 
                          src={selectedRegion.originalImageBytes} 
                          alt="Original Segment" 
                          className="max-h-12 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-cyan-500 font-mono block">Powerpoint editable Text</span>
                      <div className="bg-slate-900 rounded border border-slate-800 p-1.5 flex items-center justify-center min-h-[50px] text-center">
                        <span className="text-[11px] font-semibold text-slate-300 line-clamp-2 truncate">
                          {selectedRegion.ocrText || '(No text yet)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text editor box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 block font-mono">
                      Editable Slide Text Block Content:
                    </label>
                    <button
                      onClick={() => triggerOcrOnRegion(selectedRegion.id)}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-OCR
                    </button>
                  </div>
                  <textarea
                    value={selectedRegion.ocrText}
                    onChange={(e) => updateSelectedRegion({ ocrText: e.target.value })}
                    className="w-full h-24 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-cyan-400 outline-none text-xs leading-relaxed font-sans"
                    placeholder="Input recognized text manually here..."
                  />
                </div>

                {/* Font Properties Controllers */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block font-mono">
                    Text Box Presentation Styling:
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    
                    {/* Font Size Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 block">Font Size (Estimated pt):</label>
                      <input 
                        type="number"
                        min="6"
                        max="72"
                        value={selectedRegion.formatting.fontSize}
                        onChange={(e) => updateSelectedFormatting({ fontSize: Number(e.target.value) })}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none text-center font-bold"
                      />
                    </div>

                    {/* Font color Hex Text Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500 block">Font Color (Hex):</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="text"
                          value={selectedRegion.formatting.fontColor}
                          onChange={(e) => updateSelectedFormatting({ fontColor: e.target.value })}
                          className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs text-center font-mono"
                          placeholder="#000000"
                        />
                        <input
                          type="color"
                          value={selectedRegion.formatting.fontColor || '#000000'}
                          onChange={(e) => updateSelectedFormatting({ fontColor: e.target.value })}
                          className="w-7 h-7 rounded bg-transparent cursor-pointer border-0 mt-0.5 shrink-0"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Font properties flags alignment togglers */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    
                    {/* Bold Italic flags */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateSelectedFormatting({ fontWeight: selectedRegion.formatting.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={`p-2 rounded border cursor-pointer ${
                          selectedRegion.formatting.fontWeight === 'bold'
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-400 font-extrabold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Toggle Bold style"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => updateSelectedFormatting({ fontStyle: selectedRegion.formatting.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`p-2 rounded border cursor-pointer ${
                          selectedRegion.formatting.fontStyle === 'italic'
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-400 italic'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Toggle Italic style"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Alignment toggles */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {(['left', 'center', 'right'] as const).map(alignValue => (
                        <button
                          key={alignValue}
                          onClick={() => updateSelectedFormatting({ align: alignValue })}
                          className={`p-1 px-2.5 rounded text-[11px] font-semibold flex items-center justify-center transition cursor-pointer ${
                            selectedRegion.formatting.align === alignValue
                              ? 'bg-slate-800 text-cyan-400 font-bold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {alignValue === 'left' && <AlignLeft className="w-3 h-3" />}
                          {alignValue === 'center' && <AlignCenter className="w-3 h-3" />}
                          {alignValue === 'right' && <AlignRight className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Mask background switcher */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />
                      PowerPoint Cover-Mask Fill:
                    </span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color"
                        value={selectedRegion.formatting.backgroundColor || '#FFFFFF'}
                        onChange={(e) => updateSelectedFormatting({ backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded bg-transparent cursor-pointer border-0"
                      />
                      <button 
                        onClick={() => updateSelectedFormatting({ backgroundColor: undefined })}
                        className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight border ${
                          !selectedRegion.formatting.backgroundColor 
                            ? 'border-cyan-400 text-cyan-400' 
                            : 'border-slate-800 text-slate-500 hover:text-slate-300 bg-slate-950'
                        }`}
                      >
                        Transparent
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Note: Placing a color-mask hides the original text on the background image so it doesn't overlap under your editable PowerPoint text box.
                  </p>

                </div>

              </div>
            )}

            {selectedRegion.action === 'keep' && (
              <div id="action_keep_inspector" className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-800 text-xs leading-relaxed text-slate-400">
                <span className="font-semibold text-slate-200 block text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Keep as Image
                </span>
                <p>This retains this rectangular region strictly as-is inside the original background slide design image without adding editable overlays, suitable for keeping logos, specific graphs, diagram panels, formulas, or drawings pristine.</p>
              </div>
            )}

            {selectedRegion.action === 'ignore' && (
              <div id="action_ignore_inspector" className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-850 text-xs leading-relaxed text-slate-500">
                <span className="font-semibold block flex items-center gap-1.5 text-slate-400">
                  <Slash className="w-3.5 h-3.5" /> Ignored Area
                </span>
                <p>Ignored areas serve as a simple bookmark label references and undergo no special processing or masking in the final export deck.</p>
              </div>
            )}

          </div>
        ) : (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3" id="no_selected_inspector">
            <Type className="w-8 h-8 text-cyan-500/30 mx-auto" />
            <h5 className="font-display font-medium text-slate-400 text-sm">
              No Selected Highlight
            </h5>
            <p className="text-slate-500 text-xs">
              Draw a new rect bounding box, or click an existing rectangle on the slide frame to configure actions, run OCR layers, or style font sizes.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
