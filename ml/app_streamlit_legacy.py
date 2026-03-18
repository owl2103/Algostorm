from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

from src.config import SYMPTOMS
from src.predict import load_model, predict_batch, predict_one


st.set_page_config(page_title="Early Disease Detection", layout="wide")


# Compatibility shim:
# Some previously-saved joblib models may reference `main.TrainArtifacts` depending on how training was executed.
# Streamlit runs this file as the `main` module, so defining this class here allows those artifacts to load.
@dataclass(frozen=True)
class TrainArtifacts:  # noqa: D101
    pipeline: object
    features: list[str]
    target_col: str
    metrics: dict | None = None

st.title("AI-Based Early Disease Detection (Demo)")
st.caption(
    "Enter patient vitals and symptoms. This demo model predicts a likely disease label from the trained dataset."
)

with st.sidebar:
    st.header("Model")
    model_path = st.text_input("Model file", value="models/disease_model.joblib")
    metrics_path = st.text_input("Metrics file", value="models/disease_model.metrics.json")
    importance_path = st.text_input("Feature importance CSV", value="models/disease_model.feature_importance.csv")
    load_clicked = st.button("Load model", type="primary")

if "model" not in st.session_state:
    st.session_state["model"] = None

if load_clicked or (st.session_state["model"] is None and Path(model_path).exists()):
    try:
        st.session_state["model"] = load_model(model_path)
        st.sidebar.success("Model loaded.")
    except Exception as e:
        st.session_state["model"] = None
        st.sidebar.error(f"Failed to load model: {e}")

tabs = st.tabs(["Single prediction", "Batch (CSV)", "Model metrics"])

with tabs[0]:
    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Patient info")
        age = st.number_input("Age", min_value=0, max_value=120, value=35, step=1)
        sex = st.selectbox("Sex", options=["M", "F"])

        st.subheader("Lifestyle / risk factors")
        smoker = st.selectbox("Smoker", options=["no", "yes"], index=0)
        activity_level = st.selectbox("Activity level", options=["low", "medium", "high"], index=1)
        bmi = st.number_input("BMI", min_value=10.0, max_value=60.0, value=25.0, step=0.1)

        st.subheader("Vitals")
        temperature_c = st.number_input(
            "Temperature (°C)", min_value=34.0, max_value=43.0, value=37.2, step=0.1
        )
        heart_rate = st.number_input("Heart rate (bpm)", min_value=30, max_value=220, value=80, step=1)
        systolic_bp = st.number_input("Systolic BP (mmHg)", min_value=60, max_value=240, value=120, step=1)
        diastolic_bp = st.number_input("Diastolic BP (mmHg)", min_value=30, max_value=160, value=80, step=1)
        spo2 = st.number_input("SpO2 (%)", min_value=50.0, max_value=100.0, value=98.0, step=0.5)

        st.subheader("Basic labs (optional)")
        fasting_glucose_mg_dl = st.number_input(
            "Fasting glucose (mg/dL)", min_value=50.0, max_value=400.0, value=95.0, step=1.0
        )
        hba1c_pct = st.number_input("HbA1c (%)", min_value=3.5, max_value=16.0, value=5.4, step=0.1)
        total_cholesterol_mg_dl = st.number_input(
            "Total cholesterol (mg/dL)", min_value=80.0, max_value=400.0, value=180.0, step=1.0
        )

    with col2:
        st.subheader("Symptoms")
        st.write("Select all that apply.")

        symptom_inputs = {}
        grid = st.columns(2)
        for idx, s in enumerate(SYMPTOMS):
            with grid[idx % 2]:
                label = s.replace("_", " ").title()
                symptom_inputs[s] = st.checkbox(label, value=False)

    st.divider()

    predict_clicked = st.button("Predict disease", type="primary", disabled=st.session_state["model"] is None)

    if st.session_state["model"] is None:
        st.info("Train a model first (`python -m src.train ...`) or load an existing model in the sidebar.")

    if predict_clicked and st.session_state["model"] is not None:
        raw = {
            "age": age,
            "sex": sex,
            "temperature_c": temperature_c,
            "heart_rate": heart_rate,
            "systolic_bp": systolic_bp,
            "diastolic_bp": diastolic_bp,
            "spo2": spo2,
            "bmi": bmi,
            "fasting_glucose_mg_dl": fasting_glucose_mg_dl,
            "hba1c_pct": hba1c_pct,
            "total_cholesterol_mg_dl": total_cholesterol_mg_dl,
            "smoker": smoker,
            "activity_level": activity_level,
            **symptom_inputs,
        }

        result = predict_one(st.session_state["model"], raw)
        top = pd.DataFrame(result["top_predictions"])
        best = top.iloc[0]

        st.subheader("Prediction")
        st.metric(
            "Most likely disease",
            value=str(best["disease"]),
            delta=f"{best['probability']*100:.1f}% confidence",
        )

        if float(best["probability"]) < 0.45:
            st.warning(
                "Low confidence prediction. Consider collecting more symptoms/lab tests and consult a clinician."
            )

        fig = px.bar(
            top,
            x="probability",
            y="disease",
            orientation="h",
            range_x=[0, 1],
            title="Top predictions",
        )
        st.plotly_chart(fig, use_container_width=True)

with tabs[1]:
    st.subheader("Batch prediction (CSV upload)")
    st.write(
        "Upload a CSV containing any subset of the expected columns. Missing symptom columns default to 0. "
        "Missing numeric values are handled by the model's imputer."
    )
    up = st.file_uploader("CSV file", type=["csv"])
    run_batch = st.button("Run batch predictions", disabled=st.session_state["model"] is None or up is None)

    if st.session_state["model"] is None:
        st.info("Load a trained model to enable batch predictions.")

    if run_batch and st.session_state["model"] is not None and up is not None:
        df = pd.read_csv(up)
        out = predict_batch(st.session_state["model"], df)
        st.success(f"Predicted {len(out)} rows.")
        st.dataframe(out.head(50), use_container_width=True)
        st.download_button(
            "Download results CSV",
            data=out.to_csv(index=False).encode("utf-8"),
            file_name="batch_predictions.csv",
            mime="text/csv",
        )

with tabs[2]:
    st.subheader("Model metrics & interpretability artifacts")
    c1, c2 = st.columns([1, 1])

    with c1:
        st.write("**Metrics JSON**")
        mp = Path(metrics_path)
        if mp.exists():
            try:
                metrics = json.loads(mp.read_text(encoding="utf-8"))
                st.json(metrics, expanded=False)
            except Exception as e:
                st.error(f"Failed to read metrics: {e}")
        else:
            st.info("Metrics file not found. Train with `python -m src.train ...` to generate it.")

    with c2:
        st.write("**Permutation feature importance**")
        ip = Path(importance_path)
        if ip.exists():
            fi = pd.read_csv(ip).sort_values("importance_mean", ascending=False).head(20)
            fig = px.bar(
                fi.iloc[::-1],
                x="importance_mean",
                y="feature",
                orientation="h",
                title="Top 20 features (permutation importance, F1 macro)",
            )
            st.plotly_chart(fig, use_container_width=True)
            st.dataframe(fi, use_container_width=True)
        else:
            st.info("Importance file not found. Train with `python -m src.train ...` to generate it.")

