import { z } from "zod";

// Certificate template fields, shared by the visual editor, the API and the PDF renderer.
// x / y are the field's anchor point as fractions of the image (0–1, from the top-left).
// Text size is a fraction of the image height so it scales with the design.

export const FIELD_TYPES = ["name", "uid", "event", "date", "certid", "text", "signature"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FONTS = ["helvetica", "helvetica-bold", "times", "times-bold", "times-italic", "courier"] as const;
export type FontName = (typeof FONTS)[number];

export const FIELD_LABELS: Record<FieldType, string> = {
  name: "Recipient name",
  uid: "UID",
  event: "Event name",
  date: "Event date",
  certid: "Certificate ID",
  text: "Fixed text",
  signature: "Signature image",
};

export const SAMPLE_VALUES: Record<Exclude<FieldType, "text" | "signature">, string> = {
  name: "Aarav Sharma",
  uid: "23BCS10001",
  event: "Agent Craft Workshop",
  date: "23 March 2026",
  certid: "3f2b9c1e-8a4d-4f6e-9b21-7c5d0e8a1f33",
};

const frac = z.number().min(0).max(1);

export const fieldSchema = z.object({
  id: z.string().regex(/^f[a-z0-9]{1,12}$/),
  type: z.enum(FIELD_TYPES),
  x: frac,
  y: frac,
  // text fields
  size: z.number().min(0.005).max(0.2).default(0.04),
  font: z.enum(FONTS).default("helvetica-bold"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#1e293b"),
  align: z.enum(["left", "center", "right"]).default("center"),
  max_width: frac.default(0.8), // text shrinks to fit this fraction of the image width
  text: z.string().max(120).optional(), // for "text"
  // signature images
  image_path: z.string().regex(/^signatures\/[a-z0-9-]+\.(png|jpg)$/).optional(),
  width: frac.default(0.15),
});

export type TemplateField = z.infer<typeof fieldSchema>;

export const fieldsSchema = z.array(fieldSchema).max(20);

export interface CertificateTemplate {
  id: string;
  name: string;
  file_path: string;
  file_type: "image/png" | "image/jpeg";
  width: number;
  height: number;
  fields: TemplateField[];
  created_at: string;
}

export const CSS_FONTS: Record<FontName, { family: string; weight: number; style: string }> = {
  helvetica: { family: "Helvetica, Arial, sans-serif", weight: 400, style: "normal" },
  "helvetica-bold": { family: "Helvetica, Arial, sans-serif", weight: 700, style: "normal" },
  times: { family: "'Times New Roman', Times, serif", weight: 400, style: "normal" },
  "times-bold": { family: "'Times New Roman', Times, serif", weight: 700, style: "normal" },
  "times-italic": { family: "'Times New Roman', Times, serif", weight: 400, style: "italic" },
  courier: { family: "'Courier New', Courier, monospace", weight: 400, style: "normal" },
};

export function defaultFields(): TemplateField[] {
  return [
    { id: "fname", type: "name", x: 0.5, y: 0.5, size: 0.06, font: "times-bold", color: "#00629b", align: "center", max_width: 0.7, width: 0.15 },
    { id: "fuid", type: "uid", x: 0.5, y: 0.58, size: 0.025, font: "helvetica", color: "#475569", align: "center", max_width: 0.5, width: 0.15 },
  ];
}
