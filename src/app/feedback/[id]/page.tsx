import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import type { FeedbackForm } from "@/lib/feedback";
import FeedbackFormClient from "@/components/dom/FeedbackFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Event feedback · IEEE CIS CUSB", robots: { index: false } };

export default async function PublicFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !isServiceRoleConfigured()) notFound();
  const { data } = await supabaseAdmin().from("feedback_forms").select("id, title, description, questions, is_open").eq("id", id).maybeSingle();
  if (!data) notFound();
  const form = data as Pick<FeedbackForm, "id" | "title" | "description" | "questions" | "is_open">;
  return <FeedbackFormClient form={form} />;
}
