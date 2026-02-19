# 🔥 DSA Tracker — Personal 5-Month Study Tracker

A beautiful, personal DSA tracker built with React. Track your progress through 400+ LeetCode problems organized by topic across 5 months.

## Features
- ✅ Check off problems as you solve them (saved to localStorage)
- 📝 Per-day notes with auto-save
- 📊 Stats page with difficulty breakdown & progress rings
- 🗓️ Day heatmap showing completion at a glance
- 🔗 Direct links to every LeetCode problem
- 📱 Fully responsive

---

## 🚀 Setup (Local — VS Code)

### Step 1: Prerequisites
Make sure you have installed:
- **Node.js** (v16+): https://nodejs.org/
- **npm** (comes with Node.js)
- **VS Code**: https://code.visualstudio.com/

### Step 2: Open in VS Code
1. Copy the `dsa-tracker` folder to your D drive
2. Open VS Code
3. File → Open Folder → Select `D:\dsa-tracker`

### Step 3: Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + backtick`) and run:

```bash
npm install
```

Wait for it to complete (~1-2 minutes first time).

### Step 4: Start the App
```bash
npm start
```

The app will open at **http://localhost:3000** in your browser.

---

## 🌐 Deploy to Vercel (Free Hosting)

### Option A: Via GitHub (Recommended)

1. **Create a GitHub account** at https://github.com if you don't have one

2. **Create a new repository** on GitHub named `dsa-tracker`

3. **Push your code** — in VS Code terminal:
```bash
git init
git add .
git commit -m "Initial commit: DSA Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dsa-tracker.git
git push -u origin main
```

4. **Deploy on Vercel**:
   - Go to https://vercel.com and sign up (use your GitHub)
   - Click **"New Project"**
   - Import your `dsa-tracker` repository
   - Leave all settings as default (it auto-detects React)
   - Click **"Deploy"**
   - Done! You'll get a URL like `https://dsa-tracker-xyz.vercel.app`

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. Your site will be live in ~1 minute!

---

## 📁 Project Structure

```
dsa-tracker/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   └── problems.js      ← All 400+ problems organized by day
│   ├── pages/
│   │   ├── Dashboard.jsx    ← Home page with heatmap
│   │   ├── PlanView.jsx     ← Full plan with all months/weeks/days
│   │   ├── DayView.jsx      ← Individual day with problems & notes
│   │   └── StatsPage.jsx    ← Analytics & stats
│   ├── App.jsx              ← Main app with routing
│   ├── App.css              ← All styles
│   └── index.js
├── package.json
└── vercel.json
```

---

## 💾 Data Storage

Your progress is saved in **localStorage** — it persists across browser sessions on the same device/browser. 

If you want to sync across devices, just re-deploy whenever you want (your progress is local per device).

---

## 🛠️ Customizing

To add more problems or weeks, edit `src/data/problems.js`:
- Each `day` has a `problems` array
- Add `{ id: LEETCODE_ID, title: "Problem Title", difficulty: "Easy|Medium|Hard", url: "https://..." }`

---

## 🔧 Troubleshooting

**`npm install` fails:**
- Make sure Node.js is installed: `node --version`
- Try: `npm install --legacy-peer-deps`

**Port 3000 already in use:**
- Run: `npm start` and press `Y` when asked to use a different port

**White screen on Vercel:**
- Check the `vercel.json` file exists in root
- Check build logs in Vercel dashboard

---

**Happy Grinding! 💪🔥**
