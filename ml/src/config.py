SYMPTOMS = [
    "fever",
    "cough",
    "sore_throat",
    "fatigue",
    "headache",
    "nausea",
    "vomiting",
    "diarrhea",
    "shortness_of_breath",
    "chest_pain",
    "body_aches",
    "loss_of_smell",
    "runny_nose",
    "rash",
    "joint_pain",
    # more "clinical" symptoms often seen in chronic conditions
    "wheezing",
    "increased_thirst",
    "frequent_urination",
    "blurred_vision",
    "swelling_ankles",
    # additional symptoms for a larger disease set
    "sneezing",
    "itchy_eyes",
    "abdominal_pain",
    "heartburn",
    "burning_urination",
    "dizziness",
]

TARGET_COL = "disease"

NUMERIC_FEATURES = [
    "age",
    "temperature_c",
    "heart_rate",
    "systolic_bp",
    "diastolic_bp",
    "spo2",
    # chronic disease risk factors / basic labs
    "bmi",
    "fasting_glucose_mg_dl",
    "hba1c_pct",
    "total_cholesterol_mg_dl",
]

CATEGORICAL_FEATURES = [
    "sex",  # M/F
    "smoker",  # yes/no
    "activity_level",  # low/medium/high
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES + SYMPTOMS

