import { Request, Response } from 'express';
import { Type } from '@google/genai';
import { getGeminiClient } from './gemini';

/**
 * 1. Recommend Journals Endpoint
 * Uses gemini-3.5-flash to analyze text and recommend specific journals
 */
export async function handleRecommendJournals(req: Request, res: Response) {
  try {
    const { text, domain } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Manuscript title or abstract is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are "HonorLex ELT & SLA Publishing Consultant", an elite expert in scholarly index profiling, impact factor analytics, and scope alignment in the field of English Language Teaching (ELT), TESOL, and Applied Linguistics.
Your job is to read the provided academic abstract, title, or full manuscript, analyze its core properties, and recommend exactly 3 real, highly suitable, high-impact ELT or Applied Linguistics journals (such as TESOL Quarterly, Applied Linguistics, Language Learning, System, ELT Journal, Language Teaching Research, CALL, ReCALL, Journal of English for Academic Purposes, etc.) indexed in Web of Science (SSCI/AHCI) or Scopus.

Never promise publication, acceptance probability, or speed unless verified. If information cannot be verified, write "Not verified in this run" or "No current external verification was available for this journal in this run".

You must extract and return both a manuscriptAnalysis object and a journals array.

Ensure the "manuscriptAnalysis" contains:
1. centralTopic: Core subject of investigation
2. eltSubfield: Sub-area of ELT (e.g. SLA, Teacher Education, CALL, Translanguaging, Syllabus Design)
3. researchDesign: (e.g., qualitative, quantitative, mixed methods, conceptual, classroom-based, action research)
4. participantGroup: Details of students, teachers, or corpora studied
5. educationalSetting: (e.g. Higher Education, K-12, private language academy)
6. languageContext: (e.g. EFL, ESL, ESP, EAP, bilingual education)
7. theoreticalFramework: Dominant model or theory applied
8. keywords: Array of 3-5 standard keywords
9. geographicalRelevance: Where study took place or applies
10. likelyArticleType: (e.g. Original Empirical Article, Brief Report, Conceptual Paper, Review)
11. strengthsAndLimits: { strengths: string, limitations: string }

For each journal in the "journals" array, provide:
1. name: Exact real journal name
2. publisher: Verified publisher name, or "Not verified in this run" if unsure
3. country: Verified publication country, or "Not verified in this run"
4. trDizinStatus: Must be exactly "Verified", "Unverified", or "Not verified in this run" or "Not Indexed"
5. qRanking: Verified quartile (e.g. Q1, Q2, Q3, Q4) or "Quartile unavailable" or "Not verified in this run"
6. verifiedIndexingQuartile: string like "Scopus Q1 (2025)" or "Not verified in this run"
7. verifiedIndexingSourceYear: string like "SCImago / Scopus 2025" or "Not verified in this run"
8. metadataStatus: Must be one of "Verified metadata", "Unverified metadata", or "Journal scope match based on manuscript content"
9. matchScore: Integer 0-100 reflecting fit
10. fitCategory: "Strong match", "Possible match", or "Limited match"
11. relevantScopeAreas: Array of strings matching aspects of the scope
12. suitableArticleTypes: Array of strings of acceptable types
13. matchExplanation: Detailed explanation linking their research design and theme directly with the journal scope.
14. cautions: Any warnings about limitations, regional restrictions, or APC fees
15. officialWebpage: Verified web URL or "Not verified in this run"
16. evidenceSources: Array of sources used, or empty array if none

Generate and return the response strictly matching the required JSON schema structure. Make sure all recommended journals are genuine real publications specializing in language teaching, SLA, or applied linguistics.`;

    const promptText = `
ABSTRACT / TITLE TO ANALYZE:
"${text.trim()}"

TARGET ACADEMIC DOMAIN:
"${domain || 'applied_linguistics'}"

Task: Perform deep manuscript theme analysis and suggest 3 actual ELT/applied linguistics journals that align with this paper's methodology and topical scope.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            manuscriptAnalysis: {
              type: Type.OBJECT,
              properties: {
                centralTopic: { type: Type.STRING },
                eltSubfield: { type: Type.STRING },
                researchDesign: { type: Type.STRING },
                participantGroup: { type: Type.STRING },
                educationalSetting: { type: Type.STRING },
                languageContext: { type: Type.STRING },
                theoreticalFramework: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                geographicalRelevance: { type: Type.STRING },
                likelyArticleType: { type: Type.STRING },
                strengthsAndLimits: {
                  type: Type.OBJECT,
                  properties: {
                    strengths: { type: Type.STRING },
                    limitations: { type: Type.STRING }
                  },
                  required: ['strengths', 'limitations']
                }
              },
              required: [
                'centralTopic', 'eltSubfield', 'researchDesign', 'participantGroup',
                'educationalSetting', 'languageContext', 'theoreticalFramework', 'keywords',
                'geographicalRelevance', 'likelyArticleType', 'strengthsAndLimits'
              ]
            },
            journals: {
              type: Type.ARRAY,
              description: 'Exactly 3 real academic journal matches matching the scope and abstract.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  publisher: { type: Type.STRING },
                  country: { type: Type.STRING },
                  trDizinStatus: { type: Type.STRING },
                  qRanking: { type: Type.STRING },
                  verifiedIndexingQuartile: { type: Type.STRING },
                  verifiedIndexingSourceYear: { type: Type.STRING },
                  metadataStatus: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  fitCategory: { type: Type.STRING },
                  relevantScopeAreas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  suitableArticleTypes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  matchExplanation: { type: Type.STRING },
                  cautions: { type: Type.STRING },
                  officialWebpage: { type: Type.STRING },
                  evidenceSources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  impactFactor: { type: Type.NUMBER },
                  acceptanceRate: { type: Type.INTEGER },
                  reviewDuration: { type: Type.STRING },
                  openAccess: { type: Type.STRING },
                  apcFee: { type: Type.STRING },
                  indexing: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: [
                  'name', 'publisher', 'country', 'trDizinStatus', 'qRanking',
                  'verifiedIndexingQuartile', 'verifiedIndexingSourceYear', 'metadataStatus',
                  'matchScore', 'fitCategory', 'relevantScopeAreas', 'suitableArticleTypes',
                  'matchExplanation', 'cautions', 'officialWebpage', 'evidenceSources',
                  'impactFactor', 'acceptanceRate', 'reviewDuration', 'openAccess', 'apcFee', 'indexing'
                ]
              }
            }
          },
          required: ['manuscriptAnalysis', 'journals']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (err: any) {
    console.error('[Recommend Journals Error]:', err);
    return res.status(500).json({ error: err.message || 'An error occurred during journal recommendation processing' });
  }
}

