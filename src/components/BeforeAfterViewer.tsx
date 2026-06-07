import React, { useState } from 'react';
import { Columns, Eye, ArrowLeftRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SlidePage, OCRegion } from '../types';

interface BeforeAfterViewerProps {
  slide: SlidePage;
}

export default function BeforeAfterViewer({ slide }: BeforeAfterViewerProps) {
  const [viewMode, setViewMode] = useState<'sideBySide' | 'interactiveSplit'>('sideBySide');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5" id="before_after_viewer">
      
      {/* Title with Mode Switches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Interactive Presentation Simulation
          </h3>
          <p className="text-xs text-slate-400">
            Compare the original scanned PDF page with the simulated PowerPoint output rendering.
          </p>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('sideBySide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'sideBySide'
                ? 'bg-slate-800 text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side by Side
          </button>
          
          <button
            onClick={() => setViewMode('interactiveSplit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'interactiveSplit'
                ? 'bg-slate-800 text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Combined / Simulated
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      {viewMode === 'sideBySide' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="view_side_to_side">
          
          {/* Before Frame */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 uppercase tracking-widest bg-rose-950/20 px-3.5 py-1.5 rounded-md border border-rose-900/30">
              <span>Before: Flat PDF Scanned Page</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded">Uneditable</span>
            </div>
            
            <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <img 
                src={slide.dataUrl} 
                alt="Before raw presentation slide" 
                className="w-full h-auto block"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-rose-500/5 hover:bg-transparent transition pointer-events-none" />
            </div>
          </div>

          {/* After Frame */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-3.5 py-1.5 rounded-md border border-cyan-900/30">
              <span>After: Simulated Editable PowerPoint Slide</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Real-time Format
              </span>
            </div>

            <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              {/* Slide Background Image */}
              <img 
                src={slide.dataUrl} 
                alt="After rendering background" 
                className="w-full h-auto block opacity-100"
                referrerPolicy="no-referrer"
              />

              {/* simulated text block layers & redact overlays */}
              {slide.regions.map((reg) => {
                const alignStyles: Record<string, string> = {
                  left: 'text-left',
                  center: 'text-center',
                  right: 'text-right'
                };

                return (
                  <div
                    key={`sim_${reg.id}`}
                    className="absolute"
                    style={{
                      left: `${reg.x}%`,
                      top: `${reg.y}%`,
                      width: `${reg.width}%`,
                      height: `${reg.height}%`
                    }}
                  >
                    {reg.action === 'redact' && (
                      <div 
                        className="w-full h-full"
                        style={{ backgroundColor: reg.formatting.backgroundColor || '#FFFFFF' }}
                      />
                    )}

                    {reg.action === 'ocr' && (
                      <div className="w-full h-full relative" style={{ height: '100%', width: '100%' }}>
                        
                        {/* 1. Mask to cover flat text underneath */}
                        {reg.formatting.backgroundColor && (
                          <div 
                            className="absolute inset-0 z-0"
                            style={{ backgroundColor: reg.formatting.backgroundColor }}
                          />
                        )}

                        {/* 2. Text Box */}
                        <div 
                          className={`absolute inset-0 z-10 p-1 flex items-center select-text leading-relaxed font-sans overflow-hidden ${
                            alignStyles[reg.formatting.align] || 'text-left'
                          } ${
                            reg.formatting.fontWeight === 'bold' ? 'font-bold' : ''
                          } ${
                            reg.formatting.fontStyle === 'italic' ? 'italic' : ''
                          }`}
                          style={{
                            fontSize: `${reg.formatting.fontSize * 0.9}px`, // Slight scaling for better in-browser fit
                            color: reg.formatting.fontColor || '#000000',
                          }}
                        >
                          {reg.ocrText || '(OCR Text blank...)'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Full Simulated interactive display with active text selector highlights */
        <div className="space-y-4" id="view_sim_combined">
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/20 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Simulating interactive PowerPoint states:</strong> You can select, highlight, and copy text within the editable regions overlayed below. This exactly demonstrates how the exported PowerPoint file works with isolated vector layers.
            </div>
          </div>

          <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 max-w-2xl mx-auto shadow-xl">
            {/* Background image */}
            <img 
              src={slide.dataUrl} 
              alt="Simulated PowerPoint container" 
              className="w-full h-auto block"
              referrerPolicy="no-referrer"
            />

            {/* Overlays */}
            {slide.regions.map((reg) => {
              const alignStyles: Record<string, string> = {
                left: 'text-left',
                center: 'text-center',
                right: 'text-right'
              };

              return (
                <div
                  key={`full_sim_${reg.id}`}
                  className="absolute"
                  style={{
                    left: `${reg.x}%`,
                    top: `${reg.y}%`,
                    width: `${reg.width}%`,
                    height: `${reg.height}%`
                  }}
                >
                  {reg.action === 'redact' && (
                    <div 
                      className="w-full h-full"
                      style={{ backgroundColor: reg.formatting.backgroundColor || '#FFFFFF' }}
                    />
                  )}

                  {reg.action === 'ocr' && (
                    <div className="w-full h-full relative" style={{ height: '100%', width: '100%' }}>
                      
                      {/* Mask Block */}
                      {reg.formatting.backgroundColor && (
                        <div 
                          className="absolute inset-0 z-0"
                          style={{ backgroundColor: reg.formatting.backgroundColor }}
                        />
                      )}

                      {/* Interactive Selectable Text */}
                      <div 
                        className={`absolute inset-0 z-10 p-1 flex items-center cursor-text select-text hover:bg-cyan-400/5 leading-relaxed font-sans overflow-hidden border border-dashed border-cyan-400/20 ${
                          alignStyles[reg.formatting.align] || 'text-left'
                        } ${
                          reg.formatting.fontWeight === 'bold' ? 'font-bold' : ''
                        } ${
                          reg.formatting.fontStyle === 'italic' ? 'italic' : ''
                        }`}
                        style={{
                          fontSize: `${reg.formatting.fontSize * 0.9}px`,
                          color: reg.formatting.fontColor || '#000000',
                        }}
                      >
                        {reg.ocrText || '(No OCR result)'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 border border-dashed border-cyan-400/40 bg-cyan-400/5 rounded" />
              Interactive Text Box Overlay
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 border border-slate-705 bg-slate-900 rounded" />
              Original Static Image
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
