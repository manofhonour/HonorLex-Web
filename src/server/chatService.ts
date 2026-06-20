import { Request, Response } from 'express';
import { getGeminiClient } from './gemini.ts';

export async function handleMultiTurnChat(req: Request, res: Response) {
  try {
    const { messages, roleSystemInstruction, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const ai = getGeminiClient();

    // Map the user/assistant chat history to standard user/model roles for the SDK
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Choose the selected model or default to gemini-3.5-flash
    const targetModel = model || 'gemini-3.5-flash';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction: roleSystemInstruction || 'You are an elite, highly helpful Applied Linguistics and academic writing assistant.'
      }
    });

    res.json({
      content: response.text || ''
    });
  } catch (err: any) {
    console.error('Gemini chatbot server error:', err);
    res.status(500).json({ error: err.message || 'Error occurred during generation.' });
  }
}
