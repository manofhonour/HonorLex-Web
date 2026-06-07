import { 
  PolishResponse, 
  ReferenceVerificationResponse, 
  BatchScanSummaryResponse, 
  ContextualSynonymResponse,
  PolishIssue,
  ChangeExplanation,
  AcademicRiskNote
} from '../types';

// Centralized check for static sandbox demo mode
export const getIsStaticDemoDefault = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hp = window.location.hostname;
  return (
    hp.includes('github.io') || 
    hp.includes('pages.dev') || 
    window.location.search.includes('static=true') ||
    localStorage.getItem('honorlex_static_demo') === 'true'
  );
};

// Simple active getters/setters stored in localStorage for testers to override
export const isStaticDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('honorlex_static_demo');
  if (saved !== null) {
    return saved === 'true';
  }
  return getIsStaticDemoDefault();
};

export const setStaticDemoMode = (flag: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('honorlex_static_demo', flag ? 'true' : 'false');
};

// Clean helper to convert regular text to sentence case
function toSentenceCase(str: string): string {
  if (!str) return '';
  const clean = str.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

/**
 * High-Fidelity Static Mock Polish
 */
export const simulatePolish = (
  text: string, 
  task: string, 
  tone: string, 
  englishVariety: string
): PolishResponse => {
  const trimmed = text.trim();
  let revised = text;
  const issues: PolishIssue[] = [];
  const changes: ChangeExplanation[] = [];
  const risks: AcademicRiskNote[] = [];

  // 1. Diagnose simple informal terms in the input to make the simulation look responsive!
  if (/looks at|looked at|looking at/i.test(trimmed)) {
    issues.push({
      category: 'academic_style',
      severity: 'medium',
      original: 'looks at',
      suggestion: 'investigating / analyzing the correlation of',
      explanation: 'The verb phrase "looks at" is colloquial. Scholarly writing requires precise investigation verbs like "examines", "analyzes", or "investigates".'
    });
    changes.push({
      original: 'looks at',
      revised: 'examines',
      reason: 'Elevated register to an active analytical verb.',
      type: 'style'
    });
    revised = trimmed.replace(/looks at/gi, 'examines').replace(/looked at/gi, 'examined').replace(/looking at/gi, 'examining');
  }

  if (/proves|prove beyond doubt/i.test(trimmed)) {
    risks.push({
      risk: 'Over-claiming & Lack of Hedging',
      explanation: 'In scientific research, claims are rarely "proven" absolutely. Using dogmatic verbs creates vulnerability to peer-review rejection.',
      suggestion: 'Use tentative hedging verbs like "suggests", "indicates", or "lends support to".'
    });
    changes.push({
      original: 'proves',
      revised: 'suggests',
      reason: 'Applied scholarly hedging to represent statistical probability rather than absolute certainty.',
      type: 'tone'
    });
    revised = revised.replace(/proves/gi, 'suggests').replace(/prove/gi, 'suggest');
  }

  if (/very clear|extremely obvious/i.test(trimmed)) {
    issues.push({
      category: 'clarity',
      severity: 'low',
      original: 'very clear',
      suggestion: 'evident / readily apparent',
      explanation: 'Vague booster modifiers (very, extremely) weaken prose force.'
    });
    revised = revised.replace(/very clear/gi, 'evident').replace(/extremely obvious/gi, 'readily apparent');
  }

  // 2. Adjust output based on task selected
  let finalRevised = revised;
  if (task === 'grammar') {
    finalRevised = revised || "The researchers conducted several experimental protocols to gather metadata.";
    issues.push({
      category: 'spelling',
      severity: 'low',
      original: 'reasearcher (simulated typo)',
      suggestion: 'researcher',
      explanation: 'Fixed typographical error.'
    });
  } else if (task === 'rewrite') {
    finalRevised = "Consequently, the empirical evidence indicates a compelling trend; however, subsequent research must corroborate these claims of efficacy.";
    changes.push({
      original: text.substring(0, Math.min(35, text.length)),
      revised: "Consequently, the empirical evidence indicates...",
      reason: "Structured the logic with cohesive transitions and scholarly vocabulary.",
      type: 'structure'
    });
  } else if (task === 'paraphrase') {
    finalRevised = "In contrast to conventional paradigms, our evaluation reveals a substantial variance across sample demographics.";
    changes.push({
      original: text.substring(0, Math.min(35, text.length)),
      revised: "In contrast to conventional paradigms, our evaluation...",
      reason: "Restructured the sentence syntax to introduce high phonetic variation.",
      type: 'concision'
    });
  } else if (task === 'simplify') {
    finalRevised = "We simplified the core methodology to help researchers reproduce the outcomes easily.";
    changes.push({
      original: text.substring(0, Math.min(35, text.length)),
      revised: "We simplified the core methodology...",
      reason: "Reduced complex jargon chains to straightforward, high-impact active prose.",
      type: 'clarity'
    });
  } else if (task === 'shorten') {
    finalRevised = text.length > 40 ? text.substring(0, Math.round(text.length * 0.6)) + " (Synthesized summary)" : "A concise summary of the proposed methodology was compiled.";
    changes.push({
      original: text,
      revised: finalRevised,
      reason: "Compressed the active length to limit word inflation.",
      type: 'concision'
    });
  } else {
    // Default fallback
    finalRevised = revised || "The modified manuscript demonstrates highly scholarly structure, conforming to the selected APA 7 formatting protocols.";
  }

  // Special dialect-specific turkish translators
  if (englishVariety === 'tr-us' || englishVariety === 'tr-uk') {
    finalRevised = "This study aims to examine the fundamental structures of text processing under simulated static environments. " + finalRevised;
    changes.push({
      original: "[Turkish Draft Drafted]",
      revised: "This study aims to examine...",
      reason: "Localized idioms and Turkish native structures to standard academic prose.",
      type: 'tone'
    });
  }

  // Auto-generate some safe generic alternatives
  const alternatives = [
    `Consequently, our analytical model suggests a significant deviation: ${finalRevised.substring(0, Math.min(40, finalRevised.length))}...`,
    `As demonstrated in preceding sections, the result indicates that: ${finalRevised.substring(0, Math.min(40, finalRevised.length))}...`
  ];

  return {
    revised_text: finalRevised,
    alternatives,
    issues: issues.length > 0 ? issues : [
      {
        category: 'academic_style',
        severity: 'low',
        original: 'N/A',
        suggestion: 'No spelling errors found.',
        explanation: 'The original narrative shows a clean structure. Subtle style enhancements have been compiled above.'
      }
    ],
    change_explanations: changes.length > 0 ? changes : [
      {
        original: text.substring(0, Math.min(30, text.length)) + '...',
        revised: finalRevised.substring(0, Math.min(30, finalRevised.length)) + '...',
        reason: 'Restructured vocabulary strings for optimal academic readability and compliance.',
        type: 'style'
      }
    ],
    academic_risk_notes: risks.length > 0 ? risks : [
      {
        risk: 'Hedging Check Passed',
        explanation: 'Your prose handles scientific claims safely without expressing unwarranted absolute proof.',
        suggestion: 'Maintain this tentative phrasing in your abstract and discussion.'
      }
    ]
  };
};

/**
 * High-Fidelity Static Mock Reference Checking
 */
export const simulateVerifyReference = (query: string): ReferenceVerificationResponse => {
  const queryLower = query.toLowerCase();

  // 1. Watson and Crick (DOI matched)
  if (queryLower.includes('10.1038/171737a0') || (queryLower.includes('watson') && queryLower.includes('crick'))) {
    const isDoiOnlyInput = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:)?\s*(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\s*$/i.test(query.trim());
    return {
      verification_status: isDoiOnlyInput ? 'Verified by DOI' : 'Verified with metadata corrections',
      confidence_score: isDoiOnlyInput ? 98 : 65,
      bibliographic_confidence: isDoiOnlyInput ? 98 : 60,
      formatting_confidence: 90,
      source_type: 'journal article',
      evidence_sources: ['Crossref', 'PubMed', 'Google Books'],
      metadata_comparison: [
        { field: 'Source type', user_input: isDoiOnlyInput ? 'Unspecified' : 'journal article', retrieved_metadata: 'journal article', status: isDoiOnlyInput ? 'added from verified metadata' : 'match' },
        { field: 'Author', user_input: isDoiOnlyInput ? 'Not provided' : 'Watson, J. and Crick, F.', retrieved_metadata: 'Watson, J. D., & Crick, F. H. C.', status: 'partial match; initials corrected' },
        { field: 'Year', user_input: isDoiOnlyInput ? 'Not provided' : '1954', retrieved_metadata: '1953', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'Title', user_input: isDoiOnlyInput ? 'Not provided' : 'Molecule structure of nucleic acid', retrieved_metadata: 'Molecular structure of nucleic acids: A structure for deoxyribose nucleic acid', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'Journal / Source', user_input: isDoiOnlyInput ? 'Not provided' : 'Nature journal', retrieved_metadata: 'Nature', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'Volume', user_input: isDoiOnlyInput ? 'Not provided' : '172', retrieved_metadata: '171', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'Issue', user_input: isDoiOnlyInput ? 'Not provided' : '730', retrieved_metadata: '4356', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'Pages', user_input: isDoiOnlyInput ? 'Not provided' : '730–738', retrieved_metadata: '737–738', status: isDoiOnlyInput ? 'added from verified metadata' : 'mismatch' },
        { field: 'DOI', user_input: '10.1038/171737a0', retrieved_metadata: '10.1038/171737a0', status: 'match' }
      ],
      rejected_matches: [],
      apa7_reference: 'Watson, J. D., & Crick, F. H. C. (1953). Molecular structure of nucleic acids: A structure for deoxyribose nucleic acid. *Nature*, *171*(4356), 737–738. https://doi.org/10.1038/171737a0',
      parenthetical_citation: '(Watson & Crick, 1953)',
      narrative_citation: 'Watson and Crick (1953)',
      problems_found: isDoiOnlyInput ? [] : [
        'Year is incorrect: 1954 should be 1953.',
        'Article title is incorrect/incomplete.',
        'Journal name should be Nature, not Nature journal.',
        'Volume should be 171, not 172.',
        'Pages should be 737-738, not 730-738.'
      ],
      formatting_note: null,
      warnings: [
        'This tool verifies bibliographic metadata, not the factual accuracy or academic quality of the source.',
        'Demo results load locally. Server connection is bypassed.'
      ],
      possible_matches: [],
      fabrication_risk_label: isDoiOnlyInput ? 'Low risk' : 'Medium risk',
      fabrication_risk_score: isDoiOnlyInput ? 5 : 35,
      risk_reasons: isDoiOnlyInput ? [] : [
        {
          reason: 'Major bibliographic metadata errors',
          evidence: 'Verified reference found on Crossref, but user text contains major metadata discrepancies (year, title, journal name, and pages). This typically means a sloppy citation rather than a fabricated paper.',
          severity: 'medium'
        }
      ],
      verification_evidence: [
        { source: 'Crossref', status: 'matched', details: 'Exact matching metadata located.' },
        { source: 'PubMed', status: 'matched', details: 'Record matches PMID 13054692.' }
      ],
      recommended_action: isDoiOnlyInput ? 'Cite with confidence. DOI is verified.' : 'Update details to match the retrieved metadata exactly.',
      safe_user_message: 'This is Watson & Crick’s famous 1953 DNA manuscript.'
    };
  }

  // 2. Book Review Trap (Fairclough / Frawley)
  if (queryLower.includes('frawley') || queryLower.includes('fairclough') || queryLower.includes('10.1017/s0047404500017309')) {
    return {
      verification_status: 'Metadata conflict (Book Review Trap detected)',
      confidence_score: 50,
      bibliographic_confidence: 45,
      formatting_confidence: 80,
      source_type: 'book chapter / review',
      evidence_sources: ['Crossref'],
      metadata_comparison: [
        { field: 'Source type', user_input: 'book', retrieved_metadata: 'journal article (book review)', status: 'mismatch' },
        { field: 'Author', user_input: 'Fairclough, N.', retrieved_metadata: 'Frawley, W.', status: 'mismatch' },
        { field: 'Year', user_input: '1992', retrieved_metadata: '1993', status: 'mismatch' },
        { field: 'Title', user_input: 'Discourse and social change', retrieved_metadata: 'Norman Fairclough, Discourse and social change. Cambridge: Polity Press, 1992. Pp. viii + 259', status: 'mismatch' },
        { field: 'Journal / Source', user_input: 'Cambridge: Polity Press', retrieved_metadata: 'Language in Society', status: 'mismatch' },
        { field: 'DOI', user_input: '10.1017/s0047404500017309', retrieved_metadata: '10.1017/s0047404500017309', status: 'match' }
      ],
      rejected_matches: [
        {
          retrieved_author: 'Frawley, W.',
          retrieved_title: 'Norman Fairclough, Discourse and social change. Cambridge: Polity Press, 1992.',
          retrieved_year: '1993',
          retrieved_source: 'Language in Society, 22(3), 421-424',
          retrieved_doi: '10.1017/s0047404500017309',
          rejection_reason: 'This DOI links to a review of Fairclough’s book written by William Frawley, not the book itself.'
        }
      ],
      apa7_reference: 'Fairclough, N. (1992). *Discourse and social change*. Polity Press.\n*(Note: Do not attach the DOI 10.1017/s0047404500017309 as it refers to a book review)*',
      parenthetical_citation: '(Fairclough, 1992)',
      narrative_citation: 'Fairclough (1992)',
      problems_found: [
        'The DOI provided belongs to a book review written by William Frawley in Language in Society (1993).',
        'Book titles should be italicized, and publication cities are removed in APA 7.'
      ],
      formatting_note: 'Book titles should be italicized in APA 7. Italics may not be visible in plain-text input.',
      warnings: [
        'This tool verifies bibliographic metadata, not the factual accuracy or academic quality of the source.',
        'Book Review Trap isolated: The DOI provided resolves to a review article rather than the original monograph.'
      ],
      possible_matches: [
        {
          title: 'Discourse and Social Change',
          authors: 'Fairclough, Norman',
          year: '1992',
          source: 'Polity Press',
          doi: 'None (Original Book has no standard DOI)',
          confidence: 95
        }
      ],
      fabrication_risk_label: 'Medium risk',
      fabrication_risk_score: 55,
      risk_reasons: [
        {
          reason: 'Critical Book Review DOI Trap',
          evidence: 'Retrieved metadata indicates this DOI corresponds to a book review in "Language in Society" rather than the original book itself. Using this DOI is a critical citation error.',
          severity: 'high'
        }
      ],
      verification_evidence: [
        { source: 'Crossref', status: 'conflict', details: 'DOI maps to a book review in Language in Society.' }
      ],
      recommended_action: 'Cite the original book Fairclough (1992) without a DOI. Remove the review DOI.',
      safe_user_message: 'Avoid associating reviewer DOIs to original monograph entries.'
    };
  }

  // 3. Hallucinated / Fabricated Thompson citation (High risk)
  if (queryLower.includes('thompson') || queryLower.includes('computational fluid efficiency') || queryLower.includes('neural cybernetics')) {
    return {
      verification_status: 'Unverified / Likely Fabricated',
      confidence_score: 5,
      bibliographic_confidence: 0,
      formatting_confidence: 85,
      source_type: 'journal article',
      evidence_sources: [],
      metadata_comparison: [
        { field: 'Source type', user_input: 'journal article', retrieved_metadata: 'No record found', status: 'missing' },
        { field: 'Author', user_input: 'Thompson, G. R., & Reynolds, M. L.', retrieved_metadata: 'No record found', status: 'missing' },
        { field: 'Year', user_input: '2025', retrieved_metadata: 'No record found', status: 'missing' },
        { field: 'Title', user_input: 'The Role of Reinforcement Learning in Enhancing Computational Efficiency of Big Data Frameworks', retrieved_metadata: 'No record found', status: 'missing' },
        { field: 'Journal / Source', user_input: 'Journal of Neural Information Management', retrieved_metadata: 'No record found', status: 'missing' }
      ],
      rejected_matches: [],
      apa7_reference: 'Thompson, G. R., & Reynolds, M. L. (2025). The role of reinforcement learning in enhancing computational efficiency of big data frameworks. *Journal of Neural Information Management*, *14*(2), 112–132.',
      parenthetical_citation: '(Thompson & Reynolds, 2025)',
      narrative_citation: 'Thompson and Reynolds (2025)',
      problems_found: [
        'No external record matching this title or authors could be matched.',
        'Journal of Neural Information Management has no registered ISSN or Crossref prefix.',
        'The title reflects a typical AI chatbot hallucination pattern.'
      ],
      formatting_note: null,
      warnings: [
        'This tool verifies bibliographic metadata, not the factual accuracy or academic quality of the source.',
        'CRITICAL FABRICATION ALARM: No bibliographic existence index found. This source may be fully hallucinated.'
      ],
      possible_matches: [],
      fabrication_risk_label: 'Critical risk',
      fabrication_risk_score: 95,
      risk_reasons: [
        {
          reason: 'Zero bibliographic footprint found',
          evidence: 'Exhaustive matches against millions of records via Crossref and OpenAlex returned zero hits for this author, journal, or paper title.',
          severity: 'critical'
        },
        {
          reason: 'Typical AI-fabricated phrasing pattern',
          evidence: 'The title "The Role of [AI Concept] in Enhancing [Sub-concept]" is a common statistical signature of generative AI text hallucination.',
          severity: 'high'
        }
      ],
      verification_evidence: [
        { source: 'Crossref', status: 'not found', details: 'Zero titles match query parameters.' },
        { source: 'OpenAlex', status: 'not found', details: 'No cataloged item matching authors or journals.' }
      ],
      recommended_action: 'Perform a primary manual search. Do not use this citation if you generated it with ChatGPT/DeepSeek.',
      safe_user_message: 'This citation has high fabrication signatures.'
    };
  }

  // 4. Default Static Fallback for general query
  return {
    verification_status: 'Simulated Fallback (Static Build Mode)',
    confidence_score: 30,
    bibliographic_confidence: 25,
    formatting_confidence: 80,
    source_type: 'journal article',
    evidence_sources: ['Parsed User Input'],
    metadata_comparison: [
      { field: 'Source type', user_input: 'Unspecified', retrieved_metadata: 'Simulation Mode Only', status: 'added from verified metadata' },
      { field: 'Author', user_input: query.substring(0, Math.min(30, query.length)), retrieved_metadata: 'Simulated Metadata', status: 'partial match; initials corrected' },
      { field: 'Year', user_input: '2026', retrieved_metadata: '2026', status: 'match' },
      { field: 'Title', user_input: query, retrieved_metadata: 'Simulated Scholarly Paper', status: 'match' }
    ],
    rejected_matches: [],
    apa7_reference: query.includes('(') ? query : `${query} (2026). Simulated title. *Journal of Previews*, 1(1), 1-10.`,
    parenthetical_citation: '(Simulated, 2026)',
    narrative_citation: 'Simulated (2026)',
    problems_found: [
      'This environment has no running backend server. Running in static offline demo mode.'
    ],
    formatting_note: null,
    warnings: [
      'This tool verifies bibliographic metadata, not the factual accuracy or academic quality of the source.',
      'STATIC DEMO LIMIT: No real-time API lookup was made. Results shown are simulated.'
    ],
    possible_matches: [],
    fabrication_risk_label: 'Low risk',
    fabrication_risk_score: 15,
    risk_reasons: [],
    verification_evidence: [
      { source: 'Static Simulator', status: 'matched', details: 'This is a local static preview. Deploy on Render/Vercel/Railway for full API verification.' }
    ],
    recommended_action: 'Deploy with process.env.GEMINI_API_KEY for live database looking integration.',
    safe_user_message: 'The simulator parsed your text. Deploy server to check live.'
  };
};

/**
 * High-Fidelity Static Mock Bibliographic Scanner
 */
export const simulateScanReferences = (text: string): BatchScanSummaryResponse => {
  const references: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);

  // Parse lines up to 10
  lines.forEach((line, index) => {
    const cleanLine = line.toLowerCase();
    
    if (cleanLine.includes('watson') || cleanLine.includes('10.1038/171737a0')) {
      references.push({
        raw_reference: line,
        extracted_title: 'Molecular structure of nucleic acids',
        extracted_authors: 'Watson, J. D., & Crick, F. H.',
        classification: 'Verified',
        risk_score: 5,
        alert_message: 'Successfully verified.',
        rationale: 'Fully resolved DOI: 10.1038/171737a0 matches standard records in Crossref. Safe to cite.'
      });
    } else if (cleanLine.includes('frawley') || cleanLine.includes('fairclough') || cleanLine.includes('Cambridge')) {
      references.push({
        raw_reference: line,
        extracted_title: 'Discourse and social change',
        extracted_authors: 'Fairclough, N. / Frawley, W.',
        classification: 'DOI mismatch',
        risk_score: 55,
        alert_message: 'Book Review Trap Detected.',
        rationale: 'The DOI supplied points to William Frawley’s 1993 review in Language in Society instead of Fairclough’s 1992 book.'
      });
    } else if (cleanLine.includes('thompson') || cleanLine.includes('exploring the impact') || cleanLine.includes('neural cybernetics') || cleanLine.includes('carter')) {
      references.push({
        raw_reference: line,
        extracted_title: 'Exploring the Impact of Machine Learning Frameworks',
        extracted_authors: 'Thompson, G. R. / Carter, S. L.',
        classification: 'Possible fabricated citation',
        risk_score: 90,
        alert_message: 'Potential Hallucination Signature.',
        rationale: 'Title and journal have zero records in Crossref/OpenAlex. High statistical match with typical AI hallucination patterns.'
      });
    } else {
      // General fallbacks
      references.push({
        raw_reference: line,
        extracted_title: line.length > 50 ? line.substring(0, 50) + '...' : line,
        extracted_authors: 'Unresolved',
        classification: 'Unverified',
        risk_score: 30,
        alert_message: 'Demo Fallback — Bypassed verification.',
        rationale: 'No running backend was found. References was processed via client-side static simulation.'
      });
    }
  });

  if (references.length === 0) {
    // Return sample entries
    return {
      scan_summary: "Simulated Scan Summary: 4 references parsed. 1 Verified, 1 Slate DOI Mismatch, 1 Possible Fabrication, 1 Unverified fallback entry.",
      references: [
        {
          raw_reference: "1. Watson, J. D., & Crick, F. H. (1953). Molecular structure of nucleic acids. Nature, 171(4356), 737-738. DOI: 10.1038/171737a0",
          extracted_title: "Molecular structure of nucleic acids",
          extracted_authors: "Watson & Crick",
          classification: "Verified",
          risk_score: 5,
          alert_message: "Verified across databases.",
          rationale: "Matches seminal Nature DNA entry exactly."
        },
        {
          raw_reference: "2. Frawley, W. (1993). Norman Fairclough, Discourse and social change. Cambridge. DOI: 10.1017/s0047404500017309",
          extracted_title: "Norman Fairclough, Discourse and social change (Review)",
          extracted_authors: "Frawley, W.",
          classification: "DOI mismatch",
          risk_score: 55,
          alert_message: "Book Review Trap Isolated.",
          rationale: "The DOI refers to Frawley's book review, not Fairclough's original book monograph."
        },
        {
          raw_reference: "3. Thompson, G. R. (2026). Exploring the Impact of Machine Learning on Computational Fluid Efficiency. Journal of Neural Cybernetics Management, 14(2), 112-132.",
          extracted_title: "Exploring the Impact of Machine Learning",
          extracted_authors: "Thompson, G. R.",
          classification: "Possible fabricated citation",
          risk_score: 95,
          alert_message: "Extremely high fabrication risk.",
          rationale: "Zero entries exist in metadata registries. Signature typical of LLM hallucinatory records."
        }
      ]
    };
  }

  return {
    scan_summary: `Interpreting ${references.length} parsed lines via offline simulation mode. For full active database lookup, deploy on Render/Vercel/Railway.`,
    references
  };
};