/**
 * 2. Peer Review / Editorial Critic Endpoint
 * Uses gemini-3.1-pro-preview for advanced analytical peer-review, with gemini-3.5-flash fallback if requested.
 */
export async function handlePeerReview(req: Request, res: Response) {
  try {
    const { text, modelSelection } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Manuscript text or draft is required' });
    }

    // Determine target model
    const requestedModel = modelSelection === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';
    console.log(`[Peer Review] Analyzing manuscript using model: ${requestedModel}`);

    const ai = getGeminiClient();
    const systemInstruction = `You are "HonorLex Principal Peer Reviewer", a highly critical senior academic referee and journal editor.
Your task is to conduct a constructive, rigorous peer-review evaluation of the user's writing or draft paper.

Generate a comprehensive review report containing:
1. Executive Summary: Primary assessment of the research's value and purpose.
2. Conceptual Strengths: Bulleted list of methodological, stylistic, or thematic strong points.
3. Critical Weaknesses: Bulleted list of structural, logic, citation, or methodological gaps.
4. Specific Recommendations: Practical, step-by-step suggestions to improve readability, logical flow, or reference veracity.
5. Overall Quality Score: An integer from 0 to 100 representing readiness for high-tier academic review.
6. Acceptance Verdict: One of: "Desk Reject" (needs massive revision), "Major Revision" (contains potential, needs critical fixes), "Minor Revision" (very solid, minor polishing), or "Ready for Submission".

Format your review response strictly as a structured JSON object according to the requested schema. Ensure tone remains formal, professional, direct, and constructive.`;

    const promptText = `
MANUSCRIPT DRAFT:
"""
${text.trim()}
"""

Task: Perform a deep, elite peer review and structural auditing. Return the structured report.`;

    const response = await ai.models.generateContent({
      model: requestedModel,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'An elegant primary abstract of the review evaluation.' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 key scientific or linguistic strengths found in the paper.'
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 logical, style, citation, or methodology flaws to address.'
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Practical, technical editing strategies to optimize or overhaul the draft.'
            },
            score: { type: Type.INTEGER, description: 'Overall academic scoring between 0 and 100.' },
            verdict: { type: Type.STRING, description: 'Must be: Desk Reject, Major Revision, Minor Revision, or Ready for Submission' }
          },
          required: ['summary', 'strengths', 'weaknesses', 'recommendations', 'score', 'verdict']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (err: any) {
    console.error('[Peer Review Error]:', err);
    return res.status(500).json({ error: err.message || 'An error occurred during critical peer-review evaluation' });
  }
}

