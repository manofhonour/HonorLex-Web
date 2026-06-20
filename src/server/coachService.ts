import { Request, Response } from 'express';
import { Type } from '@google/genai';
import { getGeminiClient } from './gemini.ts';
import { runLocalCoachScan, generateGenericCritique } from '../lib/coachUtils.ts';

export async function handleCoachReview(req: Request, res: Response) {
  try {
    const { text, focusArea } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Manuscript draft text is required and must be a string' });
    }

    const localPitfalls = runLocalCoachScan(text);

    // If Gemini service is offline or client can't be obtained, fallback safely
    let aiClient;
    try {
      aiClient = getGeminiClient();
    } catch (e) {
      console.log('Skipping Gemini call (missing key), serving high-fidelity local scan:');
      return res.json({
        originalText: text,
        pitfalls: localPitfalls,
        overallCritique: generateGenericCritique(text, localPitfalls.length),
        suggestionsList: [
          'Replace simplistic or formulaic transition words with varied, strong analytical connectives.',
          'Inject human-agent active reporting ("we investigated", "results suggest") to balance passive voice descriptions.',
          'Verify all collocations regarding uncountable research tasks to eliminate literal L1 structural translations.',
          'Avoid universal cliché hooks in research introductions to secure immediate editor engagement.'
        ],
        is_fallback: true
      });
    }

    const systemInstruction = `You are "HonorLex ELT Academic Writing Coach", an elite academic reviewer and discourse analyst specializing in English Language Teaching (ELT), TESOL, SLA, and Applied Linguistics publishing paradigms.
Your goal is to perform a rigorous linguistic critique of the user's prose to identify common ELT-specific writing pitfalls, L1-interference patterns, and rhetorical weaknesses.

Highlight and output pitfalls under these exact categories:
1. "transition" (Weak / overused linkers like "on the other hand", "firstly...", "furthermore", "besides")
2. "passive" (Overly passive reporting or passive voice chains that obscure human agency unnecessarily)
3. "l1_interference" (Literal translation collocations, typically from Turkish or similar languages, like "I did a research", "According to me", "under the light of")
4. "cliché" (Overused LLM or academic tropes like "plays a crucial role", "sheds light on", "in today's rapidly changing world", "valuable pedagogical tool")
5. "nominalization" (Extreme noun inflation, e.g. "made a comparison of" rather than "compared")
6. "style" (Unnecessary meta-language, wordy sentences, or unsupported dogmatism)

CRITICAL ANALYSIS RULES:
- Identify actual specific substrings from the user's input text in the "originalPhrasing" property. This substring MUST match their text EXACTLY so the frontend can find and highlight it.
- Map the character start position in the original text to "startIdx" if you can, or estimate it accurately.
- Provide a clear alternative "suggestion" that has a highly professional, native-scholar Applied Linguistics register.
- Write a clear "explanation" of WHY this is a pitfall in ELT/academic publishing.
- Return an "overallCritique" paragraph evaluating the manuscript's tone flow, grammatical hedging, and structural rhythm.
- Return a "suggestionsList" array (3-5 concrete high-level advices for the writer in general).

Ensure your JSON matches the required schema perfectly. Do not fabricate errors where none exist, but critically audit scholastic text with absolute rigor. If the text is flawless, return an empty pitfalls array but provide a highly supportive overall critique.`;

    const promptText = `
MANUSCRIPT DRAFT:
"""
${text}
"""

Focus Area requested: ${focusArea || 'all_pitfalls'}

Task: Analyze this draft in detail and output the resulting JSON containing pitfalls, overallCritique, and suggestionsList. Make sure all originalPhrasing strings exist exactly in the draft.`;

    const modelResponse = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pitfalls: {
              type: Type.ARRAY,
              description: 'Array of detected writing pitfalls, collocations, or excessive passives',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  startIdx: { type: Type.INTEGER },
                  originalPhrasing: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  typeLabel: { type: Type.STRING }
                },
                required: ['id', 'category', 'severity', 'originalPhrasing', 'suggestion', 'explanation', 'typeLabel']
              }
            },
            overallCritique: { type: Type.STRING },
            suggestionsList: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['pitfalls', 'overallCritique', 'suggestionsList']
        }
      }
    });

    const responseContent = modelResponse.text;
    if (!responseContent) {
      throw new Error('Empirical analyze yielded clear response but body was unreadable.');
    }

    const parsedData = JSON.parse(responseContent);
    // Ensure all start indexes are correct or calculated locally
    if (parsedData.pitfalls && Array.isArray(parsedData.pitfalls)) {
      parsedData.pitfalls.forEach((pitfall: any, idx: number) => {
        pitfall.id = pitfall.id || `ai-p-${idx + 1}`;
        if (pitfall.originalPhrasing && (pitfall.startIdx === undefined || pitfall.startIdx === null || pitfall.startIdx === -1)) {
          pitfall.startIdx = text.indexOf(pitfall.originalPhrasing);
        }
      });
    }

    return res.json(parsedData);

  } catch (err: any) {
    console.error('[Coach API Error]:', err);
    // If the call failed (e.g., API overload or parse error), return the robust local scan!
    const localFallbackText = req.body.text || '';
    const localPitfalls = runLocalCoachScan(localFallbackText);
    return res.json({
      originalText: localFallbackText,
      pitfalls: localPitfalls,
      overallCritique: generateGenericCritique(localFallbackText, localPitfalls.length),
      suggestionsList: [
        'Ensure you vary your cohesive transition markers to maintain publishing diversity.',
        'Adopt cautious hedging language to moderate claim assertiveness and respect social science methodologies.',
        'Examine and resolve potential L1 direct sentence translation errors or literal collocation pitfalls.',
        'Omit empty meta-language framing statements that bloat the document word counts.'
      ],
      is_fallback: true,
      error_info: err.message
    });
  }
}
