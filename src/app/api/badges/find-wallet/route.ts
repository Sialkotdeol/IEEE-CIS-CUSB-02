import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { siteOrigin } from "@/lib/badges";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";

// Public: email someone the link to their badge wallet. Always answers the same way,
// so it can't be used to check whether an email has badges.

const WINDOW_MS = 15 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, { count: number; first: number }>();
const FROM = process.env.BADGE_FROM_EMAIL || "IEEE CIS CUSB <badges@ieeeciscusb.site>";
const OK = { message: "If that email has badges, we've sent the wallet link to it." };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const h = hits.get(ip);
  if (h && Date.now() - h.first < WINDOW_MS && h.count >= MAX) {
    return NextResponse.json({ error: "Too many requests. Try again in 15 minutes." }, { status: 429 });
  }
  hits.set(ip, !h || Date.now() - h.first >= WINDOW_MS ? { count: 1, first: Date.now() } : { ...h, count: h.count + 1 });

  const parsed = z.object({ email: z.email().trim().toLowerCase() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (!isServiceRoleConfigured() || !process.env.RESEND_API_KEY) return NextResponse.json(OK);

  const { data: holder } = await supabaseAdmin().from("badge_holders").select("name, wallet_slug, manage_token, is_public").eq("email", parsed.data.email).maybeSingle();
  if (holder) {
    const origin = await siteOrigin();
    const url = `${origin}/badges/wallet/${holder.wallet_slug}`;
    const manageUrl = `${origin}/badges/manage/${holder.manage_token}`;
    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: FROM,
        to: parsed.data.email,
        subject: "Your IEEE CIS CUSB badge wallet",
        html: `<p>Hi ${holder.name.replace(/[<>&]/g, "")},</p>
<p>Here's your badge wallet — share it anywhere, including LinkedIn:</p><p><a href="${url}">${url}</a></p>
${holder.is_public ? "" : "<p><b>Your wallet is currently private.</b> Make it public from the manage page below to share it.</p>"}
<p>Show or hide your wallet: <a href="${manageUrl}">manage your wallet</a> (this link is just for you — don't share it).</p>
<p>— Team IEEE CIS CUSB</p>`,
      });
    } catch (err) {
      console.error("❌ Wallet link email failed:", err);
    }
  }
  return NextResponse.json(OK);
}