/**
 * 3. AI Citation Auto-Formatter Endpoint
 * Uses gemini-3.5-flash to format irregular / messy user citation strings
 */
export async function handleFormatCitationAI(req: Request, res: Response) {
  try {
    const { citation, targetStyle } = req.body;
    if (!citation || typeof citation !== 'string' || !citation.trim()) {
      return res.status(400).json({ error: 'Raw citation string is required' });
    }

    const cleanStyle = (targetStyle || 'apa').toLowerCase();
    console.log(`[AI Citation Formatter] Re-structuring citation to style: ${cleanStyle}`);

    const ai = getGeminiClient();
    const systemInstruction = `You are "HonorLex Citation Engine", an expert in bibliographic metadata schemas.
Your task is to parse the messy, irregular, or poorly formatted academic citation entered by the user, extract its pure logical components, and reassemble them into flawless standard bibliographic formats.

Styles:
- "apa" -> APA 7th Edition style (American Psychological Association)
- "mla" -> MLA 9th Edition style (Modern Language Association)
- "chicago" -> Chicago Manual of Style 17th Edition (Author-Date / Bibliography)

Your output must consist of:
1. The cleanly formatted reference text itself. IMPORTANT: Use standard markdown asterisks (*) for any italic fields (e.g. *Nature Journal*, or *vol. 15*).
2. The extracted metadata fields (authors, year, title, journal, volume, issue, pages, doi) so they can be parsed by the client. Always attempt to fill as many fields as possible. If missing or unresolved, define as empty string "".

Return the response strictly matching the required JSON schema.`;

    const promptText = `
RAW CITATION INPUT:
"${citation.trim()}"

TARGET STYLE INSTRUCTION:
"${cleanStyle}"

Task: Parse and auto-format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formatted: { type: Type.STRING, description: 'Perfect formatted citation string string with markdown italics (*).' },
            parsed: {
              type: Type.OBJECT,
              properties: {
                authors: { type: Type.STRING },
                year: { type: Type.STRING },
                title: { type: Type.STRING },
                journal: { type: Type.STRING, description: 'Journal name or publishing venue.' },
                volume: { type: Type.STRING },
                issue: { type: Type.STRING },
                pages: { type: Type.STRING },
                doi: { type: Type.STRING }
              },
              required: ['authors', 'year', 'title', 'journal', 'volume', 'issue', 'pages', 'doi']
            }
          },
          required: ['formatted', 'parsed']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (err: any) {
    console.error('[AI Citation Formatter Error]:', err);
    return res.status(500).json({ error: err.message || 'An error occurred during AI citation formatting' });
  }
}
