import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, ShieldCheck, Wallet } from "lucide-react";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import BadgeMedal from "@/components/badges/BadgeMedal";
import ShareActions from "@/components/badges/ShareActions";
import { getPublicAward, siteOrigin } from "@/lib/badges";
import { ISSUER, ISSUER_FULL, linkedInAddUrl } from "@/lib/badgeShared";
import { getPastEvent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const award = await getPublicAward((await params).id);
  if (!award) return { title: "Badge not found · IEEE CIS CUSB" };
  const title = `${award.holder.name} earned the ${award.badge.title} badge`;
  return {
    title: `${title} · ${ISSUER}`,
    description: award.badge.description || `A digital badge issued by ${ISSUER_FULL}.`,
    openGraph: { title, description: `Issued by ${ISSUER_FULL}`, type: "website" },
  };
}

export default async function BadgeCredentialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const award = await getPublicAward(id);
  if (!award) notFound();
  const origin = await siteOrigin();
  const url = `${origin}/badges/${award.id}`;
  const event = award.badge.event_slug ? await getPastEvent(award.badge.event_slug) : null;
  const date = new Date(award.awarded_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified digital badge
          </div>
          <div className="flex justify-center mb-6">
            <BadgeMedal badge={award.badge} size={240} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{award.badge.title}</h1>
          <p className="text-lg text-slate-600 mt-2">
            Awarded to <span className="font-bold text-slate-900">{award.holder.name}</span>
          </p>
          {award.badge.description && <p className="text-slate-500 mt-4 max-w-md mx-auto">{award.badge.description}</p>}

          <dl className="grid sm:grid-cols-2 gap-3 text-left mt-8 mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" /> Issued by
              </dt>
              <dd className="font-semibold text-sm mt-1">{ISSUER_FULL}</dd>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Issued on
              </dt>
              <dd className="font-semibold text-sm mt-1">{date}</dd>
              {event && (
                <Link href={`/past-events/${award.badge.event_slug}`} className="text-xs font-semibold text-primary hover:underline">
                  About the event →
                </Link>
              )}
            </div>
          </dl>

          <ShareActions url={url} linkedInAddUrl={linkedInAddUrl({ title: award.badge.title, awardedAt: award.awarded_at, credentialUrl: url, credentialId: award.id })} />

          <Link href={`/badges/wallet/${award.holder.wallet_slug}`} className="inline-flex items-center gap-1.5 mt-6 text-sm font-bold text-primary hover:underline">
            <Wallet className="w-4 h-4" /> See all of {award.holder.name.split(" ")[0]}&apos;s badges
          </Link>
          <p className="text-[11px] text-slate-400 mt-6 font-mono">Credential ID: {award.id}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
