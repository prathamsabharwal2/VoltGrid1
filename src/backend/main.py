
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="VoltGrid Energy Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "artifacts" / "energy_model.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

model = joblib.load(MODEL_PATH)


class PredictionInput(BaseModel):
    temperature: float = Field(ge=-50, le=70)
    humidity: float = Field(ge=0, le=100)


@app.get("/")
def home():
    return {"message": "VoltGrid API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}


@app.post("/predict")
def predict(data: PredictionInput):
    features = [[data.temperature, data.humidity]]
    prediction = model.predict(features)

    return {
        "predicted_energy_usage": round(float(prediction[0]), 2),
        "temperature": data.temperature,
        "humidity": data.humidity,
    }
