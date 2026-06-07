export type RegionAction = 'ocr' | 'keep' | 'ignore' | 'redact';

export interface RegionFormatting {
  fontSize: number; // in pt
  fontColor: string; // hex representation (e.g. #000000)
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  align: 'left' | 'center' | 'right';
  backgroundColor?: string;
}

export interface OCRegion {
  id: string;
  x: number;      // percentage coordinate (0-100)
  y: number;      // percentage coordinate (0-100)
  width: number;  // percentage width (0-100)
  height: number; // percentage height (0-100)
  action: RegionAction;
  ocrText: string;
  ocrConfidence: number; // confidence score (0-100)
  formatting: RegionFormatting;
  customLabel?: string;
  originalImageBytes?: string; // dataURI of cropped canvas block
}

export interface SlidePage {
  pageNumber: number;
  width: number;  // original width in pixels
  height: number; // original height in pixels
  aspectRatio: number;
  dataUrl: string; // The fully rendered image dataUrl of this page
  regions: OCRegion[];
}

export interface OCRConfidenceWarning {
  slideNumber: number;
  regionId: string;
  text: string;
  confidence: number;
}
