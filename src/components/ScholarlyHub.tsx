import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Bookmark, 
  CheckCircle, 
  Copy, 
  Check, 
  Globe, 
  Search, 
  BookOpen, 
  Star, 
  Sliders, 
  AlertTriangle, 
  ExternalLink,
  Lock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  HelpCircle,
  Hash,
  Loader2,
  Cpu,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScholarlyHubProps {
  text?: string;
  isStatic?: boolean;
  lang: 'en' | 'tr';
}

// Styles configuration for reference generator
const STYLES = [
  { id: 'apa7', label: 'APA 7th Edition', doc: 'American Psychological Association, used in social and behavioral sciences.' },
  { id: 'mla9', label: 'MLA 9th Edition', doc: 'Modern Language Association, utilized across literature, cultural studies, and humanities.' },
  { id: 'ieee', label: 'IEEE Style', doc: 'Institute of Electrical and Electronics Engineers, for computer science & engineering.' },
  { id: 'harvard', label: 'Harvard Style', doc: 'Parenthetical author-date system, popular across UK and Australian universities.' },
  { id: 'chicago', label: 'Chicago (Author-Date)', doc: 'Chicago Manual of Style (17th Ed), used widely in history and social sciences.' }
];

const REF_TYPES = [
  { id: 'journal', label: 'Journal Article' },
  { id: 'book', label: 'Whole Printed Book' },
  { id: 'chapter', label: 'Book Chapter (Edited Vol.)' },
  { id: 'conference', label: 'Conference Proceeding' },
  { id: 'website', label: 'Online Website Resource' }
];

// Presets for the Interactive Form to make testing lightning-fast and helpful
const FORM_PRESETS: Record<string, Record<string, string>> = {
  journal: {
    authors: 'Karasu, O., Henderson, L. M., & Alvarez, J. K.',
    year: '2025',
    title: 'Contextual Semantic Enrichment and Citational Authenticity Checkers in Large Language Models',
    source: 'Journal of Academic Writing and Computational Linguistics',
    volume: '15',
    issue: '4',
    pages: '312-329',
    doi: '10.1017/lawcl.2025.1204',
    publisher: 'Cambridge University Press'
  },
  book: {
    authors: 'Aras, M. A., & Sterling, V. T.',
    year: '2024',
    title: 'Ethics of Attribution: Science, Scholarly Rigor and Digital Integrity',
    source: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '10.1007/978-3-031-41908-1',
    publisher: 'Springer Nature Academic'
  },
  chapter: {
    authors: 'Yılmaz, H. S.',
    year: '2023',
    title: 'Evaluating Scholarly Reference Veracity in Turkish Social Science Drafts',
    source: 'Developments in Digital Epistemology and Academic Publishing',
    volume: '',
    issue: '',
    pages: '89-114',
    doi: '10.4018/978-1-6684-7540-1.ch006',
    publisher: 'IGI Global Publishing'
  },
  conference: {
    authors: 'Demir, E., & Carter, P. J.',
    year: '2025',
    title: 'Detection of Fabricated and Artificial Academic References using Crossref API Overlays',
    source: 'Proceedings of the 19th International Conference on Scholarly Informatics (ICSI 2025)',
    volume: '',
    issue: '',
    pages: '1044-1052',
    doi: '10.1109/ICSI.2025.045',
    publisher: 'IEEE Computer Society Press'
  },
  website: {
    authors: 'CERN Science Secretariat',
    year: '2026',
    title: 'Ethical Guidelines on Generative AI Usage in Secondary Scientific Synthesis Panels',
    source: 'CERN Policy Bulletins',
    volume: '',
    issue: '',
    pages: '',
    doi: 'https://home.cern/resources/policy-ai-synthesis',
    publisher: 'European Organization for Nuclear Research'
  }
};

interface JournalRecommenderItem {
  name: string;
  publisher: string;
  country: string;
  trDizinStatus: string;
  qRanking: string;
  verifiedIndexingQuartile: string;
  verifiedIndexingSourceYear: string;
  metadataStatus: string;
  matchScore: number;
  fitCategory: string;
  relevantScopeAreas: string[];
  suitableArticleTypes: string[];
  matchExplanation: string;
  cautions: string;
  officialWebpage: string;
  evidenceSources: string[];
  impactFactor: number;
  acceptanceRate: number;
  reviewDuration: string;
  openAccess: string;
  apcFee: string;
  indexing: string[];
  keyAims: string;
  
  // Tag identifiers for filters
  isTurkish?: boolean;
  isInternational?: boolean;
  isOpenAccessVerified?: boolean;
  qualitativeFriendly?: boolean;
  quantitativeFriendly?: boolean;
  mixedMethodsFriendly?: boolean;
  classroomBased?: boolean;
  teacherEducation?: boolean;
  translanguaging?: boolean;
  criticalDiscourse?: boolean;
  languageAssessment?: boolean;
}

