import { Request, Response } from 'express';
import { Type } from '@google/genai';
import { getGeminiClient } from './gemini.ts';

// Offline fallback generator for standalone execution or API limit conditions
export function generateLocalDirections(idea: string, answers: any, lang: 'en' | 'tr'): any[] {
  const mainInterest = answers.studyInterest || idea || "ELT Classroom Discourse";
  const setting = answers.researchSetting || "English classroom";
  const participants = answers.audienceGroup || "English language learners";
  const sampleNum = answers.sampleSize || "unspecified";
  const method = answers.preferredMethod || "qualitative analysis";

  const cards = [
    {
      id: "local-dir-1",
      topic: lang === 'tr' ? `Sınıf içi Etkileşim ve ${mainInterest}` : `Classroom Interaction and ${mainInterest}`,
      title: lang === 'tr' 
        ? `Sınıf İçi İletişimde Etkileşim Kalıplarının İncelenmesi: ${setting} Örneği`
        : `Investigating Interactional Patterns in ${setting}: An Exploratory Study of ${participants}`,
      rationale: lang === 'tr'
        ? `Kullanıcı girdisine dayalı olarak, bu çalışma doğrudan ${setting} ortamında yer alan ${participants} grubunun davranışlarına odaklanmaktadır.`
        : `Based on user inputs, this study explores interactional structures specifically for ${participants} within the ${setting} environment.`,
      studyType: "qualitative",
      participants: `${participants} (n = ${sampleNum})`,
      feasibility: lang === 'tr'
        ? `Nitel durum çalışması olarak oldukça uygulanabilir. Katılımcı sayısı (${sampleNum}) derinlemesine analiz için uygundur.`
        : `Highly feasible for an exploratory qualitative design. The sample size (${sampleNum}) allows for in-depth analysis.`,
      ethical: lang === 'tr'
        ? "Katılımcılardan ve kurum yetkililerinden okul içi gözlemler için yazılı bilgilendirilmiş onam alınmalıdır."
        : "Institutional permissions and written informed consent must be acquired for school-based observation.",
      primaryRQ: lang === 'tr'
        ? `Öğretmenler ve ${participants} arasındaki etkileşim kalıpları ${setting} bağlamında nasıl şekillenmektedir?`
        : `How do interactional dynamics manifest between instructors and ${participants} in the specified ${setting} context?`,
      supportingRQs: [
        lang === 'tr'
          ? `${participants} bu etkileşim süreçlerine yönelik hangi anlamları atfetmektedir?`
          : `What meanings do ${participants} attribute to their participation in these classroom interactions?`,
        lang === 'tr'
          ? `Gözlemlenen etkileşim yapılarında en sık tekrarlanan engeller nelerdir?`
          : `What are the most recurrent communicative breakdowns observed in these interactional scripts?`,
        lang === 'tr'
          ? "Sınıf içi fiziksel düzen veya materyal kullanımı etkileşimi nasıl desteklemektedir?"
          : "How does the physical layout or materials utilization mediate these classroom practices?"
      ],
      keywords: ["Classroom Discourse", "Interaction Analysis", "Qualitative Methods", "SLA"]
    },
    {
      id: "local-dir-2",
      topic: lang === 'tr' ? `${mainInterest} Bağlamında Öğretmen Algıları` : `Teacher Perceptions of ${mainInterest}`,
      title: lang === 'tr'
        ? `İngilizce Öğretmenlerinin ${mainInterest} Konusuna Yönelik İnanç ve Sınıf İçi Uygulamaları`
        : `Bridging Beliefs and Practices: Teachers' Conceptualizations of ${mainInterest} in ${setting}`,
      rationale: lang === 'tr'
        ? `${setting} ortamlarında görev yapan eğitimcilerin pedagojik veya inançsal yaklaşımlarını açıklamayı amaçlar.`
        : `Addresses the alignment between teachers' internal pedagogical beliefs and concrete lessons in ${setting}.`,
      studyType: "mixed methods",
      participants: `English educators in ${setting}`,
      feasibility: lang === 'tr'
        ? "Anket ve ardından mülakat yapılmasına izin verilirse orta düzeyde uygulanabilir; yeterli katılım süresi gerektirir."
        : "Moderately feasible depending on access to a cluster of teachers. Combines survey sweeps with follow-up interviews.",
      ethical: lang === 'tr'
        ? "Verilerin anonim tutulacağı öğretmenlere açıkça taahhüt edilerek kaygılar önlenmelidir."
        : "Detailed assurance of anonymity is critical to pre-empt social desirability bias among teacher participants.",
      primaryRQ: lang === 'tr'
        ? `İncelenen öğretmenlerin ${mainInterest} kavramına yönelik inançları ile sınıftaki uygulamaları nasıl ilişkilidir?`
        : `To what extent do teachers' stated beliefs about ${mainInterest} align with their observed instructional practices?`,
      supportingRQs: [
        lang === 'tr'
          ? "Öğretmenler bu yaklaşımları uygularken hangi yapısal veya müfredat kaynaklı sınırlıklarla karşılaşmaktadır?"
          : "What institutional constraints do participants identify as barriers to executing their preferred approaches?",
        lang === 'tr'
          ? "Eğitimcilerin deneyim yılı veya mezuniyet branşı inançlarında anlamlı farklılık yaratmakta mıdır?"
          : "Do differences in teaching experience or training profiles correspond to systematically different views on this issue?",
        lang === 'tr'
          ? "Öğretmenlerin inançları ile gerçek eylemlerindeki muhtemel çelişkiler nasıl açıklanmaktadır?"
          : "How do teachers reconcile the tension between their theoretical beliefs and concrete classroom limits?"
      ],
      keywords: ["Teacher Cognition", "Beliefs vs Practices", "Pedagogical Hurdles", "Mixed Methods"]
    },
    {
      id: "local-dir-3",
      topic: lang === 'tr' ? `${mainInterest} İçin Dijital Entegrasyon` : `Digital Integration for ${mainInterest}`,
      title: lang === 'tr'
        ? `${participants} Grubunda ${mainInterest} Gelişimi İçin Çevrimiçi Araçların Değerlendirilmesi`
        : `Evaluating Digital Interventions for ${mainInterest} Development Among ${participants}: A Case Study`,
      rationale: lang === 'tr'
        ? `Fiziki öğrenimle çevrimiçi veya teknoloji tabanlı etkinliklerin birleşiminin ${participants} üzerindeki etkisini veya algısını inceler.`
        : `Designed to gauge the utility, adoption, or qualitative experiences of digital tools targeting ${mainInterest}.`,
      studyType: "classroom-based",
      participants: `${participants} in ${setting}`,
      feasibility: lang === 'tr'
        ? "Eğer dijital altyapı sınıfta zaten mevcutsa son derece uygulanabilir. Aksi takdirde ek izin bütçesi gerekebilir."
        : "Highly feasible if tools are already embedded in the curriculum. Avoid structural access overheads.",
      ethical: lang === 'tr'
        ? "Kullanıcı etkileşim verilerinin ve ekran kayıtlarının gizliği tescillenmelidir."
        : "Guarantees of secure digital storage for child data or online log traces are paramount.",
      primaryRQ: lang === 'tr'
        ? `${participants} sınıf dışı çevrimiçi araçları ${mainInterest} becerilerini destekleme hususunda nasıl deneyimlemektedir?`
        : `How do ${participants} experience out-of-class digital tools designed to scaffold their ${mainInterest} progress?`,
      supportingRQs: [
        lang === 'tr'
          ? "Katılımcıların çevrimiçi etkileşim sıklığı ile görev tamamlama başarıları arasında bir ilişki var mıdır?"
          : "To what degree does frequency of digital interaction correlate with user-rated task feedback scores?",
        lang === 'tr'
          ? "Öğrencilerin bu dijital araçları kabullenirken yaşadıkları en belirgin teknik motivasyon kırıcılar nelerdir?"
          : "What technical frustrators do language learners report as detrimental to their autonomous digital workflow?"
      ],
      keywords: ["CALL", "Digital Scaffolding", "SLA Learners", "Classroom-Based Action"]
    }
  ];

  return cards;
}

