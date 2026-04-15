import { describe, expect, it } from "vitest";
import { coerceFaceParameters, defaultFaceParameters } from "../src/index";

describe("face parameter schema", () => {
  it("fills defaults", () => {
    expect(coerceFaceParameters({})).toEqual(defaultFaceParameters);
  });

  it("rejects out-of-range values", () => {
    expect(() => coerceFaceParameters({ face_width: 1.5 })).toThrow();
  });

  it("accepts full valid payload", () => {
    const parsed = coerceFaceParameters({
      face_width: 0.1,
      jaw_width: -0.2,
      chin_width: 0,
      chin_projection: 0,
      lower_face_height: 0,
      midface_height: 0,
      nose_projection: 0,
      nose_width: 0,
      eye_size: 0,
      eye_spacing: 0,
      brow_height: 0,
      cheek_fullness: 0
    });

    expect(parsed.face_width).toBe(0.1);
    expect(parsed.jaw_width).toBe(-0.2);
  });
});
