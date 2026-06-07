import React from 'react';
import { Scale, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function LegalNotice() {
  return (
    <div id="honor_legal_banner" className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 mb-6 backdrop-blur-xs flex flex-col md:flex-row items-start gap-4">
      <div className="p-3 bg-cyan-950/40 text-cyan-400 rounded-lg shrink-0 border border-cyan-800/30">
        <Scale className="w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h4 className="font-display font-semibold text-slate-100 flex items-center gap-2 text-sm md:text-base">
          Legal & Ethical Notice
          <span className="text-xs font-normal text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
            Mandatory Reading
          </span>
        </h4>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
          HonorLM provides smart OCR placement and document restructuring. You are authorized to clean, redact, or remove branding/watermark-like areas <strong className="text-slate-200">ONLY</strong> on documents you own, or have been explicitly authorized to edit.
        </p>
        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 pt-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Unauthorized modifications of copyright-protected assets may breach terms of service or copyright laws. Please use responsibly inside your educational and professional workflows.
        </p>
      </div>
    </div>
  );
}
