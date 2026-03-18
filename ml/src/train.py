from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    log_loss,
    roc_auc_score,
)
from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_predict,
    train_test_split,
    RandomizedSearchCV,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

from .config import ALL_FEATURES, CATEGORICAL_FEATURES, NUMERIC_FEATURES, SYMPTOMS, TARGET_COL
from .utils import ensure_parent_dir, read_csv


@dataclass(frozen=True)
class TrainArtifacts:
    pipeline: Pipeline
    features: list[str]
    target_col: str
    metrics: dict | None = None


def build_pipeline(model_type: str, seed: int) -> Pipeline:
    numeric_features = NUMERIC_FEATURES + SYMPTOMS
    categorical_features = CATEGORICAL_FEATURES

    numeric_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    categorical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    pre = ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, numeric_features),
            ("cat", categorical_pipe, categorical_features),
        ]
    )

    if model_type == "hgb":
        clf = HistGradientBoostingClassifier(
            random_state=seed,
            learning_rate=0.08,
            max_depth=6,
            max_iter=350,
        )
    else:
        clf = RandomForestClassifier(
            n_estimators=500,
            random_state=seed,
            class_weight="balanced_subsample",
            n_jobs=-1,
            min_samples_leaf=1,
        )

    return Pipeline(steps=[("preprocess", pre), ("model", clf)])


def _safe_roc_auc(y_true: pd.Series, y_proba: np.ndarray, labels: list[str]) -> float | None:
    try:
        # multiclass OVO macro is a common default
        return float(roc_auc_score(y_true, y_proba, labels=labels, multi_class="ovo", average="macro"))
    except Exception:
        return None


def evaluate(pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    pred = pipeline.predict(X_test)
    proba = pipeline.predict_proba(X_test)
    acc = float(accuracy_score(y_test, pred))
    f1 = float(f1_score(y_test, pred, average="macro"))
    labels = list(pipeline.classes_) if hasattr(pipeline, "classes_") else sorted(y_test.unique().tolist())
    cm = confusion_matrix(y_test, pred, labels=labels)
    report = classification_report(y_test, pred, digits=4)

    ll = float(log_loss(y_test, proba, labels=labels))
    roc_auc = _safe_roc_auc(y_test, proba, labels)

    return {
        "accuracy": acc,
        "f1_macro": f1,
        "log_loss": ll,
        "roc_auc_ovo_macro": roc_auc,
        "labels": labels,
        "confusion_matrix": cm,
        "report": report,
    }


def cv_metrics(
    pipeline: Pipeline, X: pd.DataFrame, y: pd.Series, seed: int, folds: int, max_rows: int | None
) -> dict:
    if max_rows is not None and len(X) > max_rows:
        rng = np.random.default_rng(seed)
        idx = rng.choice(len(X), size=max_rows, replace=False)
        X = X.iloc[idx].reset_index(drop=True)
        y = y.iloc[idx].reset_index(drop=True)

    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=seed)
    pred = cross_val_predict(pipeline, X, y, cv=cv, method="predict")
    proba = cross_val_predict(pipeline, X, y, cv=cv, method="predict_proba")
    labels = sorted(y.unique().tolist())
    return {
        "cv_folds": int(folds),
        "cv_rows": int(len(X)),
        "accuracy": float(accuracy_score(y, pred)),
        "f1_macro": float(f1_score(y, pred, average="macro")),
        "log_loss": float(log_loss(y, proba, labels=labels)),
        "roc_auc_ovo_macro": _safe_roc_auc(y, proba, labels),
    }


def _get_feature_names(pipeline: Pipeline) -> list[str]:
    pre = pipeline.named_steps["preprocess"]
    try:
        names = list(pre.get_feature_names_out())
        return [str(n) for n in names]
    except Exception:
        # fallback: approximate; mostly for older sklearn edge-cases
        return []


