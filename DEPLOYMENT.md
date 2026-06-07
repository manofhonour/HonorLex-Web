# HonorLex — Deployment Guide

This document provides complete, step-by-step instructions to configure and deploy **HonorLex Professional** (Academic Writing Suite & Reference Fabrication Auditor) across various hosting infrastructures.

To safely operate, the application is divided into two distinct deployment strategies:
- **Option A (AI-Powered Full-Stack Deployment)**: Recommended for actual clinical, scholarly, or commercial use. Keeps your Google Gemini API key strictly private and secure on a backend server.
- **Option B (Static Frontend Landing & Demo)**: Recommended for GitHub Pages or static portfolios. Clearly labels AI features as simulated, bypasses server requests, and links back to your active Option A deployment.

---

## 🛠️ Key Environment Configuration

Copy the example climate to create your personal variables file:
```bash
cp .env.example .env
```
Ensure you have added your Google AI Studio key:
```env
# .env
GEMINI_API_KEY=AIzaSy...
```

*Note: Never upload `.env` or hardcode actual credentials into your public repository.*

---

## 🚀 Option A: Full-Stack AI-Powered Deployment (Recommended)

This mode runs the dual Express-Vite package, executing server-side API endpoints for Manuscript Polishing, Bibliographic Verification, and Lexical Synonym queries, keeping your Gemini credential entirely protected behind CORS gates.

### 📋 Prerequisites & Production Commands
- **Build Scripts**: `npm run build`
  *(Compiles the React frontend static artifacts into `dist/` and bundles `server.ts` into a fast, standalone file `dist/server.cjs` via esbuild.)*
- **Start Script**: `npm start`
  *(Runs the production server via Node.js on port `3000`.)*
- **Development Tooling**: `npm run dev`
  *(Runs hot-replacing local full-stack server using `tsx`.)*

---

### 🌟 1. Vercel Deployment

Vercel natively supports Express + Vite builds using our `vercel.json` routing configuration:

1. Connect your GitHub repository to Vercel.
2. Select **Vite** or **Other** as the Framework Preset.
3. Define the Environment Variable:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API credential)*
4. Keep the default Build and Output Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**. Vercel will bundle the server endpoints as serverless endpoints.

---

### 🎨 2. Render Deployment

Render runs a dedicated container instance.

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository or Paste your public URL.
3. Configure the Runtime environment:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Expand **Advanced Settings** and declare:
   - `GEMINI_API_KEY`: `your_actual_key`
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**.

---

### 🚄 3. Railway Deployment

Railway detects the `package.json` setup and deploys a lightweight virtual server inside seconds.

1. Click **New Project** in your Railway Dashboard.
2. Choose **Deploy from GitHub repo** and select your project.
3. Click **Add Variables** and configure:
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `NODE_ENV`: `production`
4. Railway will automatically build via `npm run build` and run standard startup instructions on port `3000`.

---

## 🌐 Option B: GitHub Pages Static Demo (Client-Only Preview)

If your target is a public demonstration on a static-only CDN like GitHub Pages, the application detects this environment (`window.location.hostname` includes `.github.io` or `.pages.dev`) and safely swaps to **Static offline preview**.

### 🧪 Features & Structural Rules in Static Demo Mode
- **Zero Server Overhead**: The frontend bypasses local fetches and returns high-fidelity simulated responses for demo prompts.
- **Safety**: No API keys are bundled or exposed. Real-time verification claims are substituted by clean warning indicators.
- **Interactivity**: Demonstrations like Watson & Crick, Book Review Trap, or Hallucinated Citations operate perfectly with pre-scripted datasets so examiners can still explore the logic!

### 🖱️ Manually Testing Demo States
Our header contains an interactive **"Demo Mode" Toggle**. Testers can hover over the badge and toggle between **Mock Demo** (simulated responses) and **Full-Stack** (live server requirements), enabling high-flexibility evaluation.

### 📦 Deploying to GitHub Pages
To compile static artifacts for GitHub Pages:

1. Build the frontend artifacts:
   ```bash
   npm run build
   ```
2. The static folder is `dist/`. Deploy the contents of this folder using your preferred GitHub Pages Action or push manually.
3. To configure the fallback link to your live full-stack instance, the code links directly to:
   `https://ais-pre-odzfkgjbbijylx4v566jwp-10706907376.europe-west1.run.app`
   *(You can modify the href attribute inside `src/App.tsx` if you relocate your live server to a custom Render or Railway address).*

---

## 🔒 Security Summary

1. **CORS Safe**: All Gemini API calls happen purely on the server. There is no `import.meta.env.VITE_GEMINI_API_KEY` or `VITE_` prefix, preventing the key from being bundled into client bundles.
2. **Zero In-App Prompts**: The frontend does not contain form fields asking students/users for Gemini keys.
3. **No Private Logs**: The activity history is recorded purely within client `localStorage`, guaranteeing zero cloud telemetry or GDPR leakage of unpublished papers.
