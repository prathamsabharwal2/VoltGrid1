
import json
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Sample data for our first local model.
# Later, we can replace this with real VoltGrid data.
data = pd.DataFrame({
    "temperature": [20, 22, 25, 28, 30, 32, 18, 24, 27, 35,
                    21, 29, 31, 26, 23, 34, 19, 33, 36, 22],
    "humidity": [40, 45, 50, 55, 60, 65, 35, 48, 52, 70,
                 42, 58, 63, 51, 46, 68, 38, 66, 72, 44],
    "energy_usage": [100, 110, 125, 140, 155, 165, 90, 120, 135, 180,
                     105, 150, 160, 130, 115, 175, 95, 170, 185, 108],
})

X = data[["temperature", "humidity"]]
y = data["energy_usage"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

model = Pipeline([
    ("scaler", StandardScaler()),
    ("regressor", LinearRegression()),
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

# Save the trained model and evaluation report.
output_dir = Path("artifacts")
output_dir.mkdir(exist_ok=True)

import joblib

joblib.dump(model, output_dir / "energy_model.joblib")

report = {
    "training_rows": len(X_train),
    "test_rows": len(X_test),
    "mean_absolute_error": round(float(mae), 2),
    "r2_score": round(float(r2), 3),
}

(output_dir / "metrics.json").write_text(
    json.dumps(report, indent=2),
    encoding="utf-8",
)

print("Model training completed successfully!")
print(json.dumps(report, indent=2))
print(f"Saved model to: {output_dir / 'energy_model.joblib'}")