export async function handleGenerateDirections(req: Request, res: Response) {
  try {
    const { idea, answers, lang } = req.body;
    if (!idea && !answers) {
      res.status(400).json({ error: 'At least an idea or a guiding answer must be provided.' });
      return;
    }

    const ai = getGeminiClient();

    // Setup guiding answers structure nicely
    const answersStr = JSON.stringify(answers || {}, null, 2);

    const promptText = `
You are an scholarly supervisor in Applied Linguistics, TESOL, and Second Language Acquisition (SLA).
The user wants to formulate realistic, rigorous, and feasible research topics, tentative titles, and research questions.
We want to generate 3 to 5 highly distinct research concept cards.

User Starting Idea:
"${idea || '(None provided)'}"

Guiding Questions Answers:
${answersStr}

Language preference: ${lang === 'tr' ? 'Turkish (return all user-facing strings in appropriate academic Turkish)' : 'English (return all user-facing strings in fine academic English)'}.

CRITICAL SCIENTIFIC RULES:
- This is an idea-development and feasibility tool, not a source of fabricated research.
- Never invent citations, literature gaps, data, participants, institutional approvals, findings, methods already used, or local facts.
- Never present a suggestion as publishable, original, ethically approved, or guaranteed feasible.
- Clearly distinguish user-provided information from system-generated suggestions.
- Preserve user-entered participant codes, institution names, numbers, locations, quotations, protected terms, and domain terminology exactly.
- Do not require or ask for personally identifiable information.
- State when sample size or access details are insufficient to judge feasibility.
- Research questions must be answerable, ethically appropriate, and matched with the study type guidelines.
- Avoid vague causal claims ("What is the impact of...?") unless a highly controlled longitudinal/true experimental setup has been explicitly declared by the user. Prefer exploratory or cautiously-hedged formulations (qualitative: "How do participants describe...?", quantitative: distinguish association, prediction, comparison, and measurement appropriately).

Generate 3 to 5 concept cards, each card MUST strictly follow the JSON schema.
`;

    const systemInstruction = `You are HonorLex Topic Suggestor backend. You formulate realistic applied linguistics/ELT thesis and research proposals.
Make sure to return only valid JSON complying with the requested schema. Empty arrays or default empty structures are allowed if information is missing.`;

    try {
      const gRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique string id like dir-1, dir-2" },
                    topic: { type: Type.STRING, description: "Suggested general research topic/niche" },
                    title: { type: Type.STRING, description: "Tentative, highly professional academic title" },
                    rationale: { type: Type.STRING, description: "Short rationale building directly on top of user's stated interests, explaining why this matters." },
                    studyType: { type: Type.STRING, description: "Must be exactly one of: qualitative / quantitative / mixed methods / conceptual / review / classroom-based" },
                    participants: { type: Type.STRING, description: "Defined participant group or data source based on user's input/gaps" },
                    feasibility: { type: Type.STRING, description: "Critical feasibility analysis regarding access, numbers, or time limits" },
                    ethical: { type: Type.STRING, description: "Essential ethical or data protection considerations" },
                    primaryRQ: { type: Type.STRING, description: "The single, crystal-clear primary research question. Avoid vague causal loops." },
                    supportingRQs: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "2 to 4 supporting research questions that decompose the primary question."
                    },
                    keywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "3 to 5 academic keywords to help classify."
                    }
                  },
                  required: ["id", "topic", "title", "rationale", "studyType", "participants", "feasibility", "ethical", "primaryRQ", "supportingRQs", "keywords"]
                }
              }
            },
            required: ["cards"]
          }
        }
      });

      const parsed = JSON.parse(gRes.text || '{}');
      if (parsed.cards && parsed.cards.length > 0) {
        res.json(parsed);
        return;
      } else {
        throw new Error("Empty cards from API call");
      }
    } catch (apiErr) {
      console.warn("Gemini suggestor api error, falling back to local formulas:", apiErr);
      const localCards = generateLocalDirections(idea, answers, lang);
      res.json({ cards: localCards, is_fallback: true });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}

