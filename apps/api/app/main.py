"""FastAPI backend for parameter validation and optional server-side deformation."""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(title="Head Editor API", version="0.1.0")


class FaceParameters(BaseModel):
    face_width: float = Field(0, ge=-1, le=1)
    jaw_width: float = Field(0, ge=-1, le=1)
    chin_width: float = Field(0, ge=-1, le=1)
    chin_projection: float = Field(0, ge=-1, le=1)
    lower_face_height: float = Field(0, ge=-1, le=1)
    midface_height: float = Field(0, ge=-1, le=1)
    nose_projection: float = Field(0, ge=-1, le=1)
    nose_width: float = Field(0, ge=-1, le=1)
    eye_size: float = Field(0, ge=-1, le=1)
    eye_spacing: float = Field(0, ge=-1, le=1)
    brow_height: float = Field(0, ge=-1, le=1)
    cheek_fullness: float = Field(0, ge=-1, le=1)


class DeformRequest(BaseModel):
    base_positions: List[float]
    params: FaceParameters


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/validate")
def validate_params(params: FaceParameters) -> dict:
    return {"valid": True, "params": params.model_dump()}


@app.post("/deform")
def deform(req: DeformRequest) -> dict:
    # Placeholder for backend deformation parity with the TS engine.
    # For v1 we return the input and keep real-time updates in browser.
    return {"positions": req.base_positions, "params": req.params.model_dump()}
