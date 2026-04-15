"use client";

import { ChangeEvent, useMemo, useState } from "react";
import HeadViewer from "../components/HeadViewer";
import {
  FACE_PARAM_KEYS,
  FaceParamKey,
  FaceParameters,
  coerceFaceParameters,
  defaultFaceParameters
} from "@head-editor/shared";

type ViewerDebugState = {
  meshLoaded: boolean;
  loadError: string | null;
  vertexCount: number;
};

export default function HomePage() {
  const [params, setParams] = useState<FaceParameters>(defaultFaceParameters);
  const [wireframe, setWireframe] = useState(false);
  const [presetText, setPresetText] = useState(JSON.stringify(defaultFaceParameters, null, 2));
  const [presetError, setPresetError] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerDebugState>({
    meshLoaded: false,
    loadError: null,
    vertexCount: 0
  });

  const rows = useMemo(() => FACE_PARAM_KEYS, []);

  const onSlider = (key: FaceParamKey, value: number) => {
    setPresetError(null);
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      setPresetText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const resetAll = () => {
    setPresetError(null);
    setParams(defaultFaceParameters);
    setPresetText(JSON.stringify(defaultFaceParameters, null, 2));
  };

  const savePreset = () => {
    const blob = new Blob([JSON.stringify(params, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "head-preset.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = () => {
    try {
      const parsed = coerceFaceParameters(JSON.parse(presetText));
      setParams(parsed);
      setPresetError(null);
    } catch (error) {
      setPresetError(`Invalid preset JSON: ${(error as Error).message}`);
    }
  };

  return (
    <main>
      <HeadViewer params={params} wireframe={wireframe} onStatusChange={setViewerState} />
      <section className="panel">
        <h2>Parametric 3D Head Editor</h2>
        {rows.map((key) => (
          <div className="slider-row" key={key}>
            <label htmlFor={key}>{key}</label>
            <input
              id={key}
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={params[key]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSlider(key, Number(e.target.value))}
            />
          </div>
        ))}

        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <button onClick={() => setWireframe((prev) => !prev)} className="secondary">
            {wireframe ? "Disable wireframe" : "Enable wireframe"}
          </button>
          <button onClick={resetAll} className="secondary">
            Reset
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <button onClick={savePreset}>Save preset JSON</button>
          <button onClick={loadPreset} className="secondary">
            Load preset JSON
          </button>
        </div>

        <textarea value={presetText} onChange={(e) => setPresetText(e.target.value)} />
        {presetError ? <p className="error-text">{presetError}</p> : null}

        <div className="debug-panel">
          <h3>Debug</h3>
          <p>
            <strong>Mesh loaded:</strong> {viewerState.meshLoaded ? "yes" : "no"}
          </p>
          <p>
            <strong>Vertices:</strong> {viewerState.vertexCount}
          </p>
          <p>
            <strong>Viewer error:</strong> {viewerState.loadError ?? "none"}
          </p>
          <pre>{JSON.stringify(params, null, 2)}</pre>
        </div>
      </section>
    </main>
  );
}
