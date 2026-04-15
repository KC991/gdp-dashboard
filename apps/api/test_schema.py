from fastapi.testclient import TestClient
from app.main import app


def test_validate_endpoint_accepts_valid_payload():
    client = TestClient(app)
    payload = {
        "face_width": 0.5,
        "jaw_width": 0,
        "chin_width": 0,
        "chin_projection": 0,
        "lower_face_height": 0,
        "midface_height": 0,
        "nose_projection": 0,
        "nose_width": 0,
        "eye_size": 0,
        "eye_spacing": 0,
        "brow_height": 0,
        "cheek_fullness": 0,
    }
    res = client.post("/validate", json=payload)
    assert res.status_code == 200
    assert res.json()["valid"] is True
