"""
model.py — Train a Random Forest Regressor on startup funding data.

Features : Country, Industry, Funding Stage  (label-encoded)
Target   : Amount Raised (USD)

Outputs  :
  • model.pkl     — trained RandomForestRegressor
  • encoders.pkl  — dict of LabelEncoders + max funding value
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder


# ── 1. Load & Inspect ────────────────────────────────────────────────────────
df = pd.read_csv("cleaned_data.csv")
print(f"Dataset shape : {df.shape}")
print(f"Columns       : {df.columns.tolist()}")
print(f"Missing values:\n{df.isnull().sum()}\n")

# ── 2. Handle missing values (none expected, but safety-first) ───────────────
df = df.dropna(subset=["Country", "Industry", "Funding Stage", "Amount Raised (USD)"])
print(f"After dropna  : {df.shape}")

# ── 3. Feature / Target selection ────────────────────────────────────────────
FEATURES = ["Country", "Industry", "Funding Stage"]
TARGET = "Amount Raised (USD)"

X_raw = df[FEATURES].copy()
y = df[TARGET].copy()

# ── 4. Encode categorical features ──────────────────────────────────────────
encoders = {}
X_encoded = pd.DataFrame()

for col in FEATURES:
    le = LabelEncoder()
    X_encoded[col] = le.fit_transform(X_raw[col].astype(str))
    encoders[col] = le
    print(f"  {col:20s}  →  {len(le.classes_)} classes: {le.classes_.tolist()}")

print()

# ── 5. Train / Test split ───────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y, test_size=0.2, random_state=42
)
print(f"Train set : {X_train.shape[0]} rows")
print(f"Test  set : {X_test.shape[0]} rows\n")

# ── 6. Train Random Forest ──────────────────────────────────────────────────
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

# ── 7. Evaluate ─────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print("── Evaluation ─────────────────────────")
print(f"  R² Score           : {r2:.4f}")
print(f"  Mean Absolute Error: ${mae:,.0f}")
print()

# Feature importances
importances = dict(zip(FEATURES, model.feature_importances_))
print("── Feature Importances ────────────────")
for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
    print(f"  {feat:20s}  {imp:.4f}")
print()

# ── 8. Save model & encoders ────────────────────────────────────────────────
# Store max funding value for success probability normalization
max_funding = float(y.max())
percentile_90 = float(y.quantile(0.90))

save_payload = {
    "encoders": encoders,
    "max_funding": max_funding,
    "percentile_90": percentile_90,
    "feature_names": FEATURES,
    "r2_score": r2,
    "mae": mae,
}

joblib.dump(model, "model.pkl")
joblib.dump(save_payload, "encoders.pkl")

print("✅  model.pkl    saved")
print("✅  encoders.pkl saved")
print(f"    max_funding   = ${max_funding:,.0f}")
print(f"    percentile_90 = ${percentile_90:,.0f}")
print("\nDone — model is ready for serving.")
