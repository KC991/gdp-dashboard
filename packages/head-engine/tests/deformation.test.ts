import { describe, expect, it } from "vitest";
import { applyDeformation } from "../src/index";
import { defaultFaceParameters, FACE_PARAM_KEYS, FaceParameters } from "@head-editor/shared";

const base = new Float32Array([
  -1, 0, 0,
  1, 0, 0,
  0, 1, 0,
  0, -1, 0,
  0, 0, 1,
  0.2, 0.45, 0.85,
  -0.2, 0.45, 0.85,
  0.4, -0.3, 0.3,
  -0.4, -0.3, 0.3
]);

function makeParams(value: 1 | -1): FaceParameters {
  return FACE_PARAM_KEYS.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, { ...defaultFaceParameters } as FaceParameters);
}

describe("applyDeformation", () => {
  it("keeps neutral values unchanged", () => {
    const out = applyDeformation(base, defaultFaceParameters);
    expect(Array.from(out)).toEqual(Array.from(base));
  });

  it("is stable with extreme positive values", () => {
    const out = applyDeformation(base, makeParams(1));
    expect(Array.from(out).every((v) => Number.isFinite(v))).toBe(true);
  });

  it("is stable with extreme negative values", () => {
    const out = applyDeformation(base, makeParams(-1));
    expect(Array.from(out).every((v) => Number.isFinite(v))).toBe(true);
  });

  it("produces visible deformation under strong parameters", () => {
    const out = applyDeformation(base, makeParams(1));
    const maxDelta = Array.from(out).reduce((m, val, i) => Math.max(m, Math.abs(val - base[i])), 0);
    expect(maxDelta).toBeGreaterThan(0.03);
  });

  it("is deterministic for the same input", () => {
    const params = makeParams(1);
    const outA = applyDeformation(base, params);
    const outB = applyDeformation(base, params);
    expect(Array.from(outA)).toEqual(Array.from(outB));
  });
});
