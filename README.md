# 🛡️ PhishGuard AI — Phishing Email Detection System

A full-stack machine learning application that detects phishing emails in real-time using an ensemble of Scikit-learn models. Built with Flask + React, featuring a beautiful glassmorphism UI.

---

## 🏗️ Project Structure

```
phishing-detector/
├── backend/
│   ├── app.py            # Flask REST API
│   ├── model.py          # ML model (train + predict)
│   ├── features.py       # Feature extraction engine (28 features)
│   ├── dataset.py        # Synthetic dataset generator
│   ├── requirements.txt  # Python dependencies
│   ├── model.pkl         # Trained model (auto-generated)
│   └── metrics.json      # Model metrics (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root app + navigation
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Global styles + animations
│   │   ├── components/
│   │   │   ├── Background.jsx         # Animated mesh background
│   │   │   ├── ConfidenceRing.jsx     # SVG confidence ring
│   │   │   └── ResultCard.jsx         # Detection result display
│   │   ├── pages/
│   │   │   ├── EmailAnalyzer.jsx      # Main email analysis page
│   │   │   ├── BulkAnalyzer.jsx       # Bulk email scanning
│   │   │   ├── MetricsDashboard.jsx   # ML metrics & charts
│   │   │   └── HowItWorks.jsx         # Educational explainer
│   │   └── utils/
│   │       └── api.js                 # API helper functions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── vercel.json           # Vercel deployment config
└── README.md
```

---

## 🚀 Running Locally in VS Code (Step-by-Step)

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- VS Code with terminal

---

### Step 1 — Set up the Backend

Open a **new terminal** in VS Code (`Ctrl+`` `):

```bash
# Navigate to backend folder
cd phishing-detector/backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Train the model (first run only — takes ~30 seconds)
python model.py

# Start the Flask server
python app.py
```

✅ Backend runs at: `http://localhost:5000`

You should see:
```
🚀 Loading/training model...
✅ Model ready!
 * Running on http://0.0.0.0:5000
```

---

### Step 2 — Set up the Frontend

Open a **second terminal** in VS Code (`Ctrl+Shift+`` `):

```bash
# Navigate to frontend folder
cd phishing-detector/frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

✅ Frontend runs at: `http://localhost:3000`

The Vite dev server automatically proxies `/api/*` → `http://localhost:5000`

---

### Step 3 — Open in Browser

Go to: **http://localhost:3000**

---

## 🤖 ML Model Details

### Architecture: Ensemble (Soft Voting)
| Model | Weight | Description |
|-------|--------|-------------|
| Random Forest | 3× | 200 trees, depth 15, balanced weights |
| Gradient Boosting | 2× | 150 estimators, LR 0.08, subsample 0.85 |
| Logistic Regression | 1× | L2 regularization, balanced weights |

### 28 Extracted Features
**URL Features (9):** num_urls, has_suspicious_url, has_http_url, avg_url_length, max_url_dots, has_ip_url, has_brand_spoof_url, has_at_in_url, has_hex_encoded_url

**Keyword Features (3):** phishing_keyword_count, legit_keyword_count, keyword_ratio

**Urgency/Pressure (4):** exclamation_count, all_caps_words, has_deadline, threats_present

**Subject Features (3):** subject_has_urgency, subject_has_prize, subject_length

**Text/Body Features (4):** body_length, word_count, avg_word_length, text_entropy

**Info Request Features (5):** has_password_field, has_financial_info_request, has_personal_info_request, has_html_links, has_form

### Performance (on test set)
- **Accuracy:** 100% (synthetic dataset)
- **Cross-Validation:** 5-fold stratified
- **Training samples:** 1,600 | **Test samples:** 400

---

## 🌐 Features

| Feature | Description |
|---------|-------------|
| 🔍 Email Analyzer | Paste any email → instant ML verdict |
| 📮 Bulk Scanner | Analyze up to 50 emails at once |
| 📊 Metrics Dashboard | Radar chart, confusion matrix, feature importance |
| 🧠 How It Works | Full explainer of the ML pipeline |
| ⚡ Detection Signals | Human-readable explanation of each verdict |
| 📈 Risk Scoring | 0–100 risk score with 5 severity levels |
| 🕐 Scan History | Track your recent analyses |

---

## 🚢 Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
cd phishing-detector
vercel deploy
```

### Option 2: GitHub → Vercel
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`

> **Note:** For full backend deployment on Vercel, configure the Flask API as a serverless function. Alternatively, deploy the backend on Railway, Render, or Fly.io and set `VITE_API_URL` in Vercel env vars.

### Environment Variables (if backend on different server):
```
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🛑 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to backend` | Make sure Flask is running: `python app.py` |
| `pip install` errors | Use `pip install -r requirements.txt --break-system-packages` |
| `Model is loading` | Wait 30s for first-time model training |
| Port 5000 in use | `python app.py` → edit port in `app.py` line: `app.run(port=5001)` |
| Port 3000 in use | `npm run dev -- --port 3001` |
| CORS errors | Backend already has CORS enabled for all origins |

---

## 📚 Tech Stack

**Backend:** Python · Flask · Scikit-learn · Pandas · NumPy · Joblib

**Frontend:** React 18 · Vite · Tailwind CSS · Recharts · Lucide

**ML:** Random Forest · Gradient Boosting · Logistic Regression · Voting Ensemble

---

*Built for educational and defensive security purposes.*
