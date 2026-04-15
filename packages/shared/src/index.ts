import { z } from "zod";

export const FACE_PARAM_KEYS = [
  "face_width",
  "jaw_width",
  "chin_width",
  "chin_projection",
  "lower_face_height",
  "midface_height",
  "nose_projection",
  "nose_width",
  "eye_size",
  "eye_spacing",
  "brow_height",
  "cheek_fullness"
] as const;

export type FaceParamKey = (typeof FACE_PARAM_KEYS)[number];

export const faceParametersSchema = z.object({
  face_width: z.number().min(-1).max(1).default(0),
  jaw_width: z.number().min(-1).max(1).default(0),
  chin_width: z.number().min(-1).max(1).default(0),
  chin_projection: z.number().min(-1).max(1).default(0),
  lower_face_height: z.number().min(-1).max(1).default(0),
  midface_height: z.number().min(-1).max(1).default(0),
  nose_projection: z.number().min(-1).max(1).default(0),
  nose_width: z.number().min(-1).max(1).default(0),
  eye_size: z.number().min(-1).max(1).default(0),
  eye_spacing: z.number().min(-1).max(1).default(0),
  brow_height: z.number().min(-1).max(1).default(0),
  cheek_fullness: z.number().min(-1).max(1).default(0)
});

export type FaceParameters = z.infer<typeof faceParametersSchema>;

export const defaultFaceParameters: FaceParameters = faceParametersSchema.parse({});

export function coerceFaceParameters(input: unknown): FaceParameters {
  return faceParametersSchema.parse(input);
}