def main() -> int:
    ap = argparse.ArgumentParser(description="Train a disease prediction model from a CSV dataset.")
    ap.add_argument("--data", required=True, help="Path to CSV dataset.")
    ap.add_argument("--out", required=True, help="Path to save trained model joblib.")
    ap.add_argument("--test_size", type=float, default=0.2, help="Test split fraction.")
    ap.add_argument("--seed", type=int, default=42, help="Random seed.")
    ap.add_argument("--cv_folds", type=int, default=5, help="Cross-validation folds for overall metrics.")
    ap.add_argument(
        "--cv_max_rows",
        type=int,
        default=8000,
        help="Max rows used for cross-validated metrics (speeds up training on large datasets).",
    )
    ap.add_argument("--model", choices=["rf", "hgb"], default="hgb", help="Model family: rf or hgb.")
    ap.add_argument(
        "--tune",
        action="store_true",
        help="Run randomized hyperparameter search on the training split (can improve accuracy).",
    )
    ap.add_argument(
        "--tune_iter",
        type=int,
        default=25,
        help="Random search iterations (only used with --tune).",
    )
    ap.add_argument(
        "--calibrate",
        action="store_true",
        help="Calibrate predicted probabilities (Platt/sigmoid on CV). Improves probability quality.",
    )
    args = ap.parse_args()

    df = read_csv(args.data)
    missing = [c for c in ALL_FEATURES + [TARGET_COL] if c not in df.columns]
    if missing:
        raise SystemExit(f"Dataset missing required columns: {missing}")

    X = df[ALL_FEATURES].copy()
    y = df[TARGET_COL].astype(str).copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=args.seed, stratify=y
    )

    pipeline = build_pipeline(model_type=args.model, seed=args.seed)

    # Optional hyperparameter tuning (advanced)
    if args.tune:
        cv = StratifiedKFold(n_splits=max(3, min(5, args.cv_folds)), shuffle=True, random_state=args.seed)
        if args.model == "hgb":
            param_dist = {
                "model__learning_rate": [0.03, 0.05, 0.08, 0.12],
                "model__max_depth": [3, 4, 5, 6, 7, None],
                "model__max_iter": [250, 350, 500, 700],
                "model__max_leaf_nodes": [15, 31, 63, 127],
                "model__min_samples_leaf": [10, 20, 30, 50],
                "model__l2_regularization": [0.0, 0.1, 0.5, 1.0],
            }
        else:
            param_dist = {
                "model__n_estimators": [300, 500, 800, 1200],
                "model__max_depth": [None, 8, 12, 16, 22],
                "model__min_samples_leaf": [1, 2, 4, 6, 10],
                "model__min_samples_split": [2, 4, 8, 12],
                "model__max_features": ["sqrt", "log2", None],
            }

        search = RandomizedSearchCV(
            estimator=pipeline,
            param_distributions=param_dist,
            n_iter=args.tune_iter,
            scoring="f1_macro",
            cv=cv,
            random_state=args.seed,
            n_jobs=-1,
            verbose=1,
        )
        search.fit(X_train, y_train)
        pipeline = search.best_estimator_
        print("=== Hyperparameter tuning ===")
        print("Best params:", search.best_params_)
        print(f"Best CV F1 (macro): {float(search.best_score_):.4f}")

    if args.calibrate:
        # wrap the underlying classifier; keep preprocessing in the same pipeline
        base_model = pipeline.named_steps["model"]
        pipeline.named_steps["model"] = CalibratedClassifierCV(base_model, method="sigmoid", cv=3)

    # Cross-validated metrics are more robust than a single split
    cvm = cv_metrics(pipeline, X_train, y_train, seed=args.seed, folds=args.cv_folds, max_rows=args.cv_max_rows)
    print("=== Cross-validated metrics (train split) ===")
    print(json.dumps(cvm, indent=2))

    pipeline.fit(X_train, y_train)

    metrics = evaluate(pipeline, X_test, y_test)
    print("=== Evaluation ===")
    print(f"Accuracy   : {metrics['accuracy']:.4f}")
    print(f"F1 (macro) : {metrics['f1_macro']:.4f}")
    print(f"Log loss   : {metrics['log_loss']:.4f}")
    if metrics["roc_auc_ovo_macro"] is not None:
        print(f"ROC-AUC (OVO macro): {metrics['roc_auc_ovo_macro']:.4f}")
    print("\nClassification report:\n")
    print(metrics["report"])
    print("Confusion matrix labels:", metrics["labels"])
    print(metrics["confusion_matrix"])

    out = ensure_parent_dir(args.out)
    full_metrics = {"cv": cvm, "test": {**metrics, "confusion_matrix": metrics["confusion_matrix"].tolist()}}
    artifacts = TrainArtifacts(pipeline=pipeline, features=ALL_FEATURES, target_col=TARGET_COL, metrics=full_metrics)
    joblib.dump(artifacts, out)
    print(f"\nSaved model to {out}")

    # Save metrics as JSON next to the model (easy to show in dashboard)
    metrics_path = out.with_suffix(".metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(full_metrics, f, indent=2)
    print(f"Saved metrics to {metrics_path}")

    # Permutation importance (on test split) for interpretability
    try:
        r = permutation_importance(
            pipeline,
            X_test,
            y_test,
            n_repeats=10,
            random_state=args.seed,
            scoring="f1_macro",
            n_jobs=-1,
        )

        importances = pd.DataFrame(
            {
                "feature": ALL_FEATURES,
                "importance_mean": r.importances_mean,
                "importance_std": r.importances_std,
            }
        ).sort_values("importance_mean", ascending=False)

        fi_path = out.with_suffix(".feature_importance.csv")
        importances.to_csv(fi_path, index=False)
        print(f"Saved feature importance to {fi_path}")
    except Exception as e:
        print(f"Feature importance skipped: {e}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