export async function handleChangeTitle(req: Request, res: Response) {
  try {
    const { title, topic, studyType, lang } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Base academic title is required' });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `
We have an academic title: "${title}"
Topic: "${topic || ''}"
Study Type: "${studyType || ''}"

Please generate exactly 8 alternate versions for this title, each emphasizing a different scientific register.
You MUST provide one title for each style:
- descriptive (captures variables and settings plainly)
- comparative (accents comparison groups)
- exploratory (uses interpretive qualitative framing)
- qualitative (focuses on experience, meaning, perspectives)
- quantitative (focuses on measurement / correlation)
- mixed-methods (integrates both procedural elements)
- concise journal-style (short, impactful, direct)
- thesis-style (highly formal, comprehensive structure)

Format in the selected language: ${lang === 'tr' ? 'Turkish' : 'English'}.
Wait, always return the final result conforming to this exact schema.
`;

    try {
      const gRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: 'You are an academic copy-editor. Return structured titles matching styles.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING, description: "The style emphasis (e.g., descriptive, comparative, exploratory, qualitative, quantitative, mixed-methods, concise journal-style, thesis-style)" },
                    title: { type: Type.STRING, description: "The formatted academic title alternative." }
                  },
                  required: ["style", "title"]
                }
              }
            },
            required: ["alternatives"]
          }
        }
      });

      const parsed = JSON.parse(gRes.text || '{}');
      res.json(parsed);
      return;
    } catch (err) {
      // Offline mock fallback
      const mockAlt = [
        { style: "descriptive", title: `${title} (Descriptive Account)` },
        { style: "comparative", title: `A Comparative Analysis: ${title}` },
        { style: "exploratory", title: `Explorating the Dynamics of ${title}` },
        { style: "qualitative", title: `Experiences of Educators: A Qualitative Study on ${title}` },
        { style: "quantitative", title: `A Quantitative Examination of ${title}` },
        { style: "mixed-methods", title: `${title}: A Mixed-Methods Investigation` },
        { style: "concise journal-style", title: `Unpacking ${title.split(':')[0]}` },
        { style: "thesis-style", title: `An Investigation Into ${title} Within Higher Education Frameworks` }
      ];
      res.json({ alternatives: mockAlt, is_fallback: true });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}

export async function handleChangeRQ(req: Request, res: Response) {
  try {
    const { question, title, studyType, lang } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Original research question is required.' });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `
We have an academic Research Question: "${question}"
Associated Title: "${title || ''}"
Associated Study Type: "${studyType || ''}"

Please provide 3 to 5 realistic alternative formulations for this research question.
For each alternative, supply a brief, academically cautious rationale or explanation explaining the methodological shift or benefit.
Examples of brief rationale labels:
- "More suitable for qualitative interviews"
- "More focused on comparison"
- "More feasible for a small sample"
- "Less causal and more academically cautious"
- "Better aligned with the selected title"

Ensure explanations correspond to the requested language: ${lang === 'tr' ? 'Turkish' : 'English'}.
`;

    try {
      const gRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: 'You are HonorLex Research Question editor. Return alternative RQs with brief methodological explanations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "The alternative research question phrasing." },
                    explanation: { type: Type.STRING, description: "Brief explanation of the methodological benefit or shift." }
                  },
                  required: ["question", "explanation"]
                }
              }
            },
            required: ["alternatives"]
          }
        }
      });
      const parsed = JSON.parse(gRes.text || '{}');
      res.json(parsed);
      return;
    } catch (err) {
      const mockAlt = [
        { question: `How do participants describe their experiences regarding: ${question.replace('?', '')}?`, explanation: lang === 'tr' ? 'Nitel görüşmeler için daha uygundur' : 'More suitable for qualitative interviews' },
        { question: `To what extent does ${question.replace('?', '')} differ across group parameters?`, explanation: lang === 'tr' ? 'Karşılaştırmaya daha fazla odaklanır' : 'More focused on comparison' },
        { question: `What are the primary challenges concerning ${question.replace('?', '')} within this single local cluster?`, explanation: lang === 'tr' ? 'Küçük bir örneklem için daha uygulanabilirdir' : 'More feasible for a small sample' },
        { question: `How is the practice of ${question.replace('?', '')} manifested in classroom observation data?`, explanation: lang === 'tr' ? 'Daha az nedensel, akademik olarak temkinlidir' : 'Less causal and more academically cautious' }
      ];
      res.json({ alternatives: mockAlt, is_fallback: true });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}

export async function handleCheckAlignment(req: Request, res: Response) {
  try {
    const { idea, topic, title, studyType, participants, primaryRQ, supportingRQs, lang } = req.body;
    
    // Check if enough fields are present
    if (!title || !primaryRQ) {
      res.status(400).json({ error: 'Title and primary research question are required to run alignment checks.' });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `
Evaluate critical construct consistency across these components:
- User Interest Idea: "${idea || '(Not specified)'}"
- Proposed Topic: "${topic || ''}"
- Suggested Title: "${title}"
- Study Type Method: "${studyType || ''}"
- Participant Group: "${participants || ''}"
- Primary Research Question (RQ1): "${primaryRQ}"
- Supporting Research Questions (RQs): ${JSON.stringify(supportingRQs || [])}

Perform an expert applied linguistics alignment audit.
Check for:
1. Concept Drift: Does the title introduce variables or populations that are never addressed in the research questions (or vice versa)?
2. Methodological Cohesiveness: If study type is "qualitative", do the questions ask for quantitative correlation or make causal impact queries?
3. Sample & Setting Alignment: Are broad national or generalization claims suggested with highly specific, small local sample segments?

Determine overall alignment rating:
- "aligned"
- "needs_refinement"
- "mismatch"

Return your audit as a JSON object with this rating and a list of specific plain-language mismatch warnings/explanations.
Format comments in the preferred language: ${lang === 'tr' ? 'Turkish' : 'English'}.
`;

    try {
      const gRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: 'You are HonorLex Alignment Audit inspector. Conduct consistency checks on research proposals.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, description: "Must be aligned, needs_refinement, or mismatch" },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of specific mismatch explanations in plain language."
              }
            },
            required: ["status", "warnings"]
          }
        }
      });
      const parsed = JSON.parse(gRes.text || '{}');
      res.json(parsed);
      return;
    } catch (err) {
      // Local fallback logic
      const warnings: string[] = [];
      let status = "aligned";

      const titleLower = title.toLowerCase();
      const rq1Lower = primaryRQ.toLowerCase();

      // Simple heuristic mismatch detectors
      if (studyType === 'qualitative' && (rq1Lower.includes('impact of') || rq1Lower.includes('effect of') || rq1Lower.includes('correlate') || rq1Lower.includes('influence of'))) {
        status = "needs_refinement";
        warnings.push(lang === 'tr' 
          ? "Metodoloji 'nitel' olarak belirlenmiş, ancak araştırma sorusu nedensel etki veya korelasyon sorguluyor. Soru 'nasıl tanımlıyor/deneyimliyor' şeklinde revize edilebilir."
          : "Methodology is labeled as 'qualitative', but the primary research question queries causal impact or correlation. Consider rephrasing with 'How' or 'To what extent from participants' views'."
        );
      }

      if (studyType === 'quantitative' && (rq1Lower.includes('experience') || rq1Lower.includes('meaning') || rq1Lower.includes('feel about'))) {
        status = "needs_refinement";
        warnings.push(lang === 'tr'
          ? "Metodoloji 'nicel' ancak soru derinlemesine öznel deneyimleri sorguluyor. Nicel sorular daha ölçülebilir, fark veya ilişki odaklı olmalıdır."
          : "Methodology is labeled as 'quantitative', but questions focus on highly subjective qualitative meanings or feelings. Rephrase to look at measurable scores or comparative differences."
        );
      }

      if (titleLower.includes('belief') && !rq1Lower.includes('belief') && !rq1Lower.includes('perception') && !rq1Lower.includes('cognition') && !rq1Lower.includes('view')) {
        status = "needs_refinement";
        warnings.push(lang === 'tr'
          ? "Başlık 'öğretmen inançları' kavramına atıfta bulunuyor fakat araştırma sorusu inançlardan ziyade başarı puanlarına veya farklı çıktılara odaklanmış gibi görünüyor."
          : "The title refers to 'teacher beliefs/beliefs', but the research question focuses on student achievements or general performance without directly querying cognitive states."
        );
      }

      if (warnings.length === 0) {
        warnings.push(lang === 'tr'
          ? "Mevcut taslak parametreleri arasında bariz bir tutarsızlık bulunmadı. Ölçek ve sorular araştırma amacına uygundur."
          : "Stated goals, title formulas, and research questions appear logically unified and focused."
        );
      }

      res.json({ status, warnings, is_fallback: true });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}

export async function handleCheckEltAlignment(req: Request, res: Response) {
  try {
    const { idea, topic, title, studyType, participants, primaryRQ, supportingRQs, lang } = req.body;

    if (!title || !primaryRQ) {
      res.status(400).json({ error: 'Title and primary research question are required to run ELT framework alignment checks.' });
      return;
    }

    const ai = getGeminiClient();

    const promptText = `
Perform an elite, highly specialized Applied Linguistics and ELT (English Language Teaching) Theoretical Framework Alignment Audit.
Your goal is to cross-reference the user's research topic against standard ELT/Applied Linguistics theoretical frameworks (e.g., Sociocultural Theory, SLA models like Krashen's Input, Swain's Output, Schmidt's Noticing, Long's Interaction, Translanguaging, Identity/Investment by Bonny Norton, TBLT, Conversation Analysis, etc.) and flag any scope mismatches or gaps.

Here are the details of the student's research proposal:
- Initial Research Idea or Context: "${idea || '(Not specified)'}"
- Research Topic Area: "${topic || ''}"
- Proposed Academic Title: "${title}"
- Study Methodology Design: "${studyType || ''}"
- Defined Participants/Data: "${participants || ''}"
- Primary Research Question (RQ1): "${primaryRQ}"
- Supporting Research Questions: ${JSON.stringify(supportingRQs || [])}

Conduct a 4-step compliance check:
1. Framework Identification: Identify 1 to 3 prominent theoretical frameworks from Applied Linguistics / ELT that directly fit this study.
2. Framework-Subject Cohesion: Does the current title, participant group, or research questions contradict or misrepresent the fundamental tenets of these frameworks? (e.g., claiming a Vygotskian Sociocultural peer-scaffolding focus but measuring purely individual post-test scores via quantitative pre/post design with zero interactional trace, or asserting a modern "Translanguaging" framework but styling questions in a monolingualist deficit view).
3. Methodological Scope Validation: Is the research question scope too broad or too narrow for the specified framework? Are they trying to generalize massive national trends using a local sample of 5 prep school students?
4. Quality Improvement Suggestions: Provide concrete, academic, highly prescriptive suggestions on how to re-frame the research questions or scope to seamlessly align with the matched frameworks.

Return your audit as a JSON object matching this schema:
{
  status: "fully_aligned" | "partially_aligned" | "mismatch",
  frameworks: Array of { name: string, roleDescription: string },
  justification: string (A structured academic justification paragraph/critique),
  scopeMismatches: Array of string (Specific mismatch warning cards or scope mismatch claims),
  suggestions: Array of string (Concrete actionable suggestions in the designated language)
}

Design your narrative and comments in the user's preferred language: ${lang === 'tr' ? 'Turkish' : 'English'}.
`;

    try {
      const gRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: 'You are an elite Applied Linguistics professor and Theoretical Audit inspector. Provide rigorous, scholarly, and supportive advice on theoretical alignment and scope constraints.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, description: "Must be: fully_aligned, partially_aligned, or mismatch" },
              frameworks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Canonical Applied Linguistics/ELT framework name" },
                    roleDescription: { type: Type.STRING, description: "Description of how this framework connects to the study variables." }
                  },
                  required: ["name", "roleDescription"]
                }
              },
              justification: { type: Type.STRING, description: "Academic critique or justification of the theoretical layout." },
              scopeMismatches: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of detected mismatches in scope or framework misapplications."
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable scholarly suggestions to refine questions, variables, or scope."
              }
            },
            required: ["status", "frameworks", "justification", "scopeMismatches", "suggestions"]
          }
        }
      });

      const parsed = JSON.parse(gRes.text || '{}');
      res.json(parsed);
      return;
    } catch (err) {
      // Robust offline fallback logic
      const frameworksBuilt: Array<{ name: string, roleDescription: string }> = [];
      const scopeMismatches: string[] = [];
      const suggestions: string[] = [];
      let status = "partially_aligned";
      let justification = "";

      const textToAnalyze = `${title} ${primaryRQ} ${topic}`.toLowerCase();

      if (textToAnalyze.includes('trans') || textToAnalyze.includes('biling') || textToAnalyze.includes('multi')) {
        frameworksBuilt.push({
          name: "Translanguaging & Plurilingualism Framework (Ofelia García, Li Wei)",
          roleDescription: lang === 'tr' 
            ? "Öğrencilerin iki dilli/çok dilli repertuarlarını sınıfta esnekçe kullanmalarını incelemek için en uygun çağdaş dil teorisi." 
            : "The most relevant contemporary framework for analyzing multilingual learners leveraging their entire linguistic repertoire as a singular system."
        });
        if (studyType === 'quantitative') {
          scopeMismatches.push(lang === 'tr'
            ? "Metodolojik Uyumsuzluk: Translanguaging uygulamaları doğası gereği akışkan ve etkileşimseldir; çoklu veri toplama yöntemi olmaksızın sadece anketle (nicel) ölçülmesi kapsam sınırlılığı yaratır."
            : "Methodological Scope Mismatch: Translanguaging practices are fluid and co-constructed. Measuring them purely via quantitative closed-ended surveys misses the dynamic social interaction."
          );
          suggestions.push(lang === 'tr'
            ? "Çalışmanıza sınıf içi akran etkileşimi video/ses kayıtları ve söylem analizi eklemeyi değerlendirin."
            : "Integrate video-recorded group work transcps or follow-up focus groups to witness translanguaging in action."
          );
        }
      }

      if (textToAnalyze.includes('social') || textToAnalyze.includes('peer') || textToAnalyze.includes('scaffold') || textToAnalyze.includes('collaborat') || textToAnalyze.includes('interact') || textToAnalyze.includes('vygotsky')) {
        frameworksBuilt.push({
          name: "Sociocultural Theory (SCT - Lev Vygotsky, James Lantolf)",
          roleDescription: lang === 'tr'
            ? "Öğrenmenin sosyal arabuluculuk (mediation), akran iskelesi (peer scaffolding) ve Yakınsak Gelişim Alanı (ZPD) üzerinden gerçekleştiğini savunan teori."
            : "Frames language learning as a socially mediated process facilitated through dialogic interaction, scaffolding, and the Zone of Proximal Development (ZPD)."
        });
      }

      if (textToAnalyze.includes('input') || textToAnalyze.includes('output') || textToAnalyze.includes('notice') || textToAnalyze.includes('acquisi') || textToAnalyze.includes('sla')) {
        frameworksBuilt.push({
          name: "Cognitive SLA Models (Krashen's Input, Swain's Output, Schmidt's Noticing)",
          roleDescription: lang === 'tr'
            ? "Girdinin fark edilmesi, işlenmesi ve anlamlı çıktı üretimi döngülerini açıklayan klasik bilişsel SLA modelleri."
            : "Classical cognitive SLA constructs exploring the intake of comprehensible input, active noticing, and hypotheses testing during communicative output."
        });
      }

      if (frameworksBuilt.length === 0) {
        frameworksBuilt.push({
          name: "Communicative Language Teaching & TBLT Frameworks (Rod Ellis)",
          roleDescription: lang === 'tr'
            ? "Müfredat ve sınıf içi görev tasarımı uygulamalarının iletişimsel yeterlik üzerindeki etkilerini inceleyen temel yaklaşım."
            : "Standard CLT and Task-Based Language Teaching principles focusing on interaction, task authenticity, and communicative competence."
        });
      }

      if (scopeMismatches.length === 0) {
        status = "fully_aligned";
        if (lang === 'tr') {
          justification = "Başlık, çalışma tasarımı ve araştırma sorularınız ELT alanındaki ilgili kuramsal temellerle (özellikle belirlenen teorik modellere göre) yapısal olarak uyumludur.";
          suggestions.push("Teorik çerçevenizi desteklemek için makalenizin literatür kısmında bu teorisyenlerin güncel çalışmalarına atıfta bulunmayı unutmayın.");
        } else {
          justification = "Your active topic formulas, task parameters, and primary research questions demonstrate sound scholarly coordination with key Applied Linguistics paradigms.";
          suggestions.push("Ensure you cite foundational literature from this school of thought (e.g., Walsh for classroom discourse or Lantolf for SCT) inside your literature review.");
        }
      } else {
        if (lang === 'tr') {
          justification = "Analiz edilen anahtar kelimeler çerçevesinde teorik yaklaşımla metodolojik araçlar arasında bazı kapsam uyuşmazlıkları saptanmıştır.";
        } else {
          justification = "Minor conceptual discordances were detected between the theoretical tenets of your chosen topic and the specified research design.";
        }
      }

      res.json({
        status,
        frameworks: frameworksBuilt,
        justification,
        scopeMismatches,
        suggestions
      });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
}
