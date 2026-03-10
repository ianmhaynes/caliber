# Calibre — Watch Movement Identifier

AI-powered watch movement identification. Upload a photo or describe what you see, get expert horological analysis.

## Deploy to Vercel (5 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Get an Anthropic API key
Go to https://console.anthropic.com → API Keys → Create Key

### 3. Deploy
```bash
cd calibre
npm install
vercel
```

Follow the prompts (defaults are fine). When asked about settings, just press Enter.

### 4. Add your API key
After deploy, go to your Vercel dashboard:
- Open your project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = your key
- Redeploy: `vercel --prod`

Your site is live! 🎉

---

## Local development
```bash
npm install -g vercel
npm install
ANTHROPIC_API_KEY=your_key_here vercel dev
```

Open http://localhost:3000

## Project structure
```
calibre/
├── api/
│   └── identify.js      # Serverless function — calls Anthropic API
├── public/
│   └── index.html       # Frontend
├── package.json
├── vercel.json
└── README.md
```

## How it works
1. User uploads a movement photo (or types a description)
2. Frontend sends the image as base64 to `/api/identify`
3. The serverless function calls Claude with expert horologist system prompt
4. Claude returns structured JSON with movement name, specs, and analysis
5. Frontend renders the beautiful result card