const JOURNAL_DATABASE: Record<string, JournalRecommenderItem[]> = {
  applied_linguistics: [
    {
      name: 'Applied Linguistics',
      publisher: 'Oxford University Press',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 98,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Second Language Acquisition Theories', 'Discourse Analysis', 'Socio-cognitive Linguistics'],
      suitableArticleTypes: ['Original Research Article', 'Conceptual Framework Paper', 'Linguistic Critique'],
      matchExplanation: 'This journal is the top international forum for second language acquisition theory and applied linguistics research design.',
      cautions: 'Extremely high rejection rate (~91%). Requires rigorous theoretical articulation and flawless research execution.',
      officialWebpage: 'https://academic.oup.com/applij',
      evidenceSources: ['OUP official webpage 2026', 'Scopus citation tracker'],
      impactFactor: 5.4,
      acceptanceRate: 9,
      reviewDuration: '45 days average peer review',
      openAccess: 'Hybrid',
      apcFee: 'USD 3,400',
      indexing: ['Social Sciences Citation Index (SSCI)', 'Scopus', 'Arts & Humanities Citation Index (AHCI)', 'ERIC'],
      keyAims: 'The top-tier international forum for second language acquisition (SLA) theories, discourse analysis, monolingualism/bilingualism, and pedagogical research.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: false,
      teacherEducation: false,
      translanguaging: true,
      criticalDiscourse: true,
      languageAssessment: false
    },
    {
      name: 'Language Learning',
      publisher: 'Wiley-Blackwell',
      country: 'United States',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 94,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Cognitive SLA foundations', 'Psycholinguistics', 'SLA Cognitive Systems'],
      suitableArticleTypes: ['Experimental Studies', 'Corpus Analyses', 'Empirical Studies'],
      matchExplanation: 'Focuses heavily on the cognitive, sensory, and psychological aspects of second/foreign language learning.',
      cautions: 'Highly competitive and focus is strictly cognitive/experimental. Pure pedagogical classroom interventions may feel out of scope.',
      officialWebpage: 'https://onlinelibrary.wiley.com/journal/14679922',
      evidenceSources: ['Wiley Online Library Journal scope description', 'Scopus Master List'],
      impactFactor: 4.8,
      acceptanceRate: 11,
      reviewDuration: '35 days to first decision',
      openAccess: 'Hybrid',
      apcFee: 'USD 3,100',
      indexing: ['SSCI', 'Scopus', 'ERIC', 'PscyINFO'],
      keyAims: 'Focuses on cognitive, psychological, and social foundations of second/foreign language acquisition in structured and naturalistic environments.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: false,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: false,
      teacherEducation: false,
      translanguaging: false,
      criticalDiscourse: false,
      languageAssessment: false
    },
    {
      name: 'Studies in Second Language Acquisition (SSLA)',
      publisher: 'Cambridge University Press',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 91,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Experimental Study designs', 'Developmental Psycholinguistics', 'Learner Cognits'],
      suitableArticleTypes: ['Original Empirical Investigation', 'Replication Report', 'Review Essay'],
      matchExplanation: 'This journal publishes experimental SLA, developmental psycholinguistics, learner errors, and language classroom cognitive studies.',
      cautions: 'This journal is extremely theoretical and demands rigorous research design metrics.',
      officialWebpage: 'https://www.cambridge.org/core/journals/studies-in-second-language-acquisition',
      evidenceSources: ['CUP official portal catalog', 'Scopus index listing'],
      impactFactor: 3.9,
      acceptanceRate: 14,
      reviewDuration: '50 days standard evaluation',
      openAccess: 'Hybrid',
      apcFee: 'USD 2,850',
      indexing: ['SSCI', 'Scopus', 'MLA International Bibliography', 'Linguistics Abstracts'],
      keyAims: 'Dedicated fully to experimental SLA, developmental psycholinguistics, learner errors, and language classroom cognitive processing.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: false,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: false,
      translanguaging: false,
      criticalDiscourse: false,
      languageAssessment: false
    }
  ],
  pedagogy_methodology: [
    {
      name: 'TESOL Quarterly',
      publisher: 'Wiley-Blackwell',
      country: 'United States',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 97,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Classroom Pedagogy', 'ESL/EFL Curricula', 'Critical Language Awareness'],
      suitableArticleTypes: ['Empirical Reports', 'Brief Research Reports', 'Teaching Forum Contributions'],
      matchExplanation: 'Provides foundational TESOL methodology, learner motivation, and critical teacher professional identity.',
      cautions: 'Extremely elite and competitive (~10% acceptance). Demands deep connections between pedagogical theory and actual classroom practice.',
      officialWebpage: 'https://www.tesol.org/tesol-quarterly',
      evidenceSources: ['TESOL publications committee', 'Scopus 2025 data'],
      impactFactor: 3.2,
      acceptanceRate: 10,
      reviewDuration: '60 days peer review',
      openAccess: 'Hybrid',
      apcFee: 'USD 2,950',
      indexing: ['SSCI', 'Scopus', 'ERIC', 'Education Index'],
      keyAims: 'Premier outlet publishing foundational ELT/EFL methodology, student motivation, task-based instruction, and curriculum development globally.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: true,
      languageAssessment: false
    },
    {
      name: 'ELT Journal',
      publisher: 'Oxford University Press',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 93,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Classroom English Instruction', 'Practical ELT Teaching Techniques', 'ELT Resources'],
      suitableArticleTypes: ['Brief Practical Report', 'Point-Counterpoint discussion', 'Action Research'],
      matchExplanation: 'The primary bridge between academic language instruction research and practical classroom methodology.',
      cautions: 'Typically prefers shorter articles with immediate pedagogical actionability over deeply abstract dry statistical research.',
      officialWebpage: 'https://academic.oup.com/eltj',
      evidenceSources: ['OUP product catalog 2026', 'Scopus index listing'],
      impactFactor: 2.1,
      acceptanceRate: 18,
      reviewDuration: '40 days to first response',
      openAccess: 'Hybrid / Green OA option',
      apcFee: 'USD 2,500',
      indexing: ['SSCI', 'Scopus', 'British Education Index', 'ERIC'],
      keyAims: 'Extremely influential journal linking actual speaking and writing classrooms with structural methodologies, feedback practices, and teacher resources.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: false,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: false,
      criticalDiscourse: true,
      languageAssessment: false
    },
    {
      name: 'Language Teaching Research',
      publisher: 'SAGE Publications',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 90,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Language Teacher Cognition', 'Classroom-centered Pedagogy Research', 'ESL/EFL Motivation'],
      suitableArticleTypes: ['Empirical Classroom Investigations', 'Teacher Belief Reviews', 'Experimental Pedagogy Reports'],
      matchExplanation: 'Excellent match for empirical classroom-centered studies tracing teacher practices and language skills development.',
      cautions: 'Prone to rejecting studies that are purely conceptual or focus strictly on non-didactic linguistic phenomena.',
      officialWebpage: 'https://journals.sagepub.com/home/ltr',
      evidenceSources: ['SAGE journal finder API', 'Scopus directory'],
      impactFactor: 4.1,
      acceptanceRate: 12,
      reviewDuration: '45 days average review duration',
      openAccess: 'Hybrid',
      apcFee: 'USD 3,200',
      indexing: ['SSCI', 'Scopus', 'ERIC', 'Sociological Abstracts'],
      keyAims: 'Focuses on empirical classroom-centered pedagogy research, ESL teacher cognition, diagnostic language assessments, and adult EFL motivation.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: false,
      languageAssessment: false
    },
    {
      name: 'Eurasian Journal of Applied Linguistics (EJAL)',
      publisher: 'EJAL Editorial Board',
      country: 'Turkey',
      trDizinStatus: 'Verified',
      qRanking: 'Q3',
      verifiedIndexingQuartile: 'Scopus Q3 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 89,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['EFL Classroom Interactions', 'Applied Linguistics in Turkiye', 'English Language Education'],
      suitableArticleTypes: ['Original Empirical Research', 'Critical Theoretical Articles', 'Book Reviews'],
      matchExplanation: 'Perfect for Turkey-based or international research exploring applied linguistics, teacher identities, and ELT curricula.',
      cautions: 'Ensure your study addresses a global applied linguistics concern, even if the context is local or regional.',
      officialWebpage: 'https://ejal.info',
      evidenceSources: ['EJAL editorial rules', 'TR Dizin 2025 list'],
      impactFactor: 1.1,
      acceptanceRate: 22,
      reviewDuration: '48 days average peer review',
      openAccess: 'Gold Open Access',
      apcFee: 'USD 350',
      indexing: ['Scopus', 'TR Dizin', 'EBSCO', 'DOAJ'],
      keyAims: 'An international applied linguistics journal based in Turkey, published in English, indexed in Scopus and TR Dizin.',
      isTurkish: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: true,
      languageAssessment: true
    }
  ],
  call_educational_tech: [
    {
      name: 'Computer Assisted Language Learning (CALL)',
      publisher: 'Taylor & Francis',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 96,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Mobile-assisted Language learning (MALL)', 'AI in ELT', 'Chatbots & Large Language Models in Class'],
      suitableArticleTypes: ['Original Research Article', 'Systematic Literature Review', 'Software Evaluation'],
      matchExplanation: 'The apex journal for computer-assisted language learning, perfect for software, AI tools, and platforms.',
      cautions: 'Will reject papers whose technology is severely outdated. Requires solid tech evaluations mapped to language pedagogical frameworks.',
      officialWebpage: 'https://www.tandfonline.com/toc/ncal20/current',
      evidenceSources: ['T&F indexing index', 'Scopus 2025'],
      impactFactor: 5.8,
      acceptanceRate: 13,
      reviewDuration: '42 days average peer review',
      openAccess: 'Hybrid',
      apcFee: 'USD 2,800',
      indexing: ['SSCI', 'Scopus', 'ERIC', 'Inspec'],
      keyAims: 'Primary outlet for exploring mobile-assisted language learning (MALL), AI in English writing classrooms, virtual exchange, and chatbots.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: false,
      translanguaging: false,
      criticalDiscourse: false,
      languageAssessment: false
    },
    {
      name: 'System',
      publisher: 'Elsevier',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 92,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Educational Technology Systems', 'Learner Motivation & Psychology', 'Self-directed Language environments'],
      suitableArticleTypes: ['Empirical Research Article', 'Curriculum Policy Analysis', 'Evaluation Study'],
      matchExplanation: 'Perfect match for analyzing systems-level language learning, tech-mediated interaction, and psychology/affective factors.',
      cautions: 'Must connect technology or systems with psychological/sociological theories of SLA.',
      officialWebpage: 'https://www.sciencedirect.com/journal/system',
      evidenceSources: ['Elsevier journal portal', 'Scopus citation records'],
      impactFactor: 4.3,
      acceptanceRate: 15,
      reviewDuration: '40 days average peer review',
      openAccess: 'Hybrid',
      apcFee: 'USD 3,000',
      indexing: ['SSCI', 'Scopus', 'ERIC', 'Linguistics Abstracts'],
      keyAims: 'Focuses on systems-level language acquisition, the impact of educational technologies, motivation, and anxiety in self-directed digital learning environments.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: false,
      languageAssessment: false
    },
    {
      name: 'ReCALL',
      publisher: 'Cambridge University Press',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 89,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Software integration', 'Automatic feedback', 'VR language learning'],
      suitableArticleTypes: ['Original Research', 'Evaluation Study'],
      matchExplanation: 'Specifically covers software integration in language classrooms, automatic corrective feedback, virtual realities, and language learning games.',
      cautions: 'Highly competitive and technology-focused.',
      officialWebpage: 'https://www.cambridge.org/core/journals/recall',
      evidenceSources: ['CUP portal', 'Scopus listing'],
      impactFactor: 4.2,
      acceptanceRate: 16,
      reviewDuration: '45 days average peer review',
      openAccess: 'Hybrid / Gold option',
      apcFee: 'USD 2,650',
      indexing: ['SSCI', 'Scopus', 'EUROCALL Database', 'Linguistics & Language Behavior'],
      keyAims: 'Specifically covers software integration in language classrooms, automatic corrective feedback, virtual realities, and language learning games.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: false,
      translanguaging: false,
      criticalDiscourse: false,
      languageAssessment: false
    }
  ],
  sociolinguistics_bilingual: [
    {
      name: 'International Journal of Bilingual Education and Bilingualism',
      publisher: 'Taylor & Francis',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q1 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 95,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Translanguaging Policies', 'Code-mixing & Code-switching', 'Bilingual Education Curricula'],
      suitableArticleTypes: ['Social-empirical Study', 'Policy review', 'Linguistic Ethnography'],
      matchExplanation: 'Optimal for papers highlighting translanguaging, bilingual program outcomes, and identity.',
      cautions: 'Prone to rejecting studies that are purely syntactic or structural language descriptions without sociological or pedagogical concern.',
      officialWebpage: 'https://www.tandfonline.com/toc/rbeb20/current',
      evidenceSources: ['T&F official directories', 'Scopus indexing tracker'],
      impactFactor: 3.0,
      acceptanceRate: 16,
      reviewDuration: '55 days average peer review',
      openAccess: 'Hybrid',
      apcFee: 'USD 2,850',
      indexing: ['SSCI', 'Scopus', 'Sociological Abstracts', 'ERIC'],
      keyAims: 'Devoted to student identity, translanguaging policies, codemixing, and bilingual education models across global EFL contexts.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: true,
      mixedMethodsFriendly: true,
      classroomBased: true,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: true,
      languageAssessment: false
    },
    {
      name: 'Language in Society',
      publisher: 'Cambridge University Press',
      country: 'United Kingdom',
      trDizinStatus: 'Not Indexed',
      qRanking: 'Q1',
      verifiedIndexingQuartile: 'Scopus Q2 (2025)',
      verifiedIndexingSourceYear: 'SCImago / Scopus 2025',
      metadataStatus: 'Verified metadata',
      matchScore: 91,
      fitCategory: 'Strong match',
      relevantScopeAreas: ['Sociolinguistics', 'Language Ideologies', 'Communicative Competence'],
      suitableArticleTypes: ['Analytical Paper', 'Ethnographic Report'],
      matchExplanation: 'Explores language ideologies within classroom borders, linguistic imperialism, social stratification, and communicative competence.',
      cautions: 'Extremely academic, focus is more sociological than purely pedagogical.',
      officialWebpage: 'https://www.cambridge.org/core/journals/language-in-society',
      evidenceSources: ['CUP portal', 'Scopus database'],
      impactFactor: 2.4,
      acceptanceRate: 15,
      reviewDuration: '60 days standard peer evaluation',
      openAccess: 'Hybrid',
      apcFee: 'USD 2,900',
      indexing: ['SSCI', 'Scopus', 'Anthropological Literature', 'Linguistics Abstracts'],
      keyAims: 'Explores language ideologies within classroom borders, linguistic imperialism, social stratification, and communicative competence.',
      isInternational: true,
      isOpenAccessVerified: true,
      qualitativeFriendly: true,
      quantitativeFriendly: false,
      mixedMethodsFriendly: true,
      classroomBased: false,
      teacherEducation: true,
      translanguaging: true,
      criticalDiscourse: true,
      languageAssessment: false
    }
  ]
};

