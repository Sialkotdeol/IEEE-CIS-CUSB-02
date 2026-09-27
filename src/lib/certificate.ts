import "server-only";
import { PDFDocument, StandardFonts, StandardFonts as SF, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import type { CertificateTemplate, FontName } from "@/lib/certificateTemplate";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface CertificateInput {
  id: string;
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  kind: string; // e.g. "Participation", "Excellence", "Appreciation"
  signatories: { name: string; title: string }[];
}

const IEEE_BLUE = rgb(0, 98 / 255, 155 / 255);
const CYAN = rgb(6 / 255, 182 / 255, 212 / 255);
const INK = rgb(0.12, 0.14, 0.2);
const MUTED = rgb(0.4, 0.44, 0.52);

function centered(page: ReturnType<PDFDocument["addPage"]>, text: string, y: number, font: PDFFont, size: number, color = INK) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

/** Splits text into lines no wider than maxWidth. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Name at the largest size (≤ 40pt) that fits the width. */
function fitSize(text: string, font: PDFFont, maxWidth: number, max = 40, min = 18) {
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

// pdf-lib's standard fonts only cover WinAnsi; replace anything else so a name never crashes generation.
const safe = (s: string) => s.normalize("NFKD").replace(/[^\x20-\x7E -ÿ]/g, "").trim() || "-";

let logoBytes: Uint8Array | null | undefined;

async function loadLogo(origin: string): Promise<Uint8Array | null> {
  if (logoBytes !== undefined) return logoBytes;
  try {
    const res = await fetch(`${origin}/CIS_Logo_removed_bg.png`, { cache: "force-cache" });
    logoBytes = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    logoBytes = null;
  }
  return logoBytes;
}

export async function renderCertificate(input: CertificateInput, origin: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificate of ${input.kind} - ${safe(input.recipientName)}`);
  pdf.setAuthor("IEEE CIS CUSB");

  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Frame
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: IEEE_BLUE, borderWidth: 3 });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: CYAN, borderWidth: 0.8 });
  page.drawRectangle({ x: 18, y: height - 26, width: width - 36, height: 8, color: IEEE_BLUE });

  // Logo
  const logo = await loadLogo(origin);
  let img: PDFImage | null = null;
  if (logo) {
    try {
      img = await pdf.embedPng(logo);
    } catch {
      img = null;
    }
  }
  if (img) page.drawImage(img, { x: width / 2 - 36, y: height - 128, width: 72, height: 72 });

  centered(page, "IEEE COMPUTATIONAL INTELLIGENCE SOCIETY", height - 150, sansBold, 12, IEEE_BLUE);
  centered(page, "Chandigarh University Student Branch", height - 166, sans, 10, MUTED);

  centered(page, "CERTIFICATE", height - 212, serifBold, 38, INK);
  centered(page, `OF ${safe(input.kind).toUpperCase()}`, height - 236, sansBold, 13, CYAN);

  centered(page, "This is to certify that", height - 276, serifItalic, 15, MUTED);

  const name = safe(input.recipientName);
  const nameSize = fitSize(name, serifBold, width - 200);
  centered(page, name, height - 318, serifBold, nameSize, IEEE_BLUE);
  const nameWidth = Math.min(serifBold.widthOfTextAtSize(name, nameSize) + 60, width - 160);
  page.drawLine({
    start: { x: (width - nameWidth) / 2, y: height - 328 },
    end: { x: (width + nameWidth) / 2, y: height - 328 },
    thickness: 0.8,
    color: CYAN,
  });

  const verb = input.kind.toLowerCase() === "participation" ? "has successfully participated in" : "is recognised for their contribution to";
  const body = `${verb} ${safe(input.eventTitle)}, held on ${safe(input.eventDate)}, organised by IEEE CIS, Chandigarh University Student Branch.`;
  wrap(body, sans, 13, width - 220).forEach((line, i) => centered(page, line, height - 362 - i * 19, sans, 13, INK));

  // Signatures
  const sigs = input.signatories.slice(0, 3);
  const slot = (width - 160) / Math.max(sigs.length, 1);
  sigs.forEach((s, i) => {
    const cx = 80 + slot * i + slot / 2;
    page.drawLine({ start: { x: cx - 80, y: 96 }, end: { x: cx + 80, y: 96 }, thickness: 0.8, color: INK });
    const n = safe(s.name);
    const t = safe(s.title);
    page.drawText(n, { x: cx - sansBold.widthOfTextAtSize(n, 11) / 2, y: 80, size: 11, font: sansBold, color: INK });
    page.drawText(t, { x: cx - sans.widthOfTextAtSize(t, 9) / 2, y: 66, size: 9, font: sans, color: MUTED });
  });

  page.drawText(`Certificate ID: ${input.id}`, { x: 40, y: 38, size: 7.5, font: sans, color: MUTED });

  return pdf.save();
}

// ─── Uploaded templates ───────────────────────────────────────────────────────


export const CERT_BUCKET = "certificate-assets";

// Template and signature images are downloaded once per server instance.
const assetCache = new Map<string, Uint8Array>();

async function loadAsset(path: string): Promise<Uint8Array> {
  const cached = assetCache.get(path);
  if (cached) return cached;
  const { data, error } = await supabaseAdmin().storage.from(CERT_BUCKET).download(path);
  if (error || !data) throw new Error(`Could not load ${path}: ${error?.message || "missing"}`);
  const bytes = new Uint8Array(await data.arrayBuffer());
  if (assetCache.size > 40) assetCache.clear();
  assetCache.set(path, bytes);
  return bytes;
}

const PDF_FONTS: Record<FontName, SF> = {
  helvetica: SF.Helvetica,
  "helvetica-bold": SF.HelveticaBold,
  times: SF.TimesRoman,
  "times-bold": SF.TimesRomanBold,
  "times-italic": SF.TimesRomanItalic,
  courier: SF.Courier,
};

const hex = (c: string) => rgb(parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255);

export interface TemplateValues {
  name: string;
  uid: string;
  event: string;
  date: string;
  certid: string;
}

/** Draws the uploaded design full-page, then prints each field at its saved position. */
export async function renderTemplateCertificate(
  template: Pick<CertificateTemplate, "file_path" | "file_type" | "fields" | "name">,
  values: TemplateValues
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${template.name} - ${safe(values.name)}`);
  pdf.setAuthor("IEEE CIS CUSB");

  const bg = await loadAsset(template.file_path);
  const img = template.file_type === "image/png" ? await pdf.embedPng(bg) : await pdf.embedJpg(bg);
  const scale = 842 / Math.max(img.width, img.height); // longest side = A4 long side
  const W = img.width * scale;
  const H = img.height * scale;
  const page = pdf.addPage([W, H]);
  page.drawImage(img, { x: 0, y: 0, width: W, height: H });

  const fonts = new Map<FontName, PDFFont>();
  const font = async (name: FontName) => {
    if (!fonts.has(name)) fonts.set(name, await pdf.embedFont(PDF_FONTS[name]));
    return fonts.get(name)!;
  };

  for (const f of template.fields) {
    if (f.type === "signature") {
      if (!f.image_path) continue;
      const bytes = await loadAsset(f.image_path);
      const sig = f.image_path.endsWith(".png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const w = f.width * W;
      const h = (w * sig.height) / sig.width;
      page.drawImage(sig, { x: f.x * W - w / 2, y: H * (1 - f.y) - h / 2, width: w, height: h });
      continue;
    }

    const raw = f.type === "text" ? f.text || "" : values[f.type];
    const text = safe(raw);
    if (!raw.trim()) continue;
    const fnt = await font(f.font);
    let size = f.size * H;
    const maxW = f.max_width * W;
    while (size > 6 && fnt.widthOfTextAtSize(text, size) > maxW) size -= 0.5;
    const tw = fnt.widthOfTextAtSize(text, size);
    const x = f.align === "center" ? f.x * W - tw / 2 : f.align === "right" ? f.x * W - tw : f.x * W;
    // y is the vertical centre of the text; 0.35em below it is roughly the baseline.
    page.drawText(text, { x, y: H * (1 - f.y) - size * 0.35, size, font: fnt, color: hex(f.color) });
  }

  return pdf.save();
}
