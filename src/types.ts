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

// === HonorLex Academic Assistant Types ===

export interface PolishIssue {
  category: 'grammar' | 'spelling' | 'punctuation' | 'word_choice' | 'clarity' | 'coherence' | 'academic_style';
  severity: 'low' | 'medium' | 'high';
  original: string;
  suggestion: string;
  explanation: string;
}

export interface ChangeExplanation {
  original: string;
  revised: string;
  reason: string;
  type: 'grammar' | 'clarity' | 'style' | 'tone' | 'structure' | 'concision';
}

export interface AcademicRiskNote {
  risk: string;
  explanation: string;
  suggestion: string;
}

export interface PolishResponse {
  revised_text: string;
  alternatives: string[];
  issues: PolishIssue[];
  change_explanations: ChangeExplanation[];
  academic_risk_notes: AcademicRiskNote[];
}

export interface MetadataComparisonRow {
  field: string;
  user_input: string;
  retrieved_metadata: string;
  status: 'match' | 'mismatch' | 'missing' | 'inferred' | 'added from verified metadata' | 'partial match; initials corrected' | 'no verified DOI for original book' | 'not_applicable' | 'not_checked' | 'parsed from input' | 'not verified';
}

export interface RejectedMatch {
  retrieved_author: string;
  retrieved_title: string;
  retrieved_year: string;
  retrieved_source: string;
  retrieved_doi: string;
  rejection_reason: string;
}

export interface PossibleMatch {
  title: string;
  authors: string;
  year: string;
  source: string;
  doi: string;
  confidence: number;
}

export interface FabricationRiskReason {
  reason: string;
  evidence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface VerificationEvidenceRow {
  source: string;
  status: 'matched' | 'partially matched' | 'conflict' | 'not found' | 'not checked';
  details: string;
}

export interface ReferenceVerificationResponse {
  verification_status: string;
  confidence_score: number;
  bibliographic_confidence: number;
  formatting_confidence: number;
  source_type: string;
  evidence_sources: string[];
  metadata_comparison: MetadataComparisonRow[];
  rejected_matches: RejectedMatch[];
  apa7_reference: string;
  parenthetical_citation: string;
  narrative_citation: string;
  problems_found: string[];
  formatting_note: string | null;
  warnings: string[];
  possible_matches: PossibleMatch[];
  fabrication_risk_label: string;
  fabrication_risk_score: number;
  risk_reasons: FabricationRiskReason[];
  verification_evidence: VerificationEvidenceRow[];
  recommended_action: string;
  safe_user_message: string;
  unverified_doi?: string;
}

export interface SynonymSuggestion {
  word: string;
  fit_score: number;
  register: 'academic' | 'formal' | 'neutral' | 'informal';
  meaning_safety: 'safe' | 'slightly_different' | 'risky';
  strength: 'weaker' | 'similar' | 'stronger';
  collocation_note: string;
  example_sentence: string;
  comment: string;
}

export interface SynonymAvoid {
  word: string;
  reason: string;
}

export interface ContextualSynonymResponse {
  selected_text: string;
  part_of_speech: string;
  detected_meaning: string;
  sentence_context: string;
  paragraph_topic: string;
  best_suggestion: {
    word: string;
    reason: string;
    fit_score: number;
  };
  suggestions: SynonymSuggestion[];
  avoid: SynonymAvoid[];
  meaning_warning: string | null;
  replacement_sentence: string;
}

export interface BatchScanReferenceItem {
  raw_reference: string;
  extracted_title?: string;
  extracted_authors?: string;
  classification: 'Verified' | 'Partially verified' | 'Unverified' | 'High-risk citation' | 'DOI mismatch' | 'Possible fabricated citation';
  risk_score: number;
  alert_message: string;
  rationale: string;
}

export interface BatchScanSummaryResponse {
  scan_summary: string;
  references: BatchScanReferenceItem[];
}
