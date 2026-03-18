from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import sys

# Ensure `ml/` is on sys.path so `src.*` imports work when running from repo root.
_ML_DIR = Path(__file__).resolve().parents[1]
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

from src.config import ALL_FEATURES, SYMPTOMS  # noqa: E402
from src.predict import normalize_inputs  # noqa: E402

from .model_loader import load_artifacts


class PredictRequest(BaseModel):
    record: dict[str, Any] = Field(..., description="Single patient record with features/symptoms.")
    top_k: int = Field(5, ge=1, le=20)


class PredictResponse(BaseModel):
    top_predictions: list[dict[str, Any]]


def _to_feature_frame(record: dict[str, Any]) -> pd.DataFrame:
    norm = normalize_inputs(record)
    df = pd.DataFrame([norm])
    for f in ALL_FEATURES:
        if f not in df.columns:
            df[f] = None
    return df[ALL_FEATURES]


def create_app() -> FastAPI:
    app = FastAPI(title="Disease Prediction Inference API", version="1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    base_dir = Path(__file__).resolve().parents[1]
    default_model = base_dir / "models" / "disease_model.joblib"
    model_path = Path(
        (Path.cwd() / "models" / "disease_model.joblib")
        if (Path.cwd() / "models" / "disease_model.joblib").exists()
        else default_model
    )

    artifacts = load_artifacts(model_path)
    pipeline = artifacts.pipeline

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/metrics")
    def metrics():
        # Prefer the sidecar JSON if present
        mp = Path(str(model_path).replace(".joblib", ".metrics.json"))
        if mp.exists():
            return json.loads(mp.read_text(encoding="utf-8"))
        if artifacts.metrics is not None:
            return artifacts.metrics
        return {"note": "No metrics found"}

    @app.post("/predict", response_model=PredictResponse)
    def predict(req: PredictRequest):
        if pipeline is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        X = _to_feature_frame(req.record)
        proba = pipeline.predict_proba(X)[0]
        classes = list(pipeline.classes_)
        order = proba.argsort()[::-1]
        k = min(req.top_k, len(classes))
        top = [{"disease": classes[i], "probability": float(proba[i])} for i in order[:k]]
        return {"top_predictions": top}

    @app.post("/predict-batch")
    async def predict_batch(file: UploadFile = File(...)):
        if pipeline is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        if not file.filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV supported")

        content = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(content))

        # Ensure symptom columns exist
        for s in SYMPTOMS:
            if s not in df.columns:
                df[s] = 0
            else:
                df[s] = df[s].astype(int)

        for f in ALL_FEATURES:
            if f not in df.columns:
                df[f] = None

        X = df[ALL_FEATURES]
        proba = pipeline.predict_proba(X)
        pred = pipeline.predict(X)
        classes = list(pipeline.classes_)

        out = df.copy()
        out["predicted_disease"] = pred
        out["confidence"] = proba.max(axis=1)
        for i, c in enumerate(classes):
            out[f"proba__{c}"] = proba[:, i]

        return {
            "rows": len(out),
            "columns": list(out.columns),
            "data": out.head(200).to_dict(orient="records"),
        }

    return app


app = create_app()