/**
 * Contextual Synonym Search
 */
export const simulateContextualSynonyms = (word: string, surroundingContext: string): ContextualSynonymResponse => {
  const wLower = word.toLowerCase();
  
  let bestWord = "elucidate";
  let bestReason = "Elevates prose clarity with high-register scholastic lexicon.";
  let fit = 96;

  let suggestions = [
    {
      word: "elucidate",
      fit_score: 96,
      register: "academic" as const,
      meaning_safety: "safe" as const,
      strength: "stronger" as const,
      collocation_note: "Combines perfectly with research verbs.",
      example_sentence: `This study seeks to ${word} the fundamental structures.`,
      comment: "A highly clear active synonym for formal publications."
    },
    {
      word: "delineate",
      fit_score: 91,
      register: "academic" as const,
      meaning_safety: "safe" as const,
      strength: "stronger" as const,
      collocation_note: "Perfect for mapping or charting outlines.",
      example_sentence: `We delineate the parameters of the study.`,
      comment: "Adds a connotation of outlines, margins, limits."
    }
  ];

  if (wLower === "looks" || wLower === "look") {
    bestWord = "examines";
    bestReason = "Active academic standard replacement.";
    suggestions = [
      {
        word: "examines",
        fit_score: 97,
        register: "academic" as const,
        meaning_safety: "safe" as const,
        strength: "stronger" as const,
        collocation_note: "This research examines...",
        example_sentence: `This paper examines the correlation.`,
        comment: "Excellent standard replacement."
      },
      {
        word: "investigates",
        fit_score: 95,
        register: "academic" as const,
        meaning_safety: "safe" as const,
        strength: "stronger" as const,
        collocation_note: "The study investigates...",
        example_sentence: `Our team investigates parameters.`,
        comment: "Implies deeper experimental search."
      }
    ];
  }

  return {
    selected_text: word,
    part_of_speech: "verb / substantive",
    detected_meaning: "The underlying action of displaying, looking, or establishing scholarly statements.",
    sentence_context: word,
    paragraph_topic: "scientific description",
    best_suggestion: {
      word: bestWord,
      reason: bestReason,
      fit_score: fit
    },
    suggestions,
    avoid: [
      { word: "peer at", reason: "Too informal / colloquial." },
      { word: "gaze", reason: "Substantively dramatic or poetic register." }
    ],
    meaning_warning: null,
    replacement_sentence: surroundingContext ? surroundingContext.replace(word, bestWord) : `${bestWord} in academic contexts.`
  };
};
