import os
from typing import Dict

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def load_dataset() -> pd.DataFrame:
    """Load irrigation dataset from data/irrigation.csv."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_path = os.path.join(base_dir, "data", "irrigation.csv")

    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Dataset not found at {data_path}. "
            "Ensure data/irrigation.csv exists before training."
        )

    df = pd.read_csv(data_path)
    required_columns = ["Temperature", "Humidity", "Rainfall", "Crop", "Soil", "Irrigation"]
    missing = [c for c in required_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")

    return df


def build_pipeline() -> Pipeline:
    """Build a preprocessing + RandomForest pipeline."""
    numeric_features = ["Temperature", "Humidity", "Rainfall"]
    categorical_features = ["Crop", "Soil"]

    numeric_transformer = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", clf),
        ]
    )

    return model


def train_and_save_model() -> Dict[str, str]:
    """Train the RandomForest model and persist it to disk.

    Returns:
        Dict containing paths of saved model artifacts.
    """
    df = load_dataset()

    X = df[["Temperature", "Humidity", "Rainfall", "Crop", "Soil"]]
    y = df["Irrigation"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = build_pipeline()
    model.fit(X_train, y_train)

    # Basic evaluation
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Validation Accuracy: {acc:.4f}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    model_dir = os.path.join(base_dir, "model")
    os.makedirs(model_dir, exist_ok=True)
    primary_model_path = os.path.join(model_dir, "irrigation_model.pkl")

    backend_dir = os.path.join(base_dir, "backend")
    os.makedirs(backend_dir, exist_ok=True)
    backend_model_path = os.path.join(backend_dir, "irrigation_model.pkl")

    joblib.dump(model, primary_model_path)
    # Keep backend copy in sync
    joblib.dump(model, backend_model_path)

    print(f"Model saved to: {primary_model_path}")
    print(f"Backend model copy saved to: {backend_model_path}")

    return {
        "primary_model_path": primary_model_path,
        "backend_model_path": backend_model_path,
    }


if __name__ == "__main__":
    train_and_save_model()

