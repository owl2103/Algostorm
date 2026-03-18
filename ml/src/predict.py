from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

from .config import ALL_FEATURES, SYMPTOMS
from .utils import to_dataframe


def load_model(model_path: str | Path):
    return joblib.load(Path(model_path))


def normalize_inputs(raw: dict[str, Any]) -> dict[str, Any]:
    record: dict[str, Any] = {}
    for k in ALL_FEATURES:
        if k in SYMPTOMS:
            v = raw.get(k, 0)
            record[k] = int(bool(v))
        else:
            record[k] = raw.get(k, None)

    if record.get("sex") not in {"M", "F"}:
        record["sex"] = "M"
    if record.get("smoker") not in {"yes", "no"}:
        record["smoker"] = "no"
    if record.get("activity_level") not in {"low", "medium", "high"}:
        record["activity_level"] = "medium"
    return record


def predict_one(model_artifacts, raw: dict[str, Any]) -> dict[str, Any]:
    record = normalize_inputs(raw)
    X = to_dataframe(record)[ALL_FEATURES]
    pipeline = model_artifacts.pipeline

    proba = pipeline.predict_proba(X)[0]
    classes = list(pipeline.classes_)
    order = np.argsort(-proba)

    top = [{"disease": classes[i], "probability": float(proba[i])} for i in order[:5]]
    return {"input": record, "top_predictions": top}


def predict_batch(model_artifacts, df: "pd.DataFrame") -> "pd.DataFrame":
    # keep pandas optional at import-time for Streamlit; available in requirements anyway
    import pandas as pd  # noqa: PLC0415

    X = df.copy()
    for s in SYMPTOMS:
        if s in X.columns:
            X[s] = X[s].astype(int)
        else:
            X[s] = 0

    for f in ALL_FEATURES:
        if f not in X.columns:
            X[f] = None

    X = X[ALL_FEATURES]
    pipeline = model_artifacts.pipeline
    proba = pipeline.predict_proba(X)
    pred = pipeline.predict(X)
    classes = list(pipeline.classes_)

    out = df.copy()
    out["predicted_disease"] = pred
    out["confidence"] = proba.max(axis=1)
    # also keep the top-1 probability column per class (useful for analysis)
    for i, c in enumerate(classes):
        out[f"proba__{c}"] = proba[:, i]
    return out

