import pptxgen from 'pptxgenjs';
import { SlidePage, OCRegion } from '../types';

/**
 * Utility to convert hex to RGB or just output pptxgenjs compatible font color.
 * pptxgenjs takes hex code without '#' for colors, e.g., 'FF0000'.
 */
export function cleanHexColor(hex: string): string {
  if (!hex) return '000000';
  let clean = hex.trim();
  if (clean.startsWith('#')) {
    clean = clean.substring(1);
  }
  // If it's 3 digits, expand to 6
  if (clean.length === 3) {
    clean = clean.split('').map(char => char + char).join('');
  }
  return clean.substring(0, 6).toUpperCase();
}

/**
 * Builds and downloads a PowerPoint presentation based on slide pages and region configurations.
 */
export async function exportToPPTX(slides: SlidePage[], filename: string = 'HonorLM_Converted_Presentation.pptx'): Promise<void> {
  const pptx = new pptxgen();

  // Determine standard slide dimensions based on the first slide's aspect ratio
  // Standard widescreen in PPTXGen is 13.33 x 7.5 inches (16:9)
  // Standard 4:3 is 10 x 7.5 inches
  let slideWidthInches = 13.33;
  let slideHeightInches = 7.5;

  if (slides.length > 0) {
    const firstSlide = slides[0];
    const aspect = firstSlide.aspectRatio || (16/9);
    // Let's define a custom layout matching the PDF's native aspect ratio
    slideHeightInches = 7.5;
    slideWidthInches = Math.round((7.5 * aspect) * 100) / 100;
  }

  pptx.defineLayout({
    name: 'PRECISE_NATIVE_LAYOUT',
    width: slideWidthInches,
    height: slideHeightInches
  });
  pptx.layout = 'PRECISE_NATIVE_LAYOUT';

  for (const slideData of slides) {
    const slide = pptx.addSlide();

    // 1. Add background image (the whole PDF slide page render)
    try {
      slide.addImage({
        data: slideData.dataUrl,
        x: 0,
        y: 0,
        w: slideWidthInches,
        h: slideHeightInches
      });
    } catch (err) {
      console.error('Error attaching background slide frame image', err);
    }

    // 2. Process all markup regions defined on this slide
    for (const region of slideData.regions) {
      // Calculate coordinates in inches
      const regionX = (region.x / 100) * slideWidthInches;
      const regionY = (region.y / 100) * slideHeightInches;
      const regionW = (region.width / 100) * slideWidthInches;
      const regionH = (region.height / 100) * slideHeightInches;

      if (region.action === 'redact') {
        // Redaction: Cover area with a solid clean shape.
        // Usually defaulted to white color to redact watermarks/logos seamlessly
        const color = cleanHexColor(region.formatting.backgroundColor || '#FFFFFF');
        slide.addShape(pptx.ShapeType.rect, {
          x: regionX,
          y: regionY,
          w: regionW,
          h: regionH,
          fill: { color: color },
          line: { type: 'none' }
        });
      }

      else if (region.action === 'ocr') {
        // OCR text replacement: 
        // A: Place a background mask rect block if background mask is enabled or has a valid color 
        // to cover the original embedded image text so they don't overlap!
        if (region.formatting.backgroundColor) {
          const bgColor = cleanHexColor(region.formatting.backgroundColor);
          slide.addShape(pptx.ShapeType.rect, {
            x: regionX,
            y: regionY,
            w: regionW,
            h: regionH,
            fill: { color: bgColor },
            line: { type: 'none' }
          });
        }

        // B: Add editable text on top
        // Parse custom formatting details
        const textColorHex = cleanHexColor(region.formatting.fontColor || '#000000');
        const isBold = region.formatting.fontWeight === 'bold';
        const isItalic = region.formatting.fontStyle === 'italic';
        
        // Approximate alignment map
        let pptxAlign: 'left' | 'center' | 'right' | 'justify' = 'left';
        if (region.formatting.align === 'center') pptxAlign = 'center';
        else if (region.formatting.align === 'right') pptxAlign = 'right';

        // Add text element
        slide.addText(region.ocrText || '', {
          x: regionX,
          y: regionY,
          w: regionW,
          h: regionH,
          color: textColorHex,
          fontFace: 'Arial', // Universal safe default PowerPoint font
          fontSize: region.formatting.fontSize || 12,
          bold: isBold,
          italic: isItalic,
          align: pptxAlign,
          valign: 'middle',
          margin: 1 // absolute margin in pt
        });
      }
      
      // Regions with action === 'keep' or 'ignore' do not draw extra overlays
      // since the original background page visual holds them as images.
    }
  }

  // Trigger browser download frame
  await pptx.writeFile({ fileName: filename });
}