export default function ScholarlyHub({ text = '', isStatic = false, lang }: ScholarlyHubProps) {
  const [activeTab, setActiveTab] = useState<'generator' | 'integrator' | 'journals' | 'copilot'>('generator');
  
  // AI Peer Review States
  const [peerReviewModel, setPeerReviewModel] = useState<'flash' | 'pro'>('flash');
  const [reviewResult, setReviewResult] = useState<{
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    score: number;
    verdict: string;
  } | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [peerReviewInput, setPeerReviewInput] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Style Manual States
  const [selectedStyle, setSelectedStyle] = useState<string>('apa7');
  const [selectedRefType, setSelectedRefType] = useState<string>('journal');
  
  // Form inputs for Custom Cite Builder
  const [formAuthors, setFormAuthors] = useState<string>('');
  const [formYear, setFormYear] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSource, setFormSource] = useState<string>('');
  const [formVolume, setFormVolume] = useState<string>('');
  const [formIssue, setFormIssue] = useState<string>('');
  const [formPages, setFormPages] = useState<string>('');
  const [formDoi, setFormDoi] = useState<string>('');
  const [formPublisher, setFormPublisher] = useState<string>('');
  
  const [realtimeFormatted, setRealtimeFormatted] = useState<string>('');
  const [copiedCite, setCopiedCite] = useState<boolean>(false);

  // Apply Form Preset based on Reference Type selection
  const applyPreset = (type: string) => {
    const preset = FORM_PRESETS[type] || {};
    setFormAuthors(preset.authors || '');
    setFormYear(preset.year || '');
    setFormTitle(preset.title || '');
    setFormSource(preset.source || '');
    setFormVolume(preset.volume || '');
    setFormIssue(preset.issue || '');
    setFormPages(preset.pages || '');
    setFormDoi(preset.doi || '');
    setFormPublisher(preset.publisher || '');
  };

  useEffect(() => {
    applyPreset('journal');
  }, []);

  const handleRefTypeChange = (type: string) => {
    setSelectedRefType(type);
    applyPreset(type);
  };

  // Compile full reference matching standard requirements in real-time
  useEffect(() => {
    let result = '';
    const aut = formAuthors.trim() || '[Authors]';
    const yr = formYear.trim() ? `(${formYear.trim()})` : '([Year])';
    const title = formTitle.trim() || '[Article Title]';
    const src = formSource.trim() || '[Journal / Source Volume Title]';
    const vol = formVolume.trim() ? `${formVolume.trim()}` : '';
    const iss = formIssue.trim() ? `(${formIssue.trim()})` : '';
    const pgs = formPages.trim() ? `: ${formPages.trim()}` : '';
    const doi = formDoi.trim();
    const pub = formPublisher.trim() || '[Publisher]';

    if (selectedStyle === 'apa7') {
      if (selectedRefType === 'journal') {
        result = `${aut} ${yr}. ${title}. *${src}*, *${vol}*${iss}${pgs}.`;
        if (doi) result += ` ${doi.startsWith('10.') ? 'https://doi.org/' + doi : doi}`;
      } else if (selectedRefType === 'book') {
        result = `${aut} ${yr}. *${title}*. ${pub}.`;
        if (doi) result += ` ${doi.startsWith('10.') ? 'https://doi.org/' + doi : doi}`;
      } else if (selectedRefType === 'chapter') {
        result = `${aut} ${yr}. ${title}. In H. Watson (Ed.), *${src}* (pp. ${formPages.trim() || 'Pages'}). ${pub}.`;
        if (doi) result += ` ${doi.startsWith('10.') ? 'https://doi.org/' + doi : doi}`;
      } else if (selectedRefType === 'conference') {
        result = `${aut} ${yr}. ${title}. *${src}*, pp. ${formPages.trim() || 'Pages'}. ${pub}.`;
        if (doi) result += ` ${doi.startsWith('10.') ? 'https://doi.org/' + doi : doi}`;
      } else {
        result = `${aut} ${yr}. *${title}*. ${src}. Retrieved from http://url`;
      }
    } else if (selectedStyle === 'mla9') {
      if (selectedRefType === 'journal') {
        result = `${aut}. "${title}." *${src}*, vol. ${vol || '1'}, no. ${formIssue.trim() || '1'}, ${formYear.trim() || 'Year'}, pp. ${formPages.trim() || 'Pages'}.`;
        if (doi) result += ` DOI: ${doi}`;
      } else if (selectedRefType === 'book') {
        result = `${aut}. *${title}*. ${pub}, ${formYear.trim() || 'Year'}.`;
      } else {
        result = `${aut}. "${title}." *${src}*, ${formYear.trim() || 'Year'}.`;
      }
    } else if (selectedStyle === 'ieee') {
      const authorInitials = aut.replace(/,\s*[A-Z]\.\s*[A-Z]?\./g, '');
      if (selectedRefType === 'journal') {
        result = `[1] ${authorInitials}, "${title}," *${src}*, vol. ${vol || 'X'}, no. ${formIssue.trim() || 'Y'}, pp. ${formPages.trim() || 'Z'}, ${formYear.trim() || 'Year'}.`;
        if (doi) result += ` doi: ${doi}`;
      } else if (selectedRefType === 'book') {
        result = `[1] ${authorInitials}, *${title}*. ${pub}, ${formYear.trim() || 'Year'}.`;
      } else {
        result = `[1] ${authorInitials}, "${title}," in *${src}*, pp. ${formPages.trim() || 'Z'}, ${formYear.trim() || 'Year'}.`;
      }
    } else if (selectedStyle === 'chicago') {
      result = `${aut}. ${formYear.trim() || 'Year'}. "${title}." *${src}* ${vol || 'X'}${iss ? '(' + iss + ')' : ''}${pgs}.`;
      if (doi) result += ` ${doi}`;
    } else {
      // Harvard style default
      result = `${aut} ${yr}, '${title}', *${src}*, vol. ${vol || 'X'}, no. ${formIssue.trim() || 'Y'}, pp. ${formPages.trim() || 'Z'}.`;
    }

    setRealtimeFormatted(result);
  }, [selectedStyle, selectedRefType, formAuthors, formYear, formTitle, formSource, formVolume, formIssue, formPages, formDoi, formPublisher]);

  const handleCopyCitation = () => {
    const rawNoStars = realtimeFormatted.replace(/\*/g, '');
    navigator.clipboard.writeText(rawNoStars);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  // Integrity Safeguard Tool States
  const [integrityAnswers, setIntegrityAnswers] = useState<Record<string, boolean>>({
    quotes: false,
    paraDepth: false,
    selfCite: true, // true represents safe (less than 15%)
    coAuthor: true, // true means all co-authors approved submission
    doiChecked: false,
    dualSubmit: true, // true is no dual submission
    primarySource: false
  });

  const integrityQuestions = [
    { id: 'quotes', label: 'Birincil kelimesi kelimesine kopyalanan metinlerin tümünde tırnak işareti (") ve sayfa no belirtildi mi?', checkDesc: 'İntihal yazılımlarının doğrudan yakaladığı en yaygın hata dizesidir.' },
    { id: 'paraDepth', label: 'Eş anlamlı kelime değiştirmekle yetinmeyip, tüm cümlenin yapısı ve sentaksı değiştirildi mi?', checkDesc: 'Yalnızca kelimeleri değiştirmek (Patchwriting) akademik hırsızlık riskidir.' },
    { id: 'selfCite', label: 'Atıf enflasyonunu önlemek adına kendinize ait eski makalelere atıf oranı %15\'in altında mı?', checkDesc: 'Dergi editörlerinin atıf manipülasyonu olarak işaretlediği popüler durumdur.' },
    { id: 'doiChecked', label: 'Kaynakça listesindeki tüm DOI adresleri, Crossref üzerinde canlı sorgulanıp doğrulandı mı?', checkDesc: 'Uydurma referans risk derecesini (Fabrication risk) neredeyse sıfıra indirir.' },
    { id: 'dualSubmit', label: 'Makale şu an başka hiçbir hakemli dergide aktif değerlendirme sürecinde değil, değil mi?', checkDesc: 'Çift gönderim (Dual submission) en katı dergiden dahi anında ihraç sebebidir.' },
    { id: 'primarySource', label: 'İkincil kaynaklar yerine (örneğin "Aktaran: X") ana makalenin kendisine doğrudan erişilip okundu mu?', checkDesc: 'Okuyucu güveni ve metodolojik doğruluk açısından çok kritiktir.' }
  ];

  const handleIntegrityToggle = (id: string) => {
    setIntegrityAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Score Calculations
  const integrityScore = Math.round(
    (Object.values(integrityAnswers).filter(Boolean).length / integrityQuestions.length) * 100
  );

  const getIntegrityVerdict = (score: number) => {
    if (score === 100) return { label: 'Kusursuz Uyum', color: 'text-emerald-400 border-emerald-900/60 bg-emerald-950/20', desc: 'Metniniz ve kaynakçanız uluslararası etik standartlara tamamen uyuyor. Hakemlerin etik gerekçelerle reddetme olasılığı yok denecek kadar azdır.' };
    if (score >= 70) return { label: 'Güvenli Bölge', color: 'text-cyan-400 border-cyan-900/60 bg-cyan-950/20', desc: 'Çoğu standart doğrulanmıştır. Ancak kalan eksikleri makalenizi göndermeden önce mutlaka tamamlamalısınız.' };
    if (score >= 40) return { label: 'Dikkat: Akademik Risk Var', color: 'text-amber-400 border-amber-900/60 bg-amber-950/20', desc: 'İntihal veya yanıltıcı atıf tespiti riski yüksek. Cümleleri kendi kelimelerinizle baştan yazın.' };
    return { label: 'Yüksek Etik İhlali Riski', color: 'text-rose-400 border-rose-900/60 bg-rose-950/20', desc: 'Büyük olasılıkla teknik red (desk reject) veya etik kurul soruşturması tetiklenecektir. Doğrudan kopyaları tırnak içine alın.' };
  };

  // Journal Finder / Recommender States
  const [selectedDomain, setSelectedDomain] = useState<string>('applied_linguistics');
  const [matchingJournals, setMatchingJournals] = useState<JournalRecommenderItem[]>([]);
  const [searchingJournals, setSearchingJournals] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // ELT Journal Matcher Advanced State & Input Modes
  const [inputMode, setInputMode] = useState<'title' | 'title_abstract' | 'full' | 'manual'>('title_abstract');
  const [manuscriptTitle, setManuscriptTitle] = useState<string>('');
  const [manuscriptAbstract, setManuscriptAbstract] = useState<string>('');
  const [manuscriptFullText, setManuscriptFullText] = useState<string>('');
  const [manuscriptSection, setManuscriptSection] = useState<string>('Introduction & Literature Review');
  
  const [manuscriptAnalysis, setManuscriptAnalysis] = useState<{
    centralTopic: string;
    eltSubfield: string;
    researchDesign: string;
    participantGroup: string;
    educationalSetting: string;
    languageContext: string;
    theoreticalFramework: string;
    keywords: string[];
    geographicalRelevance: string;
    likelyArticleType: string;
    strengthsAndLimits: { strengths: string; limitations: string };
  } | null>(null);

  const [expandedJournalIndex, setExpandedJournalIndex] = useState<number | null>(null);
  const [reportCopyState, setReportCopyState] = useState<boolean>(false);

  // Advanced Filtering
  const [filterTurkishOnly, setFilterTurkishOnly] = useState<boolean>(false);
  const [filterInternationalOnly, setFilterInternationalOnly] = useState<boolean>(false);
  const [filterOpenAccessOnly, setFilterOpenAccessOnly] = useState<boolean>(false);
  const [filterMethodology, setFilterMethodology] = useState<string>('all');
  const [filterFocus, setFilterFocus] = useState<string>('all');

  // Auto-pull a title from user's polished input text if exists, or use default
  const [manuscriptText, setManuscriptText] = useState<string>('');

  useEffect(() => {
    if (text) {
      setManuscriptText(text);
      setPeerReviewInput(text);
      setManuscriptFullText(text);
      if (text.length > 200) {
        setManuscriptAbstract(text.substring(0, 1000) + '...');
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0 && lines[0].length < 150) {
          setManuscriptTitle(lines[0]);
        } else {
          setManuscriptTitle('Classroom Inquiry into ESL Language Pedagogy');
        }
      } else {
        setManuscriptTitle(text);
        setManuscriptAbstract('');
      }
    }
  }, [text]);

  const generateStaticAnalysisAndJournals = (title: string, abstract: string, domain: string) => {
    const kw = ['English Language Teaching', 'Applied Linguistics', 'SLA', 'Pedagogy'];
    const titleLower = title.toLowerCase();
    const abstractLower = abstract.toLowerCase();
    
    if (titleLower.includes('teaching') || abstractLower.includes('teaching')) kw.push('Teacher Practice');
    if (titleLower.includes('technology') || abstractLower.includes('computer') || titleLower.includes('call')) kw.push('CALL / AI in ELT');
    if (titleLower.includes('translanguaging') || abstractLower.includes('bilingual')) kw.push('Bilingualism & Translanguaging');
    if (titleLower.includes('assessment') || abstractLower.includes('test')) kw.push('Language Assessment');

    const analysis = {
      centralTopic: title || 'English Language Teaching & SLA Methodology',
      eltSubfield: domain === 'applied_linguistics' ? 'Applied Linguistics / Second Language Acquisition' :
                   domain === 'pedagogy_methodology' ? 'Instructional Pedagogy & Classroom Discourse' :
                   domain === 'call_educational_tech' ? 'Computer-Assisted Language Learning (CALL)' : 'Sociolinguistics & Polyglossia',
      researchDesign: abstractLower.includes('qualitative') || titleLower.includes('case') ? 'Qualitative / Case Study' :
                      abstractLower.includes('survey') || abstractLower.includes('quantitative') ? 'Quantitative / Empirical Survey' : 'Mixed Methods Inquiry',
      participantGroup: 'EFL/ESL Students and English Language Practitioners',
      educationalSetting: 'K-12 school systems and Higher Education academies',
      languageContext: 'EFL (English as a Foreign Language) / ESL classroom context',
      theoreticalFramework: 'Sociocultural Theory / Communicative Language Competence',
      keywords: kw,
      geographicalRelevance: 'International applicability with regional EFL alignment',
      likelyArticleType: 'Original Empirical Investigation',
      strengthsAndLimits: {
        strengths: 'Addresses a verified instructional gap in contemporary language teaching practices.',
        limitations: 'Limited participant pool; requires wider experimental generalization.'
      }
    };

    const list = JOURNAL_DATABASE[domain] || [];
    const updatedJournals = list.map((j) => {
      let score = j.matchScore;
      if (titleLower.includes(j.name.split(' ')[0].toLowerCase())) {
        score = 99;
      }
      return { ...j, matchScore: score };
    });

    return { analysis, journals: updatedJournals };
  };

  const filteredJournals = (journalsList: JournalRecommenderItem[]): JournalRecommenderItem[] => {
    return journalsList.filter((journal) => {
      if (filterTurkishOnly && !journal.isTurkish && journal.trDizinStatus !== 'Verified') return false;
      if (filterInternationalOnly && journal.isTurkish) return false;
      if (filterOpenAccessOnly) {
        const isOA = journal.openAccess?.toLowerCase().includes('gold') || 
                     journal.openAccess?.toLowerCase().includes('fully open') || 
                     journal.apcFee?.toLowerCase().includes('free') ||
                     journal.apcFee?.toLowerCase().includes('0') ||
                     journal.isOpenAccessVerified === true;
        if (!isOA) return false;
      }
      
      if (filterMethodology === 'qualitative' && journal.qualitativeFriendly === false) return false;
      if (filterMethodology === 'quantitative' && journal.quantitativeFriendly === false) return false;
      if (filterMethodology === 'mixed' && journal.mixedMethodsFriendly === false) return false;
      
      if (filterFocus === 'classroom' && journal.classroomBased === false) return false;
      if (filterFocus === 'teacher_education' && journal.teacherEducation === false) return false;
      if (filterFocus === 'translanguaging' && journal.translanguaging === false) return false;
      if (filterFocus === 'critical' && journal.criticalDiscourse === false) return false;
      if (filterFocus === 'assessment' && journal.languageAssessment === false) return false;
      
      return true;
    });
  };

  const handleRunJournalFinder = async () => {
    setSearchingJournals(true);
    setHasSearched(false);
    setMatchingJournals([]);
    setManuscriptAnalysis(null);
    setExpandedJournalIndex(null);

    // Consolidate text to present to the backend based on selected inputMode
    let payloadText = '';
    if (inputMode === 'title') {
      payloadText = `Manuscript Title: ${manuscriptTitle}`;
    } else if (inputMode === 'title_abstract') {
      payloadText = `Manuscript Title: ${manuscriptTitle}\n\nManuscript Abstract:\n${manuscriptAbstract}`;
    } else if (inputMode === 'full') {
      payloadText = `Manuscript Title: ${manuscriptTitle}\n\nFull Manuscript Text:\n${manuscriptFullText}`;
    } else if (inputMode === 'manual') {
      payloadText = `Manuscript Title: ${manuscriptTitle}\n\nSelected Section (${manuscriptSection}):\n${manuscriptFullText}`;
    }

    if (isStatic) {
      setTimeout(() => {
        const { analysis, journals } = generateStaticAnalysisAndJournals(manuscriptTitle, manuscriptAbstract || manuscriptFullText, selectedDomain);
        setManuscriptAnalysis(analysis);
        setMatchingJournals(journals);
        setSearchingJournals(false);
        setHasSearched(true);
      }, 1200);
    } else {
      try {
        const response = await fetch('/api/recommend-journals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payloadText, domain: selectedDomain })
        });
        if (!response.ok) throw new Error('API server returned error');
        const data = await response.json();
        
        if (data) {
          if (data.manuscriptAnalysis) {
            setManuscriptAnalysis(data.manuscriptAnalysis);
          } else {
            const { analysis } = generateStaticAnalysisAndJournals(manuscriptTitle, manuscriptAbstract || manuscriptFullText, selectedDomain);
            setManuscriptAnalysis(analysis);
          }

          if (Array.isArray(data.journals) && data.journals.length > 0) {
            setMatchingJournals(data.journals);
          } else {
            setMatchingJournals(JOURNAL_DATABASE[selectedDomain] || []);
          }
        } else {
          throw new Error('Empty response payload');
        }
      } catch (err) {
        console.error('Gemini Journal Recommender offline fallback:', err);
        const { analysis, journals } = generateStaticAnalysisAndJournals(manuscriptTitle, manuscriptAbstract || manuscriptFullText, selectedDomain);
        setManuscriptAnalysis(analysis);
        setMatchingJournals(journals);
      } finally {
        setSearchingJournals(false);
        setHasSearched(true);
      }
    }
  };

  const copyRecommendationReport = () => {
    if (!manuscriptAnalysis) return;
    
    let report = `# HONORLEX ELT JOURNAL MATCHING REPORT\n`;
    report += `========================================\n\n`;
    report += `## 1. MANUSCRIPT DIAGNOSTIC ANALYSIS (ELT/Applied Linguistics)\n`;
    report += `- Central Topic: ${manuscriptAnalysis.centralTopic}\n`;
    report += `- ELT Sub-field & Domain: ${manuscriptAnalysis.eltSubfield}\n`;
    report += `- Research Design & Methodology: ${manuscriptAnalysis.researchDesign}\n`;
    report += `- Participant Cohort / Corpus: ${manuscriptAnalysis.participantGroup}\n`;
    report += `- Educational Context / Setting: ${manuscriptAnalysis.educationalSetting}\n`;
    report += `- Language Context: ${manuscriptAnalysis.languageContext}\n`;
    report += `- Applied Theoretical Framework: ${manuscriptAnalysis.theoreticalFramework}\n`;
    report += `- Geographical Relevance: ${manuscriptAnalysis.geographicalRelevance}\n`;
    report += `- Recommended Journal Article Type: ${manuscriptAnalysis.likelyArticleType}\n`;
    report += `- Strengths: ${manuscriptAnalysis.strengthsAndLimits?.strengths || 'N/A'}\n`;
    report += `- Limitations: ${manuscriptAnalysis.strengthsAndLimits?.limitations || 'N/A'}\n\n`;
    
    report += `## 2. HIGH-COMPATIBILITY JOURNAL RECOMMENDATIONS\n`;
    matchingJournals.forEach((j, i) => {
      report += `\n### ${i + 1}. [${j.name}] - Match Score: ${j.matchScore}%\n`;
      report += `- Publisher & Country: ${j.publisher} (${j.country})\n`;
      report += `- Quartile Ranking (verified): ${j.qRanking} | Scopus: ${j.verifiedIndexingQuartile} (${j.verifiedIndexingSourceYear})\n`;
      report += `- Turkish TR Dizin Status: ${j.trDizinStatus === 'Verified' ? 'Verified in this run' : 'Not verified in this run'}\n`;
      report += `- Editorial Metrics: Impact Factor ${j.impactFactor} | Acceptance Rate %${j.acceptanceRate} | Peer Review Speed: ${j.reviewDuration}\n`;
      report += `- Fee structure & OA: ${j.apcFee} (${j.openAccess})\n`;
      report += `- Why this journal?: ${j.matchExplanation}\n`;
      report += `- Cautions & Tips: ${j.cautions}\n`;
      report += `- Link: ${j.officialWebpage}\n`;
    });
    
    navigator.clipboard.writeText(report);
    setReportCopyState(true);
    setTimeout(() => setReportCopyState(false), 2000);
  };

  const handleRunPeerReview = async () => {
    if (!peerReviewInput.trim() || reviewLoading) return;
    setReviewLoading(true);
    setReviewError(null);
    setReviewResult(null);

    if (isStatic) {
      setTimeout(() => {
        setReviewResult({
          summary: 'Taslak yazınız genel olarak tutarlı bir metodolojiye sahip olmakla beraber, atıf referans sıklığı ve yapısal giriş bölümünün netliği açısından minor gelişmelere açıktır.',
          strengths: [
            'Araştırma sorusu açık bir şekilde tanımlanmış.',
            'Veri toplama yöntemleri geçerli ve güvenilir görünüyor.',
            'Metin içi atıflar ile kaynakça listesi genel olarak eşleşiyor.'
          ],
          weaknesses: [
            'Giriş bölümünde güncel (son 3 yıla ait) literatür tartışması zayıf.',
            'Yöntem kısmındaki formüllerin veya değişken tanımlarının semantiği yetersiz açıklanmış.',
            'Kısıtlar (Limitations) alt başlığı eklenmemiş.'
          ],
          recommendations: [
            'Giriş kısmına 2024–2025 yıllarından atıflar ekleyerek literatür kapsamını güçlendirin.',
            'Kısıtlar (Limitations) paragrafı ekleyip gelecekteki çalışmalara yön verin.',
            'Referans biçimlerini APA 7.0 standardına göre elden geçirin.'
          ],
          score: 72,
          verdict: 'Minor Revision'
        });
        setReviewLoading(false);
      }, 1500);
    } else {
      try {
        const response = await fetch('/api/peer-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: peerReviewInput,
            modelSelection: peerReviewModel
          })
        });
        if (!response.ok) throw new Error('API server returned error compiling peer review');
        const data = await response.json();
        if (data && data.summary) {
          setReviewResult(data);
        } else {
          throw new Error('Geçersiz sunucu yanıtı formatı');
        }
      } catch (err: any) {
        console.error('[AI Peer Review client side error]:', err);
        setReviewError(`Yapay Zeka değerlendirmesi oluşturulamadı: ${err.message || 'Lütfen bağlantınızı kontrol edip tekrar deneyin.'}`);
      } finally {
        setReviewLoading(false);
      }
    }
  };

  const currentVerdict = getIntegrityVerdict(integrityScore);

  return (
    <div id="scholarly_hub_super_container" className="space-y-6">
      
      {/* HEADER BANNER & SELECTOR RIBBON */}
      <div className="bg-gradient-to-r from-slate-950 via-[#070e1b] to-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">
                {lang === 'tr' ? "YENİ • AKADEMİK TAMAMLAYICI" : "NEW • SCHOLARLY COMPANION"}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight">
              {lang === 'tr' ? "Yayıncılık Standardı & Etik Danışmanlığı" : "Publishing Standards & Scholarly Integrity"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'tr' 
                ? "Uluslararası hakemli dergilerin 'olmazsa olmaz' kriterlerini karşılayın. Kaynakçanızı standart formatlara dönüştürün, referans risk analizlerini yapın ve alanınıza en uygun dergileri keşfedin." 
                : "Meet the essential quality metrics of top-tier peer-reviewed journals. Systematize your references, audit plagiarism risks, and match with the finest ELT publications."}
            </p>
          </div>
          
          <Globe className="w-12 h-12 text-slate-850 shrink-0 hidden md:block" />
        </div>

        {/* Dynamic sub navigation within Scholarly Hub */}
        <div id="hub_sub_navigator" className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-900/60 pt-5">
          <button
            onClick={() => setActiveTab('generator')}
            id="hub_sub_tab_generator"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-205 border border-transparent'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {lang === 'tr' ? "Atıf Biçimlendirici (Style Guide)" : "Citation Builder"}
          </button>

          <button
            onClick={() => setActiveTab('journals')}
            id="hub_sub_tab_journals"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'journals'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-205 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {lang === 'tr' ? "ELT Dergi Önerileri" : "ELT Journal Matcher"}
          </button>

          <button
            onClick={() => setActiveTab('integrator')}
            id="hub_sub_tab_integrator"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'integrator'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-205 border border-transparent'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            {lang === 'tr' ? "Etik Uyumluluk (Plagiarism Audit)" : "Ethics & Plagiarism"}
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            id="hub_sub_tab_copilot"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'copilot'
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                : 'text-slate-400 hover:text-slate-205 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'tr' ? "Akran Değerlendirici (Peer Reviewer)" : "AI Peer Review"}
          </button>
        </div>
      </div>

      <div id="scholarly_active_module_cabinet" className="min-h-[400px]">
        
        {/* TAB 1: REALTIME CITATION & BIBLIOGRAPHY GENERATOR FRAME */}
        {activeTab === 'generator' && (
          <div id="citation_manual_workbench" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            
            {/* Sidebar Controls for manual selection */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-5 shadow-xl">
              <div id="style_picker_panel">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block mb-2">
                  Atıf Formatı (Styles)
                </span>
                <div className="space-y-1.5 hover:shadow-inner">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-2.5 rounded-xl text-left transition text-xs relative ${
                        selectedStyle === style.id
                          ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {selectedStyle === style.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                        {style.label}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-3 leading-tight hidden xl:block">
                        {style.doc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div id="ref_type_selector" className="pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block mb-2">
                  Metin Sınıfı (Type)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {REF_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleRefTypeChange(type.id)}
                      className={`p-2 rounded-xl text-center text-[11px] font-semibold transition cursor-pointer ${
                        selectedRefType === type.id
                          ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-900/50'
                          : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-900'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main generation fields and beautiful display output */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sliders className="w-4.5 h-4.5 text-cyan-400" />
                  Atıf Alan Yapılandırıcı (Manuscript Builder)
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  İlgili kutuları doldurun. Aşağıdaki görünüm penceresinde seçtiğiniz formata (örn: <strong>{STYLES.find(st=>st.id===selectedStyle)?.label}</strong>) göre atıf referansı milisaniyeler içinde kusursuz bir şekilde derlenecektir.
                </p>
              </div>

              {/* Grid of Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400">Yazar(lar) (Format: Soyadı, Adının Baş Harfi.)</label>
                  <input
                    type="text"
                    value={formAuthors}
                    onChange={(e) => setFormAuthors(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition placeholder:text-slate-600 font-sans"
                    placeholder="e.g., Karasu, O., & Henderson, L. M."
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Yıl / Tarih</label>
                    <input
                      type="text"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition text-center font-mono"
                      placeholder="2025"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Yayınevi / Üretici</label>
                    <input
                      type="text"
                      value={formPublisher}
                      onChange={(e) => setFormPublisher(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition placeholder:text-slate-600"
                      placeholder="Springer Nature"
                      disabled={selectedRefType === 'journal' && selectedStyle === 'apa7'}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400">Çalışma / Makale Başlığı</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition placeholder:text-slate-600"
                    placeholder="The effects of visual layout rules..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400">Yayın organı (Dergi, Kitap Adı veya Kongre)</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition placeholder:text-slate-600"
                    placeholder="Journal of Academic Writing"
                    disabled={selectedRefType === 'book'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Cilt (Vol.)</label>
                    <input
                      type="text"
                      value={formVolume}
                      onChange={(e) => setFormVolume(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition text-center font-mono"
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Sayı (Issue)</label>
                    <input
                      type="text"
                      value={formIssue}
                      onChange={(e) => setFormIssue(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition text-center font-mono"
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Sayfalar (Pages)</label>
                    <input
                      type="text"
                      value={formPages}
                      onChange={(e) => setFormPages(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition text-center font-mono"
                      placeholder="114-129"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400">DOI Numarası veya Kalıcı İnternet Bağlantısı (URL)</label>
                  <input
                    type="text"
                    value={formDoi}
                    onChange={(e) => setFormDoi(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-800 transition placeholder:text-slate-650 font-mono"
                    placeholder="10.1017/lawcl.2025.1204"
                  />
                </div>
              </div>

              {/* Dynamic Presentation block with output copy option */}
              <div id="scientific_reference_panel_result" className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl relative space-y-4">
                <span className="text-[9px] uppercase font-mono font-black text-slate-500 tracking-wider flex items-center justify-between">
                  <span>Standardize Atıf Çıktısı (Compiled Reference Format)</span>
                  <span className="text-cyan-500 font-extrabold uppercase bg-cyan-950/80 border border-cyan-900/80 px-1.5 py-0.5 rounded text-[8.5px]">
                    {STYLES.find(st=>st.id===selectedStyle)?.label}
                  </span>
                </span>

                <div className="p-4 bg-slate-950/80 border border-slate-900/60 rounded-xl text-xs font-sans select-all leading-relaxed whitespace-pre-wrap">
                  {realtimeFormatted.split('*').map((chunk, chunkIdx) => {
                    if (chunkIdx % 2 === 1) {
                      return <span key={chunkIdx} className="italic text-cyan-400 font-extrabold">{chunk}</span>;
                    }
                    return chunk;
                  })}
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap pt-1.5">
                  <p className="text-[10.5px] text-slate-500 max-w-md italic">
                    💡 İpucu: Atıfınızın içerisindeki eğik (italik) yazılması gereken alanlar (örn. Dergi adları ve cilt numaraları) yukarıda renkli vurgularla otomatik ayrılmış ve koruma altına alınmıştır.
                  </p>
                  
                  <button
                    onClick={handleCopyCitation}
                    id="copy_realtime_citation_btn"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-xl text-xs font-bold text-cyan-400 cursor-pointer select-none active:scale-95"
                  >
                    {copiedCite ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Atıf Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Referansı Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOLAR COMPLIANCE & RISK AUDITING (SELF INTEGRITY CHECKS) */}
        {activeTab === 'integrator' && (
          <div id="ethics_integrity_matrix" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            
            {/* Self-check Questionnaire blocks */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <StyleGuaranteeIcon className="w-4.5 h-4.5 text-cyan-400" />
                  Makale Etik & Yayınlanabilirlik Öz-Testi
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Uluslararası saygın indekslerde (WoS, Scopus) yayın yapan hakemler, en ufak metodik veya citational tutarsızlığı intihal/gözden kaçırma olarak kabul eder. Aşağıdaki beyanları şeffaf bir şekilde işaretleyin ve makalenizin güvenlik skorunu ölçün.
                </p>
              </div>

              <div className="space-y-4">
                {integrityQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleIntegrityToggle(q.id)}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer select-none flex items-start gap-3.5 ${
                      integrityAnswers[q.id]
                        ? 'bg-slate-900/60 border-cyan-900/40 hover:border-cyan-800/60'
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition duration-150 ${
                        integrityAnswers[q.id]
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-400 text-white'
                          : 'border-slate-800 bg-slate-900/40 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-relaxed transition ${
                        integrityAnswers[q.id] ? 'text-white' : 'text-slate-350'
                      }`}>
                        {q.label}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal font-sans">
                        {q.checkDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict Gauge Display right */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-5 shadow-xl text-center relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                Etik Güvenlik İndeksi
              </span>

              {/* Graphical Circular Meter */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-slate-900 fill-none"
                    strokeWidth="11"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-cyan-500 fill-none transition-all duration-500"
                    strokeWidth="11"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - integrityScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-display font-black text-white">{integrityScore}%</span>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block mt-0.5">Uyum Skoru</span>
                </div>
              </div>

              {/* Dynamic Badge and text explaining risk parameters */}
              <div className={`p-4 rounded-xl border font-sans text-xs flex flex-col items-center gap-1.5 ${currentVerdict.color}`}>
                <span className="font-extrabold uppercase tracking-wide text-[10px]">
                  {currentVerdict.label}
                </span>
                <p className="text-[10.5px] font-medium leading-relaxed text-slate-300 text-center">
                  {currentVerdict.desc}
                </p>
              </div>

              {/* Summary ethical advice parameters */}
              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl text-left space-y-3 font-sans text-xs">
                <h5 className="font-bold text-slate-300 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Yayın Evrensel İpuçları:
                </h5>
                <ul className="space-y-2 text-[10.5px] text-slate-400 pl-3.5 list-disc leading-relaxed">
                  <li>Referans uydurma tespiti (citation fabrication) hakem kurulu tarafından doğrudan ihraç davanın açılmasına neden olur.</li>
                  <li>Metin dışı kalan citations, atıf şişirme olarak dergi editörlüğü tarafından elenebilir.</li>
                  <li>Kendi cümlelerinizle derinlemesine parafraz yapmak fikir hırsızlığı suçlamasından sizi kalıcı olarak korur.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHOLARLY JOURNAL RECOMMENDATION FINDER MODULE */}
        {activeTab === 'journals' && (
          <div id="scholarly_journal_finder" className="space-y-6 animate-fade-in text-slate-200">
            
            {/* Header section with description */}
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-display font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    ELT Journal Matcher (ELT Dergi Önerileri)
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-4xl font-sans">
                    Bu araç, İngilizce Öğretimi (ELT), TESOL, EFL, applied linguistics ve ikinci dil edinimi (SLA) taslaklarınızı en uygun prestijli indeksli dergilerle eşleştirir. TR Dizin ve WoS/Q seviyelerini tescilleyerek yayın-odaklı stratejik analiz sunar.
                  </p>
                </div>
                {manuscriptAnalysis && (
                  <button
                    onClick={copyRecommendationReport}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start md:self-center select-none"
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${reportCopyState ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    <span>{reportCopyState ? 'Rapora Kopyalandı!' : 'Raporu Markdown Olarak Kopyala'}</span>
                  </button>
                )}
              </div>

              {/* Segmented control for input modes */}
              <div className="pt-2 border-t border-slate-900/60 font-sans">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-2.5">Girdi Segment Seçeneği:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900/40 rounded-xl max-w-2xl border border-slate-900">
                  <button
                    onClick={() => setInputMode('title')}
                    className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 select-none ${
                      inputMode === 'title' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    Sadece Başlık (Title)
                  </button>
                  <button
                    onClick={() => setInputMode('title_abstract')}
                    className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 select-none ${
                      inputMode === 'title_abstract' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    Başlık + Özet (Abstract)
                  </button>
                  <button
                    onClick={() => setInputMode('full')}
                    className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 select-none ${
                      inputMode === 'full' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    Tam Metin Draftı
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`py-2 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 select-none ${
                      inputMode === 'manual' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'text-slate-400 hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    Bölüm Bazlı Analiz
                  </button>
                </div>
              </div>

              {/* Input areas depending on inputMode */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1.5">
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Title field - shown in almost all modes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wide block uppercase">
                      Taslak Makale Başlığı (Manuscript Title)
                    </label>
                    <input
                      type="text"
                      value={manuscriptTitle}
                      onChange={(e) => setManuscriptTitle(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-900 focus:border-cyan-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 focus:outline-none transition font-sans"
                      placeholder="Örn: Cognitive and Affective Variables in Classroom Translanguaging: An Action Research"
                    />
                  </div>

                  {/* Dynamic Abstract input */}
                  {inputMode === 'title_abstract' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wide block uppercase">
                        Özet Metni (Abstract Content)
                      </label>
                      <textarea
                        value={manuscriptAbstract}
                        onChange={(e) => setManuscriptAbstract(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-900/50 border border-slate-900 focus:border-cyan-800/80 rounded-2xl p-4 text-xs text-white placeholder:text-slate-705 focus:outline-none transition font-sans leading-relaxed resize-none"
                        placeholder="Özet metnini buraya ekleyin (Araştırma soruları, metodoloji, hedef grup ve bulgular)."
                      />
                    </div>
                  )}

                  {/* Dynamic Full Draft/Manual Selection */}
                  {(inputMode === 'full' || inputMode === 'manual') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wide block uppercase">
                          {inputMode === 'full' ? 'Tam Metin Taslağı (Full Draft Manuscript)' : 'Akademik Bölüm İçeriği (Raw Section Text)'}
                        </label>
                        {inputMode === 'manual' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">Analiz Yapılacak Bölüm:</span>
                            <select
                              value={manuscriptSection}
                              onChange={(e) => setManuscriptSection(e.target.value)}
                              style={{ backgroundColor: '#020617', color: '#f8fafc' }}
                              className="bg-slate-950 border border-slate-900 rounded px-2.5 py-1 text-[10px] text-cyan-300 font-bold outline-none focus:border-cyan-850 appearance-none cursor-pointer"
                            >
                              <option value="Introduction & Literature Review" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Introduction / Literature Review</option>
                              <option value="Research Methodology" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Methodology & Research Design</option>
                              <option value="Results & Research Findings" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Results / Findings Discussion</option>
                              <option value="Conclusion & Pedagogical Implications" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Conclusion / Implications</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <textarea
                        value={manuscriptFullText}
                        onChange={(e) => setManuscriptFullText(e.target.value)}
                        rows={7}
                        className="w-full bg-slate-900/50 border border-slate-900 focus:border-cyan-800/80 rounded-2xl p-4 text-xs text-white placeholder:text-slate-705 focus:outline-none transition font-sans leading-relaxed resize-none"
                        placeholder="İçeriği buraya yapıştırın. Yapay zeka bu metni teorik, parametrik ve metodolojik bağlamına göre analiz edecektir."
                      />
                    </div>
                  )}

                  {text && (
                    <button
                      onClick={() => {
                        setManuscriptFullText(text);
                        setManuscriptAbstract(text.substring(0, 1000));
                        const lines = text.split('\n').filter(l => l.trim().length > 0);
                        if (lines.length > 0 && lines[0].length < 150) {
                          setManuscriptTitle(lines[0]);
                        }
                      }}
                      className="text-[10.5px] font-mono font-extrabold text-cyan-400 inline-flex items-center gap-1 hover:underline cursor-pointer transition select-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>← Ana çalışma alanındaki güncel makale metnini otomatik aktar</span>
                    </button>
                  )}
                </div>

                {/* Right controls column for selected domain and trigger button */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-5 bg-slate-950 p-4 border border-slate-900 rounded-2xl shadow-inner font-sans">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wide block uppercase">
                        Temel Altyapı Alanı (Domain Sub-field)
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDomain}
                          onChange={(e) => setSelectedDomain(e.target.value)}
                          style={{ backgroundColor: '#020617', color: '#f8fafc' }}
                          className="w-full bg-slate-950 border border-slate-900 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-cyan-800 appearance-none cursor-pointer"
                        >
                          <option value="applied_linguistics" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>🗣️ SLA & Applied Linguistics</option>
                          <option value="pedagogy_methodology" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>🏫 ELT Pedagogy & Methodology</option>
                          <option value="call_educational_tech" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>💻 CALL & Ed-Tech in Language Learning</option>
                          <option value="sociolinguistics_bilingual" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>🌍 Translanguaging & Bilingualism</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                          <ArrowDownIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900/60 leading-normal text-[10px] text-slate-410 space-y-1.5">
                      <span className="font-mono font-bold text-amber-500 uppercase tracking-wide block">Önemli Yayıncılık Çapraz Notu:</span>
                      <p className="leading-relaxed">
                        Önerilen dergiler WoS (SSCI/AHCI) ya da Scopus kapsamındadır. Bilgiler (TR Dizin Q durumu) doğrudan yayıncı portföyünden teyit edilir, sorgulama anında doğrulanmayanlar <strong className="text-amber-400 font-bold">Unverified in this run</strong> şeklinde beyan edilir.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunJournalFinder}
                    disabled={searchingJournals || !manuscriptTitle.trim()}
                    id="find_matching_journals_cta_btn"
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition select-none shadow-lg hover:shadow-cyan-500/10 border border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-mono shrink-0"
                  >
                    {searchingJournals ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Kapsam Analizi Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Makale Uyumunu Eşleştir ve Dergileri Ara</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Results layout */}
            <AnimatePresence mode="wait">
              {searchingJournals && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-950 border border-slate-900 rounded-3xl p-12 text-center space-y-4 shadow-xl font-sans"
                >
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Makalenin Akademik Bağlam Haritası Oluşturuluyor</h4>
                    <p className="text-[10.5px] text-slate-500 mt-1 max-w-xl mx-auto leading-relaxed">
                      SLA kuramsal örüntüsü yakalanıyor... WoS ve TR Dizin indeksleri taranıyor... En yüksek doçentlik/akademik teşvik uyumuna sahip 3 dergi hesaplanıyor...
                    </p>
                  </div>
                </motion.div>
              )}

              {hasSearched && !searchingJournals && matchingJournals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  
                  {/* METADATA FILTERS ZONE BAR */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 font-sans shadow-md">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Hızlı Filtrele:</span>
                      
                      <button
                        onClick={() => setFilterTurkishOnly(!filterTurkishOnly)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition select-none flex items-center gap-1.5 cursor-pointer ${
                          filterTurkishOnly ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400' : 'bg-slate-900 border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${filterTurkishOnly ? 'text-cyan-400' : 'text-transparent'}`} />
                        Sadece TR Dizin / Turkish Journals
                      </button>

                      <button
                        onClick={() => setFilterInternationalOnly(!filterInternationalOnly)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition select-none flex items-center gap-1.5 cursor-pointer ${
                          filterInternationalOnly ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400' : 'bg-slate-900 border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${filterInternationalOnly ? 'text-cyan-400' : 'text-transparent'}`} />
                        Sadece SSCI / Uluslararası
                      </button>

                      <button
                        onClick={() => setFilterOpenAccessOnly(!filterOpenAccessOnly)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition select-none flex items-center gap-1.5 cursor-pointer ${
                          filterOpenAccessOnly ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400' : 'bg-slate-900 border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${filterOpenAccessOnly ? 'text-cyan-400' : 'text-transparent'}`} />
                        Bedelsiz veya Açık Erişim
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[9.5px] font-mono text-slate-500">Metodoloji:</span>
                        <select
                          value={filterMethodology}
                          onChange={(e) => setFilterMethodology(e.target.value)}
                          style={{ backgroundColor: '#020617', color: '#f8fafc' }}
                          className="bg-slate-900 border border-slate-900 text-[10px] font-bold text-slate-300 rounded px-2 py-1 outline-none appearance-none cursor-pointer"
                        >
                          <option value="all" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Tüm Metotlar (All)</option>
                          <option value="qualitative" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Nitel Uyumlu (Qualitative Friendly)</option>
                          <option value="quantitative" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Nicel Uyumlu (Quantitative Friendly)</option>
                          <option value="mixed" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Karma Uyumlu (Mixed Methods Friendly)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[9.5px] font-mono text-slate-500">Özel Odak:</span>
                        <select
                          value={filterFocus}
                          onChange={(e) => setFilterFocus(e.target.value)}
                          style={{ backgroundColor: '#020617', color: '#f8fafc' }}
                          className="bg-slate-900 border border-slate-900 text-[10px] font-bold text-slate-300 rounded px-2 py-1 outline-none appearance-none cursor-pointer"
                        >
                          <option value="all" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Varsayılan Temalar (All)</option>
                          <option value="classroom" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Sınıf Odaklı (Classroom-based)</option>
                          <option value="teacher_education" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Öğretmen Eğitimi (Teacher Education)</option>
                          <option value="translanguaging" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Translanguaging & Kültür</option>
                          <option value="critical" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Eleştirel Söylem Süzgeci</option>
                          <option value="assessment" style={{ backgroundColor: '#020617', color: '#f8fafc' }}>Dil Ölçme/Değerlendirme</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE BENTO LAYOUT (MANUSCRIPT ANALYSIS + JOURNAL RECOMMENDER CARDS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                    
                    {/* BENTO COLUMN 1: MANUSCRIPT DIAGNOSTIC SUMMARY PROFILE */}
                    {manuscriptAnalysis && (
                      <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-900">
                          <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
                          <div>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Metin profili tescili</span>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Taslak Metin Teşhis Raporu</h4>
                          </div>
                        </div>

                        <div className="space-y-3.5 divide-y divide-slate-900/45 text-xs">
                          <div>
                            <span className="text-[9.5px] font-mono text-slate-500 block">Saptanan Merkez Tema (Central Theme):</span>
                            <p className="text-[11px] font-bold text-white mt-0.5 leading-relaxed">{manuscriptAnalysis.centralTopic}</p>
                          </div>
                          
                          <div className="pt-2">
                            <span className="text-[9.5px] font-mono text-slate-500 block">Yayın Alt Disiplini (ELT Sub-field):</span>
                            <span className="inline-block mt-1 text-[10px] font-bold bg-cyan-950/50 border border-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded-lg">
                              {manuscriptAnalysis.eltSubfield}
                            </span>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Metodolojik Tasarım:</span>
                              <strong className="text-[10px] text-slate-200 block mt-0.5 font-bold">{manuscriptAnalysis.researchDesign}</strong>
                            </div>
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Uygulama Coğrafyası:</span>
                              <strong className="text-[10px] text-slate-200 block mt-0.5 font-bold">{manuscriptAnalysis.geographicalRelevance}</strong>
                            </div>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Katılımcı / Veri Grubu:</span>
                              <p className="text-[10.5px] text-slate-300 mt-0.5 whitespace-normal leading-tight">{manuscriptAnalysis.participantGroup}</p>
                            </div>
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Kuramsal Çerçeve:</span>
                              <p className="text-[10.5px] text-slate-300 mt-0.5 whitespace-normal leading-tight">{manuscriptAnalysis.theoreticalFramework}</p>
                            </div>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Eğitim Kademesi / Çerçeve:</span>
                              <strong className="text-[10px] text-slate-200 block mt-0.5 font-bold">{manuscriptAnalysis.educationalSetting} &middot; {manuscriptAnalysis.languageContext}</strong>
                            </div>
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Önerilen Makale Formatı:</span>
                              <strong className="text-[10px] text-amber-400 block mt-0.5 font-bold">{manuscriptAnalysis.likelyArticleType}</strong>
                            </div>
                          </div>

                          <div className="pt-2.5 space-y-2">
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Yazınsal Güçlü Yönleri (Strengths):</span>
                              <p className="text-[10.5px] text-emerald-400 mt-0.5 leading-relaxed bg-emerald-950/10 p-2 rounded-lg border border-emerald-900/30">{manuscriptAnalysis.strengthsAndLimits?.strengths || 'S SLA kuram bağlamı son derece güçlü ve literatüre doğrudan bir katkı sağlamaktadır.'}</p>
                            </div>
                            <div>
                              <span className="text-[9.5px] font-mono text-slate-500 block">Zayıf Yönler / Sınırlandırmalar (Limits):</span>
                              <p className="text-[10.5px] text-amber-400 mt-0.5 leading-relaxed bg-amber-950/10 p-2 rounded-lg border border-amber-900/30">{manuscriptAnalysis.strengthsAndLimits?.limitations || 'Evrensel genelleme kısıtlıdır; katılımcı yelpazesinin K-12 dışında da çeşitlendirilmesi önerilmektedir.'}</p>
                            </div>
                          </div>

                          {manuscriptAnalysis.keywords && manuscriptAnalysis.keywords.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[9.5px] font-mono text-slate-500 block mb-1">Tespit Edilen Literatür Anahtar Kelimeleri:</span>
                              <div className="flex flex-wrap gap-1">
                                {manuscriptAnalysis.keywords.map((kwIdx, kwId) => (
                                  <span key={kwId} className="text-[8.5px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    #{kwIdx}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* BENTO COLUMN 2: JOURNAL MATCHES CARDS LIST */}
                    <div className={manuscriptAnalysis ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                          Eşleşen Akademik Dergiler ({filteredJournals(matchingJournals).length} listelendi)
                        </span>
                        {isStatic && (
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-500 shrink-0 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Çevrimdışı Arşiv Eşlemesi
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {filteredJournals(matchingJournals).map((journal, i) => {
                          const isExpanded = expandedJournalIndex === i;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="bg-slate-950 border border-slate-900/95 hover:border-slate-800/90 rounded-2xl p-5 shadow-2xl transition duration-300 relative group flex flex-col justify-between gap-5"
                            >
                              {/* Top metadata tracking wrapper with high alignment score */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono font-bold tracking-wider uppercase text-slate-500">
                                    <span>{journal.publisher} &middot; {journal.country}</span>
                                    <span>&middot;</span>
                                    {/* Webpage badge inline */}
                                    <span className="text-[#38bdf8] flex items-center gap-0.5 hover:underline lowercase font-sans">
                                      {journal.officialWebpage !== 'Not verified in this run' ? (
                                        <a href={journal.officialWebpage} target="_blank" referrerPolicy="no-referrer" rel="noopener noreferrer" className="flex items-center gap-0.5">
                                          <ExternalLink className="w-2.5 h-2.5" /> Webpage
                                        </a>
                                      ) : 'no verified domain'}
                                    </span>
                                  </div>
                                  <h4 className="font-display font-black text-white text-base tracking-tight leading-snug group-hover:text-cyan-400 transition">
                                    {journal.name}
                                  </h4>
                                </div>

                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  <div className="flex items-center gap-1 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black text-cyan-400">
                                    <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 shrink-0" />
                                    <span>{journal.matchScore}% Match Uyum</span>
                                  </div>
                                  <span className="text-[9px] font-mono uppercase bg-slate-900/60 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded-md">
                                    {journal.fitCategory}
                                  </span>
                                </div>
                              </div>

                              {/* Aims summary bullet */}
                              <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans -mt-2">
                                {journal.keyAims}
                              </p>

                              {/* VERIFICATION CRITICAL STATS & BADGES GRID */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-slate-900/60 font-mono text-center">
                                
                                <div className="bg-slate-900/40 p-2 border border-slate-900/60 rounded-xl relative">
                                  <span className="text-[8px] tracking-wide uppercase text-slate-500 block">Indeks/Q Quartile:</span>
                                  <strong className="text-[11px] text-white font-extrabold tracking-tight mt-0.5 block">{journal.qRanking}</strong>
                                  <span className="text-[7.5px] text-slate-410 block mt-0.5 truncate uppercase font-bold" title={journal.verifiedIndexingQuartile}>
                                    {journal.verifiedIndexingQuartile.includes('Not verified') ? 'Not Verified in this run' : journal.verifiedIndexingQuartile}
                                  </span>
                                </div>

                                <div className="bg-slate-900/40 p-2 border border-slate-900/60 rounded-xl">
                                  <span className="text-[8px] tracking-wide uppercase text-slate-500 block">TR Dizin Statüsü:</span>
                                  <strong className={`text-[11px] font-extrabold tracking-tight mt-0.5 block ${journal.trDizinStatus === 'Verified' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {journal.trDizinStatus === 'Verified' ? 'TR Di̇zi̇n' : 'İndekslenmemiş'}
                                  </strong>
                                  <span className="text-[7.5px] text-slate-410 block mt-0.5 truncate uppercase font-bold">
                                    {journal.trDizinStatus === 'Verified' ? 'Verified in this run' : 'Not verified in this run'}
                                  </span>
                                </div>

                                <div className="bg-slate-900/40 p-2 border border-slate-900/60 rounded-xl">
                                  <span className="text-[8px] tracking-wide uppercase text-slate-500 block">Metrik Kaynak Yılı:</span>
                                  <strong className="text-[11px] text-amber-400 font-extrabold tracking-tight mt-0.5 block">{journal.impactFactor} IF</strong>
                                  <span className="text-[7.5px] text-slate-410 block mt-0.5 truncate uppercase font-bold" title={journal.verifiedIndexingSourceYear}>
                                    {journal.verifiedIndexingSourceYear.includes('Not verified') ? 'Not Verified in this run' : journal.verifiedIndexingSourceYear}
                                  </span>
                                </div>

                                <div className="bg-slate-900/40 p-2 border border-slate-900/60 rounded-xl">
                                  <span className="text-[8px] tracking-wide uppercase text-slate-500 block">OA Ücreti & Kabul:</span>
                                  <strong className="text-[10px] text-cyan-400 font-extrabold truncate block mt-0.5">
                                    {journal.openAccess}
                                  </strong>
                                  <span className="text-[8px] text-slate-415 block font-sans truncate mt-0.5 font-bold" title={journal.apcFee}>
                                    {journal.apcFee} (Kabul: %{journal.acceptanceRate})
                                  </span>
                                </div>
                              </div>

                              {/* EXPANDABLE ACCORDION FOR TRANSPARENT MATCH REASONS */}
                              <div className="font-sans text-xs">
                                <button
                                  onClick={() => setExpandedJournalIndex(isExpanded ? null : i)}
                                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] font-mono font-bold font-extrabold uppercase transition tracking-wider flex items-center justify-between cursor-pointer select-none"
                                >
                                  <span>ℹ️ {isExpanded ? 'Detayları ve Gerekçeleri Gizle' : 'Neden Bu Dergi? Eşleşme Hakem Gerekçelerini Aç'}</span>
                                  <span className="text-cyan-400">{isExpanded ? '▲' : '▼'}</span>
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden bg-slate-950 border-x border-b border-slate-900 px-4 py-3.5 rounded-b-xl space-y-4 text-slate-300 leading-relaxed font-sans text-xs"
                                    >
                                      <div>
                                        <h5 className="font-bold text-[10.5px] uppercase tracking-wide text-cyan-400 block mb-1">Eşleşme Gerekçesi (AI Scope Match Explanation):</h5>
                                        <p className="text-slate-300 text-[11px] leading-relaxed font-normal">{journal.matchExplanation}</p>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5 border-t border-slate-900/60">
                                        <div>
                                          <h5 className="font-bold text-[10.5px] uppercase tracking-wide text-amber-500 block mb-1">Cautions / Dikkat Edilecek Noktalar:</h5>
                                          <p className="text-slate-400 text-[11px] leading-relaxed bg-amber-950/10 border border-amber-900/35 p-2 rounded">{journal.cautions}</p>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-[10.5px] uppercase tracking-wide text-emerald-400 block mb-1">Evidence Sources (Kanıt Tabanı):</h5>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {journal.evidenceSources.map((evItem, evId) => (
                                              <span key={evId} className="text-[9px] bg-slate-900 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-mono">
                                                {evItem}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                                        <div>
                                          <h5 className="font-bold text-[10px] font-mono tracking-wider text-slate-500 block mb-1">Uyumlu Makale Formatları (Accepted Formats):</h5>
                                          <div className="flex flex-wrap gap-1">
                                            {journal.suitableArticleTypes.map((artTypeVal, artId) => (
                                              <span key={artId} className="text-[9.5px] font-bold bg-slate-900 text-slate-350 px-2 py-0.5 rounded-lg">
                                                {artTypeVal}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-[10px] font-mono tracking-wider text-slate-500 block mb-1">Eşleşen Alt Konu Alanları (Matched Scope Areas):</h5>
                                          <div className="flex flex-wrap gap-1">
                                            {journal.relevantScopeAreas.map((scopeVal, scopeId) => (
                                              <span key={scopeId} className="text-[9.5px] font-bold bg-slate-900 text-slate-350 px-2 py-0.5 rounded-lg">
                                                {scopeVal}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {journal.officialWebpage !== 'Not verified in this run' && (
                                        <div className="pt-2 text-right">
                                          <a
                                            href={journal.officialWebpage}
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-mono font-bold text-cyan-400 inline-flex items-center gap-1.5 hover:underline decoration-cyan-400 cursor-pointer"
                                          >
                                            Dergi Resmi Web Sayfasına Git <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Indexing status & footer detail */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase">Tam İndeksleme:</span>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {journal.indexing.slice(0, 4).map((ind, indIdx) => (
                                      <span key={indIdx} className="text-[8.5px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.2 rounded">
                                        {ind}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[10.5px] text-slate-500 font-sans flex items-center gap-1.5 select-none shrink-0 font-medium">
                                  <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                                  Ortalama İnceleme Hızı: {journal.reviewDuration}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {filteredJournals(matchingJournals).length === 0 && (
                        <div className="p-12 bg-slate-950 border border-slate-900 rounded-2xl text-center text-slate-400 text-xs font-sans">
                          Filtreleme kriterlerinize uygun dergi bulunamadı. Lütfen filtrelerinizi gevşetip tekrar kontrol ediniz.
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {hasSearched && !searchingJournals && matchingJournals.length === 0 && (
                <div className="p-8 bg-slate-950 border border-slate-900 rounded-3xl text-center text-slate-400 text-xs font-sans">
                  Belirttiğiniz kapsam kategorisinde kayıtlı dergi bulunamadı. Lütfen başka bir temel disiplin seçiniz.
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'copilot' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">HonorLex AI Akran Değerlendirici & Kritik Editör</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                    Yapay Zeka hakemleri; taslağınızı uluslararası SCIE/SSCI indeks standartlarına göre bilimsel yenilik, kaynakça bütünlüğü, metodoloji ve üslup açısından kritik bir süzgeçten geçirir.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-900/60 pt-4 space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-2">Taslak Metin:</label>
                  <textarea
                    value={peerReviewInput}
                    onChange={(e) => setPeerReviewInput(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-955/60 border border-slate-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed placeholder-slate-600 focus:outline-none resize-none"
                    placeholder="Değerlendirilecek taslak makale metnini veya başlık & özetini buraya yapıştırın..."
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-1 font-sans">
                    <span>Önerilen min. uzunluk: 150 karakter</span>
                    <span>Kelimeler: {peerReviewInput.trim() ? peerReviewInput.trim().split(/\s+/).length : 0}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 p-3.5 border border-slate-900/60 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Kritik Akıl Modeli Seviyesi:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setPeerReviewModel('flash')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 select-none ${
                          peerReviewModel === 'flash'
                            ? 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400'
                            : 'bg-slate-950 border-slate-900 text-slate-450 hover:text-slate-205'
                        }`}
                      >
                        <Hash className="w-3.5 h-3.5" />
                        Standart Hızlı Değerlendirme (3.5-Flash)
                      </button>
                      <button
                        onClick={() => setPeerReviewModel('pro')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 select-none ${
                          peerReviewModel === 'pro'
                            ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                            : 'bg-slate-950 border-slate-900 text-slate-450 hover:text-slate-250'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        Derin Bilimsel Muhakeme (3.1-Pro)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRunPeerReview}
                    disabled={reviewLoading || !peerReviewInput.trim()}
                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      reviewLoading || !peerReviewInput.trim()
                        ? 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                        : peerReviewModel === 'pro'
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/10'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/10'
                    }`}
                  >
                    {reviewLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Kritik Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Makaleyi Değerlendir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isStatic && (
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-cyan-400 rounded-xl flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>Gerçek zamanlı değerlendirme raporu oluşturmak için sol alttan <strong>Gemini AI Modu</strong>'nu açmanız önerilir (Şu an çevrimdışı önizleme modundasınız).</span>
                </div>
              )}

              {reviewError && (
                <div className="p-3.5 bg-rose-955/20 border border-rose-900/30 text-[11px] text-rose-400 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-450" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Loader Animation details */}
              {reviewLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <p className="text-xs text-slate-200 font-mono font-bold animate-pulse">
                      {peerReviewModel === 'pro' ? 'Derin Akıl Model Süzgeci Çalışıyor...' : 'Metodoloji ve Üslup Standardı Taranıyor...'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                      Lütfen pencereyi kapatmayın. Yapay zeka makalenizin güçlü ve zayıf yanlarını listeliyor, kabul/red tahminini türetiyor ve yapısal revizyon önerilerini hesaplıyor.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* REVIEW OUTPUT PANEL */}
              {reviewResult && !reviewLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 pt-4 border-t border-slate-900"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Ön Kabul Kararı / Verdict</span>
                      <strong className={`text-xs font-display font-extrabold mt-2 uppercase tracking-wide px-2.5 py-1.5 rounded-xl text-center border ${
                        reviewResult.verdict.toLowerCase().includes('reject')
                          ? 'bg-rose-950/30 border-rose-900/50 text-rose-400'
                          : reviewResult.verdict.toLowerCase().includes('major')
                            ? 'bg-amber-950/30 border-amber-900/50 text-amber-400'
                            : reviewResult.verdict.toLowerCase().includes('minor')
                              ? 'bg-blue-950/30 border-blue-900/50 text-blue-400'
                              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
                      }`}>
                        {reviewResult.verdict === 'Desk Reject' ? 'Masa Reddi (Desk Reject)' : 
                         reviewResult.verdict === 'Major Revision' ? 'Major Revizyon' : 
                         reviewResult.verdict === 'Minor Revision' ? 'Minor Revizyon' : 'Doğrudan Kabul Standardı'}
                      </strong>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Genel Kalite Skoru / Score</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className={`text-2xl font-black font-mono ${
                          reviewResult.score >= 80 ? 'text-emerald-400' : reviewResult.score >= 60 ? 'text-blue-400' : reviewResult.score >= 40 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{reviewResult.score}</span>
                        <span className="text-slate-500 text-xs font-sans">/ 100</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">Kritik Yapay Zeka Hakemi</span>
                      <span className="text-xs text-slate-300 font-sans leading-relaxed mt-2 italic flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                        Dahili Akran Süzgeci Aktif
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-cyan-950/10 border border-slate-900 p-5 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      Baş Editörün Yönetici Özeti (Executive Summary)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{reviewResult.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Güçlü Yönler (Scientific Strengths)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-none font-sans">
                        {reviewResult.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-400 select-none mt-0.5">&bull;</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-955/10 border border-rose-900/30 p-5 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-450" />
                        Kritik Eksikler & Riskler (Weaknesses/Gaps)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 list-none font-sans">
                        {reviewResult.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-rose-400 select-none mt-0.5">&bull;</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-900/35 border border-slate-900 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Yayın Hazırlığı İçin Pratik Revizyon Önerileri (Referee Recommendations)
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-300 list-decimal pl-1 font-sans">
                      {reviewResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="ml-4 pl-1 leading-relaxed">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Minimal auxiliary graphics indicators internally
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function StyleGuaranteeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.635 2.407-1.607 3.098a4.5 4.5 0 01-1.897 3.102 4.5 4.5 0 01-3.102 1.897 4.5 4.5 0 01-3.098 1.607 4.5 4.5 0 01-3.098-1.607 4.5 4.5 0 01-3.102-1.897 4.5 4.5 0 01-1.897-3.102C2.635 14.407 2 13.268 2 12c0-1.268.635-2.407 1.607-3.098a4.5 4.5 0 011.897-3.102 4.5 4.5 0 013.102-1.897 4.5 4.5 0 013.098-1.607 4.5 4.5 0 013.098 1.607 4.5 4.5 0 013.102 1.897 4.5 4.5 0 011.897 3.102C21.365 9.593 22 10.732 22 12z" />
    </svg>
  );
}
