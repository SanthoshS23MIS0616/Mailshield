"""
model.py - Phishing Email Detection ML Model
Ensemble of RandomForest + GradientBoosting with cross-validation
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer

from dataset import generate_dataset
from features import extract_features, get_feature_names

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")


def build_feature_matrix(emails):
    """Extract features from all emails into a numpy matrix"""
    rows = []
    for email in emails:
        feats = extract_features(email["subject"], email["body"])
        rows.append(feats)
    df = pd.DataFrame(rows)
    return df


def train_model():
    """Train the phishing detection ensemble model"""
    print("📦 Generating dataset...")
    emails = generate_dataset(n_phishing=1000, n_legit=1000)
    print(f"   Total samples: {len(emails)} ({sum(1 for e in emails if e['label']==1)} phishing, {sum(1 for e in emails if e['label']==0)} legit)")

    print("🔧 Extracting features...")
    X = build_feature_matrix(emails)
    y = np.array([e["label"] for e in emails])

    feature_names = list(X.columns)
    print(f"   Features extracted: {len(feature_names)}")

    # Train / test split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🤖 Training ensemble model...")

    # Individual classifiers
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    gb = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42,
    )
    lr = LogisticRegression(
        C=1.5,
        max_iter=500,
        class_weight="balanced",
        random_state=42,
    )

    # Voting ensemble (soft voting uses probabilities)
    ensemble = VotingClassifier(
        estimators=[("rf", rf), ("gb", gb), ("lr", lr)],
        voting="soft",
        weights=[3, 2, 1],  # RF weighted higher due to feature-based nature
    )

    # Pipeline with scaler
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("model", ensemble),
    ])

    pipeline.fit(X_train, y_train)

    # ── Evaluate ────────────────────────────────────────────────────
    print("📊 Evaluating model...")
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")

    print(f"\n{'='*50}")
    print(f"  ACCURACY : {accuracy*100:.2f}%")
    print(f"  PRECISION: {precision*100:.2f}%")
    print(f"  RECALL   : {recall*100:.2f}%")
    print(f"  F1-SCORE : {f1*100:.2f}%")
    print(f"  ROC-AUC  : {auc*100:.2f}%")
    print(f"  CV MEAN  : {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
    print(f"{'='*50}\n")

    print("Confusion Matrix:")
    print(f"  TN={cm[0][0]}  FP={cm[0][1]}")
    print(f"  FN={cm[1][0]}  TP={cm[1][1]}")

    # Feature importance (from RF component)
    rf_model = pipeline.named_steps["model"].estimators_[0]
    importances = rf_model.feature_importances_
    feat_importance = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1], reverse=True
    )[:15]

    metrics = {
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "roc_auc": round(auc * 100, 2),
        "cv_mean": round(cv_scores.mean() * 100, 2),
        "cv_std": round(cv_scores.std() * 100, 2),
        "cv_scores": [round(s * 100, 2) for s in cv_scores.tolist()],
        "confusion_matrix": {
            "true_negative": int(cm[0][0]),
            "false_positive": int(cm[0][1]),
            "false_negative": int(cm[1][0]),
            "true_positive": int(cm[1][1]),
        },
        "feature_importance": [
            {"feature": name, "importance": round(float(imp) * 100, 3)}
            for name, imp in feat_importance
        ],
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_count": len(feature_names),
        "model_type": "Ensemble (RF + GBM + LR)",
    }

    # Save model and metrics
    joblib.dump({"pipeline": pipeline, "feature_names": feature_names}, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✅ Model saved to {MODEL_PATH}")
    print(f"✅ Metrics saved to {METRICS_PATH}")
    return pipeline, feature_names, metrics


def load_model():
    """Load trained model from disk"""
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model not found. Training now...")
        return train_model()
    data = joblib.load(MODEL_PATH)
    with open(METRICS_PATH) as f:
        metrics = json.load(f)
    return data["pipeline"], data["feature_names"], metrics


def predict(pipeline, subject: str, body: str):
    """
    Predict whether an email is phishing or safe.
    Returns: dict with prediction, confidence, and feature values
    """
    features = extract_features(subject, body)
    feature_df = pd.DataFrame([features])

    prediction = pipeline.predict(feature_df)[0]
    probabilities = pipeline.predict_proba(feature_df)[0]

    return {
        "prediction": "Phishing" if prediction == 1 else "Safe",
        "is_phishing": bool(prediction == 1),
        "confidence": round(float(max(probabilities)) * 100, 2),
        "phishing_probability": round(float(probabilities[1]) * 100, 2),
        "safe_probability": round(float(probabilities[0]) * 100, 2),
        "features": features,
    }


if __name__ == "__main__":
    train_model()
