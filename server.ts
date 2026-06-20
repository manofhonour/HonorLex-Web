import { app } from './src/server/app.js';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const startBackend = async () => {
  const isProd = process.env.NODE_ENV === 'production';
  const parentDir = path.resolve();

  if (isProd) {
    // Serve static client assets from /dist
    const distPath = path.join(parentDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Hook up Vite development middleware
    console.log('[Dev Mode] Configuring Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[HonorLex Server Code] Running at http://localhost:${port} | Env: ${process.env.NODE_ENV || 'development'}`);
  });
};

startBackend();
