# AI-Based Early Disease Detection System

An end-to-end demo project that:
- preprocesses symptom + basic vitals data
- trains a machine learning model to predict a likely disease label
- evaluates accuracy/F1/confusion matrix
- serves a Next.js web app with an interactive prediction page

## Project structure

```
.
├─ ml/                         # Python FastAPI ML service (port 8000)
│  ├─ service/api.py           # predict, metrics endpoints
│  ├─ src/                     # config, train, predict, data_generate
│  ├─ models/                  # disease_model.joblib
│  └─ requirements.txt
├─ backend/                    # Node Express API (port 3001)
│  └─ src/                     # proxies /api/* to ML service
├─ b_JeBBXorGsVT-1773827865918/  # Next.js app (port 3000) — rename to frontend if desired
│  ├─ app/predict/page.tsx     # prediction UI
│  └─ package.json
└─ README.md
```

## How to run the whole stack

Open **3 terminals** and run each command in order.

### Terminal 1 — ML service (Python, port 8000)

```powershell
cd ml
.\.venv\Scripts\Activate.ps1
uvicorn service.api:create_app --factory --host 127.0.0.1 --port 8000
```

*(If you don’t have a trained model yet, run `python -m src.data_generate --out data/raw/patients_demo.csv --n 3000 --seed 42` and `python -m src.train --data data/raw/patients_demo.csv --out models/disease_model.joblib` first.)*

### Terminal 2 — Backend (Node, port 3001)

```powershell
cd backend
npm install
npm start
```

### Terminal 3 — Frontend (Next.js, port 3000)

```powershell
cd b_JeBBXorGsVT-1773827865918
npm install
npm run dev
```

*(You can rename this folder to `frontend` if you prefer.)*

Then open **http://localhost:3000** in your browser. Use the **Predict** page to enter vitals and symptoms and get disease predictions.

## Ports

| Service  | Port | URL                    |
|----------|------|------------------------|
| Frontend | 3000 | http://localhost:3000  |
| Backend  | 3001 | http://localhost:3001  |
| ML API   | 8000 | http://localhost:8000  |

The frontend proxies `/api/*` to the backend; the backend proxies to the ML service.
Video Link- https://drive.google.com/file/d/13ST_H0VEVI7HuLkjJTRRkBvT8jhPtAFl/view?usp=sharing
## Notes / disclaimer

This is a **demo** ML system for coursework/prototyping. It is **not** medical advice and must not be used for real clinical decisions without clinical validation, governance, and regulatory approval.
