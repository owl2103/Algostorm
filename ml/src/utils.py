from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


def ensure_parent_dir(path: str | Path) -> Path:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def read_csv(path: str | Path) -> pd.DataFrame:
    return pd.read_csv(Path(path))


def to_dataframe(record: dict[str, Any]) -> pd.DataFrame:
    return pd.DataFrame([record])

