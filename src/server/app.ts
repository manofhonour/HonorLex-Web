import express from 'express';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

export const app = express();
app.use(express.json());

// Register API Routes
app.use('/api', router);

// Register Health Route directly
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: "HonorLex API",
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});
