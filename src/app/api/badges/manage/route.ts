import { NextResponse } from "next/server";
import { z } from "zod";
import { getHolderByToken } from "@/lib/badges";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Public (token-protected): a badge holder shows or hides their own wallet.
export async function POST(req: Request) {
  const parsed = z.object({ token: z.string().regex(/^[0-9a-f]{48}$/), is_public: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const holder = await getHolderByToken(parsed.data.token);
  if (!holder) return NextResponse.json({ error: "This link is no longer valid" }, { status: 404 });
  const { error } = await supabaseAdmin().from("badge_holders").update({ is_public: parsed.data.is_public }).eq("id", holder.id);
  if (error) return NextResponse.json({ error: "Could not save. Please try again." }, { status: 502 });
  return NextResponse.json({ success: true });
}
