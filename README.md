# Parametric 3D Head Editor (Monorepo v1)

This repository now contains a first working local prototype of a **parametric 3D head editor** with:

- **Next.js + TypeScript** frontend (`apps/web`)
- **FastAPI** backend (`apps/api`)
- **Three.js** OBJ viewer
- **12 editable face parameters**
- **JSON preset save/load + reset**
- **Modular deformation engine** (`packages/head-engine`)
- **Shared parameter schema/types** (`packages/shared`)

## Folder structure

```text
apps/
  web/                 # Next.js app (Three.js viewer + controls)
  api/                 # FastAPI service
packages/
  shared/              # Shared parameter schema/type definitions
  head-engine/         # Pure deformation logic (no UI dependencies)
assets/
  meshes/base_mesh.obj # Base OBJ mesh
  presets/sample_preset.json
```

## Parameter list

- `face_width`
- `jaw_width`
- `chin_width`
- `chin_projection`
- `lower_face_height`
- `midface_height`
- `nose_projection`
- `nose_width`
- `eye_size`
- `eye_spacing`
- `brow_height`
- `cheek_fullness`

All values are normalized to `[-1, 1]`.

## Run locally

### 1) Frontend + shared packages

```bash
npm install
npm run dev
```

Then open: `http://localhost:3000`

### 2) Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

## Tests

### JavaScript/TypeScript tests

```bash
npm test
```

Covers:
- parameter schema validation (`packages/shared/tests`)
- deformation stability checks (`packages/head-engine/tests`)

### Python API test

```bash
cd apps/api
pytest
```

Root helper scripts:

```bash
npm run dev:web   # same as npm run dev
npm run dev:api   # run FastAPI from repo root
npm run test:web  # shared + head-engine tests
npm run test:api  # api pytest
```

## Preset workflow

- Use sliders to edit face parameters in real time.
- Click **Save preset JSON** to download current values.
- Paste or edit JSON in the textbox and click **Load preset JSON**.
- Click **Reset** to restore defaults.

A sample preset is provided at:

- `assets/presets/sample_preset.json`

## Notes

- The current base mesh and influence regions are intentionally placeholder/simple for v1.
- No ML is included yet by design.
- The original Streamlit GDP template files remain in repo history and root for compatibility, but the new head editor stack lives in the monorepo folders above.
