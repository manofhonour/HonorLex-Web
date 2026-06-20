// Client-safe utility functions for ELT Writing Coach to prevent server-side imports on the frontend

export function runLocalCoachScan(text: string): any[] {
  const pitfalls: any[] = [];
  const lowercaseText = text.toLowerCase();

  const rules = [
    {
      pattern: /on the other hand/gi,
      category: 'transition',
      severity: 'medium',
      suggestion: 'In contrast / Conversely / On the contrary',
      explanation: '"On the other hand" is highly overused in L2 academic writing. Consider using "conversely" or "by contrast" to vary sentence flow and maintain a refined scholastic voice.',
      typeLabel: 'Weak / Overused Transition',
      matches: ['on the other hand']
    },
    {
      pattern: /\bbesides\b/gi,
      category: 'transition',
      severity: 'medium',
      suggestion: 'Moreover / Furthermore / In addition',
      explanation: '"Besides" is considered slightly conversational in formal academic discourse. Opt for "moreover", "furthermore", or "additionally" to elevate cohesion.',
      typeLabel: 'Weak / Informal Transition',
      matches: ['besides']
    },
    {
      pattern: /\bbesides,/gi,
      category: 'transition',
      severity: 'medium',
      suggestion: 'Moreover, / Furthermore, / In addition,',
      explanation: '"Besides" is considered slightly conversational in formal academic discourse. Opt for "moreover", "furthermore", or "additionally" to elevate cohesion.',
      typeLabel: 'Weak / Informal Transition',
      matches: ['besides']
    },
    {
      pattern: /\bfirstly|secondly|thirdly\b/gi,
      category: 'transition',
      severity: 'low',
      suggestion: 'Initially / Next / Finally',
      explanation: 'Symmetrical enumerators like "firstly, secondly, thirdly" can feel simplistic and formulaic. Using varied adverbs like "initially" or "subsequently" is preferred in modern Applied Linguistics peer-reviewed settings.',
      typeLabel: 'Formulaic Transition',
      matches: ['firstly', 'secondly', 'thirdly']
    },
    {
      pattern: /more and more/gi,
      category: 'style',
      severity: 'medium',
      suggestion: 'an increasing number of / progressively',
      explanation: '"More and more" is overly colloquial for top-tier academic prose. Replace with "an increasing frequency of" or "gradually" for high-end styling.',
      typeLabel: 'Colloquial Intensifier',
      matches: ['more and more']
    },
    {
      pattern: /day by day/gi,
      category: 'style',
      severity: 'medium',
      suggestion: 'gradually / progressively / steadily',
      explanation: 'Temporal clichés like "day by day" weaken scholarly precision. Use "steadily", "progressively", or "continually" instead.',
      typeLabel: 'Colloquial Metaphor',
      matches: ['day by day']
    },
    {
      pattern: /it was done by|was conducted by|is shown by|can be seen/gi,
      category: 'passive',
      severity: 'low',
      suggestion: 'the findings reveal / the authors conducted / is evident in',
      explanation: 'Excessive passive construction or passive reporting ("it was done by...") suppresses academic agency. Shifting to active voice where appropriate makes prose more authoritative and cohesive.',
      typeLabel: 'Overly Passive Reporting',
      matches: ['it was done by', 'was conducted by', 'is shown by', 'can be seen']
    },
    {
      pattern: /\bsays that|wrote that\b/gi,
      category: 'passive',
      severity: 'medium',
      suggestion: 'asserts / contends / posits / argues',
      explanation: 'Descriptive reporting verbs such as "says that" or "wrote that" are structurally weak. Elevate to specific analytical reporting verbs like "posits", "contends", "substantiates", or "elucidates".',
      typeLabel: 'Weak Reporting Verb',
      matches: ['says that', 'wrote that']
    },
    {
      pattern: /\blooks at|looked at|looking at\b/gi,
      category: 'style',
      severity: 'medium',
      suggestion: 'examines / investigates / explores',
      explanation: '"Looks at" is standard spoken English but lacks precision in scientific texts. Replace with "examines", "investigates", or "explores".',
      typeLabel: 'Informal Reporting',
      matches: ['looks at', 'looked at', 'looking at']
    },
    {
      pattern: /\bproved that|proves that\b/gi,
      category: 'style',
      severity: 'high',
      suggestion: 'suggests / indicates / points to',
      explanation: 'Using absolute verbs like "proves" or "proved" is a common ELT pitfall. In applied linguistics and social sciences, empirical findings are probabilistic. Use tentative hedging verbs ("suggests", "indicates", "supports").',
      typeLabel: 'Over-claiming / Insufficient Hedging',
      matches: ['proved that', 'proves that']
    },
    {
      pattern: /did a research|made a research|do a research|make a research/gi,
      category: 'l1_interference',
      severity: 'high',
      suggestion: 'conducted research / undertook an investigation',
      explanation: 'Classwork collocation error directly translated from other L1 systems. "Research" is uncountable and collocates with "conducted", "carried out", or "performed", never "made/did a".',
      typeLabel: 'L1 Collocation Interference',
      matches: ['did a research', 'made a research', 'do a research', 'make a research']
    },
    {
      pattern: /according to me/gi,
      category: 'l1_interference',
      severity: 'high',
      suggestion: 'In my view / From this perspective / I argue',
      explanation: '"According to me" is an L1-influenced literal translation that is absent in native scholarly prose. Scholarly writing uses "In my view", "From this perspective", or direct active voice.',
      typeLabel: 'L1 Subjective Phrase',
      matches: ['according to me']
    },
    {
      pattern: /under the light of|under this light/gi,
      category: 'l1_interference',
      severity: 'high',
      suggestion: 'in light of / from this perspective',
      explanation: 'A literal translation of Turkish/L1 idioms (e.g., "ışığında" -> "under the light of"). The correct academic idiom is "in light of" or "from this perspective".',
      typeLabel: 'L1 Literal Idiom',
      matches: ['under the light of', 'under this light']
    },
    {
      pattern: /on the other side/gi,
      category: 'l1_interference',
      severity: 'medium',
      suggestion: 'on the other hand / conversely',
      explanation: 'Literal translation of "diğer taraftan". Use "on the other hand" if contrasting, or "conversely" for elegant formatting.',
      typeLabel: 'L1 Transition Error',
      matches: ['on the other side']
    },
    {
      pattern: /plays a crucial role|play a crucial role/gi,
      category: 'cliché',
      severity: 'medium',
      suggestion: 'is fundamental to / underpins',
      explanation: '"Plays a crucial role" is a highly overused academic cliché. Opt for "is fundamental to", "serves as a cornerstone of", or "vitalizes" to sound more scholarly.',
      typeLabel: 'Overused Cliché Metaphor',
      matches: ['plays a crucial role', 'play a crucial role']
    },
    {
      pattern: /plays a pivotal role|play a pivotal role/gi,
      category: 'cliché',
      severity: 'medium',
      suggestion: 'is central / is key to',
      explanation: '"Plays a pivotal role" is highly recursive and formulaic in non-native linguistics manuscripts. Replace with "underpins", "supports", or "is critical to".',
      typeLabel: 'Overused Cliché Metaphor',
      matches: ['plays a pivotal role', 'play a pivotal role']
    },
    {
      pattern: /sheds light on|shed light on/gi,
      category: 'cliché',
      severity: 'medium',
      suggestion: 'clarifies / explicates / elucidates',
      explanation: '"Shedding light on" is a classic metaphorical cliché. Swap for analytical verbs like "explicating", "elucidating", or "uncovering" to boost technical density.',
      typeLabel: 'Metaphorical Cliché',
      matches: ['sheds light on', 'shed light on']
    },
    {
      pattern: /in today's rapidly changing world|in today's world|in modern society/gi,
      category: 'cliché',
      severity: 'high',
      suggestion: 'N/A (Remove or rewrite directly)',
      explanation: 'Vague universal openers like "In today\'s rapidly changing world..." weaken the academic focus immediately. Start directly with the theoretical framework, classroom reality, or relevant literature.',
      typeLabel: 'Universal Filler Opening Hook',
      matches: ["in today's rapidly changing world", "in today's world", "in modern society"]
    },
    {
      pattern: /taken together/gi,
      category: 'cliché',
      severity: 'low',
      suggestion: 'Cumulatively / Collectively / Summarily',
      explanation: '"Taken together" is a highly formulaic transition phrase. Try "cumulatively" or "collectively" to vary paragraph connectors.',
      typeLabel: 'Formulaic Transition Accent',
      matches: ['taken together']
    },
    {
      pattern: /it is worth noting that/gi,
      category: 'cliché',
      severity: 'medium',
      suggestion: 'Notably, / (Omit entirely)',
      explanation: '"It is worth noting that" is an empty meta-textual filler. It is usually more impactful to state the assertion directly without meta-announcements.',
      typeLabel: 'Meta-language Filler',
      matches: ['it is worth noting that']
    },
    {
      pattern: /valuable pedagogical tool/gi,
      category: 'cliché',
      severity: 'low',
      suggestion: 'effective instructional resource / constructive methodology',
      explanation: 'The phrase is standard but represents repetitive jargon in SLA textbooks. Use "constructive learning intervention" or "effective pedagogical instrument" to broaden your Lexicon.',
      typeLabel: 'Repetitive Jargon',
      matches: ['valuable pedagogical tool']
    }
  ];

  let idCounter = 1;

  rules.forEach(rule => {
    let match;
    // reset regex index
    rule.pattern.lastIndex = 0;
    while ((match = rule.pattern.exec(text)) !== null) {
      pitfalls.push({
        id: `local-p-${idCounter++}`,
        category: rule.category,
        severity: rule.severity,
        startIdx: match.index,
        originalPhrasing: match[0],
        suggestion: rule.suggestion,
        explanation: rule.explanation,
        typeLabel: rule.typeLabel
      });
    }
  });

  // Sort by startIdx for consistent display
  return pitfalls.sort((a, b) => a.startIdx - b.startIdx);
}

export function generateGenericCritique(text: string, pitfallsCount: number): string {
  if (text.trim().length === 0) return 'Please paste a draft to generate coach suggestions.';
  
  if (pitfallsCount === 0) {
    return 'Superb! An initial scan did not identify basic formulaic clichés, L1 interference collocations, or overly passive reporting. Your academic discourse displays high structural discipline and proper hedging. Make sure to run the AI-Powered review for deeper grammatical cohesion analyses.';
  }

  if (pitfallsCount < 3) {
    return 'Strong foundational draft with occasional stylistic bottlenecks. Your writing is highly scholarly but incorporates minor recurring academic clichés (for example, empty indicators like "it is worth noting"). Adjusting these to direct active voice as advised will make your claims more impactful.';
  }

  return 'The manuscript is structurally cohesive but suffers from an density of classic ELT-specific pitfalls. Notable issues include simplistic transitions (e.g. overusing "On the other hand" instead of "conversely") and L1 interference collocations. Shifting these to native-speaker academic phrasing and tempering dogmatic claims with safe academic hedges (such as "indicates" rather than "proves") is highly recommended for impact-indexed publication acceptance.';
}
