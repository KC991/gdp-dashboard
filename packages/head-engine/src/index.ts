import { FaceParameters, coerceFaceParameters } from "@head-editor/shared";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function applyDeformation(
  basePositions: Float32Array,
  inputParams: FaceParameters
): Float32Array {
  const params = coerceFaceParameters(inputParams);
  const out = new Float32Array(basePositions.length);
  const deformationScale = 1.6;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  for (let i = 0; i < basePositions.length; i += 3) {
    minX = Math.min(minX, basePositions[i]);
    maxX = Math.max(maxX, basePositions[i]);
    minY = Math.min(minY, basePositions[i + 1]);
    maxY = Math.max(maxY, basePositions[i + 1]);
    minZ = Math.min(minZ, basePositions[i + 2]);
    maxZ = Math.max(maxZ, basePositions[i + 2]);
  }

  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  const dz = maxZ - minZ || 1;

  for (let i = 0; i < basePositions.length; i += 3) {
    const x = basePositions[i];
    const y = basePositions[i + 1];
    const z = basePositions[i + 2];

    const nx = (x - minX) / dx;
    const ny = (y - minY) / dy;
    const nz = (z - minZ) / dz;

    const side = Math.sign(x) || 1;
    const lowerFaceMask = 1 - smoothstep(0.45, 0.8, ny);
    const midFaceMask = smoothstep(0.3, 0.45, ny) * (1 - smoothstep(0.7, 0.85, ny));
    const jawMask = lowerFaceMask * (1 - smoothstep(0.45, 0.8, Math.abs(nx - 0.5) * 2));
    const chinMask = lowerFaceMask * smoothstep(0.25, 0.65, 1 - Math.abs(nx - 0.5) * 2);
    const noseMask = smoothstep(0.42, 0.55, ny) * (1 - smoothstep(0.6, 0.78, ny));
    const centerMask = smoothstep(0.1, 0.45, 1 - Math.abs(nx - 0.5) * 2);
    const eyeMask = smoothstep(0.5, 0.65, ny) * (1 - smoothstep(0.78, 0.9, ny));
    const browMask = smoothstep(0.65, 0.82, ny) * (1 - smoothstep(0.88, 0.98, ny));
    const cheekMask = midFaceMask * (1 - centerMask) * (1 - smoothstep(0.2, 0.6, nz));

    let ox = x;
    let oy = y;
    let oz = z;

    ox += deformationScale * side * 0.09 * params.face_width * smoothstep(0.1, 0.95, ny);
    ox += deformationScale * side * 0.1 * params.jaw_width * jawMask;
    ox += deformationScale * side * 0.08 * params.chin_width * chinMask;
    oz += deformationScale * 0.08 * params.chin_projection * chinMask * centerMask;
    oy += deformationScale * 0.08 * params.lower_face_height * lowerFaceMask;
    oy += deformationScale * 0.08 * params.midface_height * midFaceMask;
    oz += deformationScale * 0.12 * params.nose_projection * noseMask * centerMask;
    ox += deformationScale * side * 0.07 * params.nose_width * noseMask;

    const eyeScale = 1 + deformationScale * params.eye_size * 0.2 * eyeMask;
    ox = x + (ox - x) * eyeScale;
    oy = y + (oy - y) * eyeScale;

    ox += deformationScale * side * 0.05 * params.eye_spacing * eyeMask;
    oy += deformationScale * 0.06 * params.brow_height * browMask;
    oz += deformationScale * 0.05 * params.cheek_fullness * cheekMask;

    out[i] = ox;
    out[i + 1] = oy;
    out[i + 2] = oz;
  }

  return out;
}
