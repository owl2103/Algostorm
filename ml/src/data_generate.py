from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

from .config import ALL_FEATURES, SYMPTOMS, TARGET_COL
from .utils import ensure_parent_dir


@dataclass(frozen=True)
class DiseaseProfile:
    name: str
    symptom_probs: dict[str, float]
    temp_mean: float
    temp_sd: float
    spo2_mean: float
    spo2_sd: float
    # chronic-risk / lab feature means (optional; used if present)
    bmi_mean: float | None = None
    bmi_sd: float | None = None
    glucose_mean: float | None = None
    glucose_sd: float | None = None
    hba1c_mean: float | None = None
    hba1c_sd: float | None = None
    chol_mean: float | None = None
    chol_sd: float | None = None
    systolic_bp_shift: float = 0.0
    diastolic_bp_shift: float = 0.0


PROFILES = [
    DiseaseProfile(
        name="Common Cold",
        symptom_probs={
            "runny_nose": 0.75,
            "cough": 0.55,
            "sore_throat": 0.45,
            "fever": 0.15,
            "fatigue": 0.35,
            "headache": 0.25,
        },
        temp_mean=36.9,
        temp_sd=0.25,
        spo2_mean=98.0,
        spo2_sd=0.8,
    ),
    DiseaseProfile(
        name="Influenza",
        symptom_probs={
            "fever": 0.8,
            "fatigue": 0.75,
            "body_aches": 0.7,
            "headache": 0.6,
            "cough": 0.45,
            "sore_throat": 0.3,
            "nausea": 0.25,
        },
        temp_mean=38.5,
        temp_sd=0.6,
        spo2_mean=97.0,
        spo2_sd=1.0,
    ),
    DiseaseProfile(
        name="COVID-19",
        symptom_probs={
            "fever": 0.6,
            "cough": 0.55,
            "fatigue": 0.6,
            "loss_of_smell": 0.45,
            "shortness_of_breath": 0.35,
            "headache": 0.35,
            "sore_throat": 0.25,
        },
        temp_mean=38.0,
        temp_sd=0.6,
        spo2_mean=95.5,
        spo2_sd=2.0,
    ),
    DiseaseProfile(
        name="Gastroenteritis",
        symptom_probs={
            "nausea": 0.75,
            "vomiting": 0.55,
            "diarrhea": 0.8,
            "fever": 0.25,
            "fatigue": 0.45,
            "headache": 0.25,
        },
        temp_mean=37.4,
        temp_sd=0.5,
        spo2_mean=98.0,
        spo2_sd=0.8,
    ),
    DiseaseProfile(
        name="Pneumonia",
        symptom_probs={
            "fever": 0.7,
            "cough": 0.65,
            "shortness_of_breath": 0.6,
            "chest_pain": 0.45,
            "fatigue": 0.6,
        },
        temp_mean=38.6,
        temp_sd=0.7,
        spo2_mean=93.0,
        spo2_sd=2.2,
    ),
    # Chronic diseases (richer feature patterns)
    DiseaseProfile(
        name="Type 2 Diabetes",
        symptom_probs={
            "fatigue": 0.45,
            "increased_thirst": 0.65,
            "frequent_urination": 0.6,
            "blurred_vision": 0.35,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=31.0,
        bmi_sd=4.0,
        glucose_mean=175.0,
        glucose_sd=35.0,
        hba1c_mean=8.2,
        hba1c_sd=1.2,
        chol_mean=215.0,
        chol_sd=35.0,
    ),
    DiseaseProfile(
        name="Hypertension",
        symptom_probs={
            "headache": 0.25,
            "chest_pain": 0.08,
            "shortness_of_breath": 0.1,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=28.5,
        bmi_sd=4.5,
        glucose_mean=105.0,
        glucose_sd=18.0,
        hba1c_mean=5.8,
        hba1c_sd=0.5,
        chol_mean=210.0,
        chol_sd=40.0,
        systolic_bp_shift=25.0,
        diastolic_bp_shift=12.0,
    ),
    DiseaseProfile(
        name="Coronary Artery Disease",
        symptom_probs={
            "chest_pain": 0.65,
            "shortness_of_breath": 0.4,
            "fatigue": 0.35,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=97.0,
        spo2_sd=1.0,
        bmi_mean=29.0,
        bmi_sd=4.5,
        glucose_mean=115.0,
        glucose_sd=25.0,
        hba1c_mean=6.1,
        hba1c_sd=0.7,
        chol_mean=245.0,
        chol_sd=45.0,
        systolic_bp_shift=15.0,
        diastolic_bp_shift=6.0,
    ),
    DiseaseProfile(
        name="Asthma/COPD",
        symptom_probs={
            "shortness_of_breath": 0.7,
            "cough": 0.5,
            "wheezing": 0.7,
            "chest_pain": 0.15,
            "fatigue": 0.25,
        },
        temp_mean=36.9,
        temp_sd=0.25,
        spo2_mean=94.5,
        spo2_sd=2.0,
        bmi_mean=27.0,
        bmi_sd=5.0,
        glucose_mean=102.0,
        glucose_sd=18.0,
        hba1c_mean=5.7,
        hba1c_sd=0.5,
        chol_mean=205.0,
        chol_sd=35.0,
    ),
    DiseaseProfile(
        name="Chronic Kidney Disease",
        symptom_probs={
            "fatigue": 0.55,
            "swelling_ankles": 0.55,
            "shortness_of_breath": 0.2,
            "nausea": 0.2,
        },
        temp_mean=36.8,
        temp_sd=0.25,
        spo2_mean=97.5,
        spo2_sd=1.0,
        bmi_mean=27.5,
        bmi_sd=4.8,
        glucose_mean=120.0,
        glucose_sd=30.0,
        hba1c_mean=6.3,
        hba1c_sd=0.9,
        chol_mean=220.0,
        chol_sd=45.0,
        systolic_bp_shift=10.0,
        diastolic_bp_shift=4.0,
    ),
    DiseaseProfile(
        name="Allergic Rhinitis",
        symptom_probs={
            "runny_nose": 0.8,
            "sneezing": 0.75,
            "itchy_eyes": 0.65,
            "cough": 0.25,
            "sore_throat": 0.15,
            "fever": 0.03,
            "fatigue": 0.18,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.3,
        spo2_sd=0.7,
        bmi_mean=24.8,
        bmi_sd=4.5,
        glucose_mean=95.0,
        glucose_sd=12.0,
        hba1c_mean=5.4,
        hba1c_sd=0.35,
        chol_mean=190.0,
        chol_sd=28.0,
    ),
    DiseaseProfile(
        name="Migraine",
        symptom_probs={
            "headache": 0.9,
            "nausea": 0.55,
            "vomiting": 0.2,
            "dizziness": 0.45,
            "fatigue": 0.35,
            "fever": 0.03,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=25.5,
        bmi_sd=4.8,
        glucose_mean=98.0,
        glucose_sd=14.0,
        hba1c_mean=5.5,
        hba1c_sd=0.35,
        chol_mean=195.0,
        chol_sd=30.0,
    ),
    DiseaseProfile(
        name="Urinary Tract Infection",
        symptom_probs={
            "burning_urination": 0.8,
            "frequent_urination": 0.6,
            "fever": 0.25,
            "nausea": 0.2,
            "fatigue": 0.3,
            "abdominal_pain": 0.35,
        },
        temp_mean=37.2,
        temp_sd=0.4,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=26.0,
        bmi_sd=4.7,
        glucose_mean=100.0,
        glucose_sd=15.0,
        hba1c_mean=5.6,
        hba1c_sd=0.4,
        chol_mean=200.0,
        chol_sd=32.0,
    ),
    DiseaseProfile(
        name="GERD",
        symptom_probs={
            "heartburn": 0.8,
            "nausea": 0.25,
            "abdominal_pain": 0.35,
            "cough": 0.15,
            "sore_throat": 0.12,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=29.0,
        bmi_sd=5.2,
        glucose_mean=102.0,
        glucose_sd=16.0,
        hba1c_mean=5.7,
        hba1c_sd=0.45,
        chol_mean=205.0,
        chol_sd=35.0,
    ),
    DiseaseProfile(
        name="Heart Failure",
        symptom_probs={
            "shortness_of_breath": 0.75,
            "swelling_ankles": 0.7,
            "fatigue": 0.6,
            "chest_pain": 0.25,
            "dizziness": 0.2,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=95.8,
        spo2_sd=1.8,
        bmi_mean=30.0,
        bmi_sd=5.0,
        glucose_mean=112.0,
        glucose_sd=24.0,
        hba1c_mean=6.0,
        hba1c_sd=0.7,
        chol_mean=230.0,
        chol_sd=42.0,
        systolic_bp_shift=8.0,
        diastolic_bp_shift=2.0,
    ),
    DiseaseProfile(
        name="Iron Deficiency Anemia",
        symptom_probs={
            "fatigue": 0.75,
            "dizziness": 0.55,
            "shortness_of_breath": 0.25,
            "headache": 0.25,
        },
        temp_mean=36.8,
        temp_sd=0.2,
        spo2_mean=98.0,
        spo2_sd=0.8,
        bmi_mean=24.5,
        bmi_sd=4.9,
        glucose_mean=95.0,
        glucose_sd=12.0,
        hba1c_mean=5.4,
        hba1c_sd=0.35,
        chol_mean=185.0,
        chol_sd=28.0,
    ),
]


def _bernoulli(rng: np.random.Generator, p: float) -> int:
    return int(rng.random() < p)


def generate(n: int, seed: int, balance: str = "natural") -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    if balance == "balanced":
        disease_probs = np.ones(len(PROFILES), dtype=float) / float(len(PROFILES))
    else:
        # mix acute + chronic (slightly more chronic to make the task realistic)
        disease_probs = np.array(
            [
                0.13,  # cold
                0.11,  # flu
                0.08,  # covid
                0.08,  # gastro
                0.06,  # pneumonia
                0.12,  # t2d
                0.10,  # htn
                0.06,  # cad
                0.04,  # asthma/copd
                0.03,  # ckd
                0.07,  # allergic rhinitis
                0.05,  # migraine
                0.03,  # UTI
                0.02,  # GERD
                0.01,  # heart failure
                0.01,  # anemia
            ],
            dtype=float,
        )
        disease_probs = disease_probs / disease_probs.sum()

    rows = []
    for _ in range(n):
        profile = PROFILES[int(rng.choice(len(PROFILES), p=disease_probs))]
        # chronic diseases skew older
        age_mu = 55 if profile.name in {
            "Type 2 Diabetes",
            "Hypertension",
            "Coronary Artery Disease",
            "Chronic Kidney Disease",
        } else 35
        age_sd = 15 if age_mu == 55 else 18
        age = int(np.clip(rng.normal(age_mu, age_sd), 1, 92))
        sex = str(rng.choice(["M", "F"]))

        temperature_c = float(np.clip(rng.normal(profile.temp_mean, profile.temp_sd), 35.5, 41.5))
        spo2 = float(np.clip(rng.normal(profile.spo2_mean, profile.spo2_sd), 85.0, 100.0))

        heart_rate = float(np.clip(rng.normal(78 + max(0, temperature_c - 37.0) * 8, 10), 45, 140))
        systolic_bp = float(np.clip(rng.normal(120 + profile.systolic_bp_shift, 14), 85, 210))
        diastolic_bp = float(np.clip(rng.normal(78 + profile.diastolic_bp_shift, 10), 50, 140))

        # lifestyle / chronic risk factors
        activity_level = str(rng.choice(["low", "medium", "high"], p=[0.38, 0.45, 0.17]))
        smoker_p = 0.35 if profile.name in {"Asthma/COPD", "Coronary Artery Disease"} else 0.18
        smoker = "yes" if rng.random() < smoker_p else "no"

        bmi_base_mu = profile.bmi_mean if profile.bmi_mean is not None else 25.5
        bmi_base_sd = profile.bmi_sd if profile.bmi_sd is not None else 4.2
        bmi = float(np.clip(rng.normal(bmi_base_mu, bmi_base_sd), 16.0, 48.0))

        glucose_mu = profile.glucose_mean if profile.glucose_mean is not None else 98.0
        glucose_sd = profile.glucose_sd if profile.glucose_sd is not None else 14.0
        # activity lowers glucose a bit; BMI increases it a bit
        act_adj = {"low": 6.0, "medium": 0.0, "high": -6.0}[activity_level]
        glucose = float(np.clip(rng.normal(glucose_mu + act_adj + (bmi - 25.0) * 1.2, glucose_sd), 60.0, 350.0))

        hba1c_mu = profile.hba1c_mean if profile.hba1c_mean is not None else 5.5
        hba1c_sd = profile.hba1c_sd if profile.hba1c_sd is not None else 0.35
        hba1c = float(np.clip(rng.normal(hba1c_mu + max(0.0, (glucose - 100.0)) * 0.01, hba1c_sd), 4.2, 14.0))

        chol_mu = profile.chol_mean if profile.chol_mean is not None else 195.0
        chol_sd = profile.chol_sd if profile.chol_sd is not None else 30.0
        smoker_adj = 18.0 if smoker == "yes" else 0.0
        chol = float(np.clip(rng.normal(chol_mu + smoker_adj + (bmi - 25.0) * 1.0, chol_sd), 110.0, 360.0))

        symptom_values = {}
        for s in SYMPTOMS:
            base_p = profile.symptom_probs.get(s, 0.05)
            if s == "shortness_of_breath":
                base_p = float(np.clip(base_p + (97.0 - spo2) * 0.03, 0.01, 0.95))
            symptom_values[s] = _bernoulli(rng, base_p)

        row = {
            "age": age,
            "sex": sex,
            "temperature_c": temperature_c,
            "heart_rate": heart_rate,
            "systolic_bp": systolic_bp,
            "diastolic_bp": diastolic_bp,
            "spo2": spo2,
            "bmi": bmi,
            "fasting_glucose_mg_dl": glucose,
            "hba1c_pct": hba1c,
            "total_cholesterol_mg_dl": chol,
            "smoker": smoker,
            "activity_level": activity_level,
            **symptom_values,
            TARGET_COL: profile.name,
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    df = df[ALL_FEATURES + [TARGET_COL]]

    # Lightly simulate missingness
    for col in ["temperature_c", "spo2", "heart_rate", "fasting_glucose_mg_dl", "hba1c_pct", "total_cholesterol_mg_dl"]:
        mask = rng.random(n) < 0.02
        df.loc[mask, col] = np.nan

    return df


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate a demo symptom/vitals disease dataset.")
    ap.add_argument("--out", required=True, help="Output CSV path.")
    ap.add_argument("--n", type=int, default=2000, help="Number of rows to generate.")
    ap.add_argument("--seed", type=int, default=42, help="Random seed.")
    ap.add_argument(
        "--balance",
        choices=["natural", "balanced"],
        default="natural",
        help="Class distribution. 'balanced' makes all diseases equally likely.",
    )
    args = ap.parse_args()

    out = ensure_parent_dir(args.out)
    df = generate(n=args.n, seed=args.seed, balance=args.balance)
    df.to_csv(out, index=False)
    print(f"Wrote {len(df)} rows to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

