from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib


@dataclass(frozen=True)
class TrainArtifacts:
    pipeline: Any
    features: list[str]
    target_col: str
    metrics: dict | None = None


def load_artifacts(model_path: str | Path) -> TrainArtifacts:
    # Backwards compatibility: older artifacts may have been pickled as `__main__.TrainArtifacts`
    # depending on how training was executed. Injecting the class into __main__ allows unpickling.
    import __main__  # noqa: PLC0415

    if not hasattr(__main__, "TrainArtifacts"):
        setattr(__main__, "TrainArtifacts", TrainArtifacts)

    obj = joblib.load(Path(model_path))
    if isinstance(obj, TrainArtifacts):
        return obj
    # Backwards/alternate formats
    if hasattr(obj, "pipeline") and hasattr(obj, "features") and hasattr(obj, "target_col"):
        return TrainArtifacts(
            pipeline=getattr(obj, "pipeline"),
            features=list(getattr(obj, "features")),
            target_col=str(getattr(obj, "target_col")),
            metrics=getattr(obj, "metrics", None),
        )
    # If the file is just a sklearn Pipeline
    return TrainArtifacts(pipeline=obj, features=[], target_col="disease", metrics=None)

