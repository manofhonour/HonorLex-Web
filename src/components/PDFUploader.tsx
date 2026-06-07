import React, { useState, useRef } from 'react';
import { Upload, FileDown, Eye, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { SlidePage } from '../types';

interface PDFUploaderProps {
  onUploadSuccess: (slides: SlidePage[]) => void;
}

export default function PDFUploader({ onUploadSuccess }: PDFUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please provide a valid PDF document.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress({ current: 0, total: 1 });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('Failed to load file contents.');
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('PDF Engine (pdfjsLib) fails to initialize in this window context.');
        }

        const typedarray = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        if (totalPages === 0) {
          throw new Error('This PDF has no printable pages.');
        }

        setLoadingProgress({ current: 0, total: totalPages });
        const slidePages: SlidePage[] = [];

        for (let i = 1; i <= totalPages; i++) {
          setLoadingProgress({ current: i, total: totalPages });
          const page = await pdf.getPage(i);
          
          // Render at 2.0x scale to ensure high-quality text for OCR OCR engines
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Could not create standard offscreen canvas context.');
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render viewport contents
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const dataUrl = canvas.toDataURL('image/png');
          
          slidePages.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            aspectRatio: viewport.width / viewport.height,
            dataUrl: dataUrl,
            regions: []
          });
        }

        onUploadSuccess(slidePages);
      } catch (err: any) {
        console.error('PDF parsing error', err);
        setError(err?.message || 'Failed to process document. Make sure the file is not password locked.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file structure.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onBtnClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="pdf_dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onBtnClick}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
          isDragActive
            ? 'border-cyan-400 bg-cyan-950/25 shadow-lg shadow-cyan-950/30 text-cyan-200Scale'
            : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 hover:shadow-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf_file_input"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-6" id="uploader_loading_state">
            <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
            <div className="space-y-1">
              <h5 className="font-display font-semibold text-slate-100 text-lg">
                Processing PDF Presentation
              </h5>
              <p className="text-sm text-slate-400">
                Converting slide frame {loadingProgress.current} of {loadingProgress.total}...
              </p>
            </div>
            
            {/* Elegant progress bar loader */}
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Rendering vector slides to raster textures for manual selection blocks.
            </p>
          </div>
        ) : (
          <div className="space-y-4" id="uploader_idle_state">
            <div className="p-4 bg-slate-950 rounded-2xl inline-block shadow-inner border border-slate-800/80">
              <Upload className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h4 className="font-display font-bold text-slate-100 text-xl tracking-tight">
                Import PDF Slide Deck
              </h4>
              <p className="text-slate-400 text-sm">
                Drag & drop your presentation file here, or click to browse local files.
              </p>
              <p className="text-[11px] text-cyan-500 font-mono">
                Works with image-based, scanned, or vector decks.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 group-hover:scale-105 transition-transform bg-slate-800/80 px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700">
              Select presentation (PDF)
            </div>
          </div>
        )}

        {error && (
          <div 
            id="uploader_error" 
            className="absolute bottom-4 left-4 right-4 bg-red-950/40 border border-red-800/40 rounded-lg p-3 flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()} // don't trigger upload trigger again
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-slate-200">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-0.5">Image Background Mode</span>
            Ensures that logos, charts, illustrations, lines, and intricate template designs are retained exactly as in the PDF.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex items-start gap-2.5">
          <FileDown className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-0.5">Editable Overlay boxes</span>
            OCR-recognized content is overlayed as actual editable PPTX text blocks directly styled over background elements.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-0.5">Intentional Defaults</span>
            Does not run full-page automated OCR routines. Draw bounding boxes selectively to prevent image noise from corrupting slides.
          </div>
        </div>
      </div>
    </div>
  );
}
