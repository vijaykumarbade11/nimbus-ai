from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Nimbus AI Advisory Service")


class AdvisoryRequest(BaseModel):
    crop: str
    stage: str
    weather_condition: str = ""


class DiseaseRequest(BaseModel):
    crop: str
    symptoms: str


class FarmerQueryRequest(BaseModel):
    crop: str
    question: str


@app.get('/')
def root():
    return {"service": "Nimbus AI Advisory Service", "status": "online"}


@app.get('/health')
def health():
    return {"status": "ok", "service": "python-ai"}


@app.post('/advisory')
def advisory(payload: AdvisoryRequest):
    raise HTTPException(status_code=503, detail="No evidence-backed advisory provider is configured. No advice was generated.")


@app.post('/predict-disease')
def predict_disease(payload: DiseaseRequest):
    raise HTTPException(status_code=503, detail="Photo-based plant assessment is not configured. No diagnosis was generated.")


@app.post('/farmer-query')
def farmer_query(payload: FarmerQueryRequest):
    raise HTTPException(status_code=503, detail="No verified agricultural information provider is configured.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
