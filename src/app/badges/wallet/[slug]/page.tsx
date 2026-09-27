import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import BadgeMedal from "@/components/badges/BadgeMedal";
import ShareActions from "@/components/badges/ShareActions";
import { getWallet, siteOrigin } from "@/lib/badges";
import { ISSUER, ISSUER_FULL, TIERS, nextTier, tierFor } from "@/lib/badgeShared";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const wallet = await getWallet((await params).slug);
  if (!wallet) return { title: "Wallet not found · IEEE CIS CUSB" };
  const title = `${wallet.name}'s badge wallet`;
  return {
    title: `${title} · ${ISSUER}`,
    description: `${wallet.awards.length} digital badge${wallet.awards.length === 1 ? "" : "s"} earned at ${ISSUER_FULL}.`,
    openGraph: { title, description: `${wallet.awards.length} badges from ${ISSUER}`, type: "profile" },
  };
}

export default async function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  const wallet = await getWallet((await params).slug);
  if (!wallet) notFound();
  const url = `${await siteOrigin()}/badges/wallet/${wallet.wallet_slug}`;
  const count = wallet.awards.length;
  const tier = tierFor(count);
  const next = nextTier(count);
  const since = new Date(wallet.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 text-center relative overflow-hidden mb-10">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{ISSUER} · Badge wallet</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{wallet.name}</h1>
            <p className="text-slate-500 mt-2">Member of the IEEE CIS community since {since}</p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-3xl font-black tabular-nums">{count}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Badge{count === 1 ? "" : "s"}</p>
              </div>
              {tier && (
                <div className="px-5 py-3 rounded-2xl border" style={{ borderColor: `${tier.color}40`, background: `${tier.color}0d` }}>
                  <p className="text-3xl font-black" style={{ color: tier.color }}>
                    {tier.name}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Level</p>
                </div>
              )}
            </div>
            {next && (
              <p className="text-sm text-slate-500 mt-4">
                {next.min - count} more to reach <span className="font-bold" style={{ color: next.color }}>{next.name}</span>
              </p>
            )}

            <div className="mt-8">
              <ShareActions url={url} shareLabel="Share wallet on LinkedIn" />
              <p className="text-xs text-slate-400 mt-3">Tip: add this link to the Featured section of your LinkedIn profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wallet.awards.map((a) => (
              <Link
                key={a.id}
                href={`/badges/${a.id}`}
                className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:border-primary/40 transition-all"
              >
                <BadgeMedal badge={a.badge} size={130} className="group-hover:scale-105 transition-transform" />
                <p className="font-bold text-sm mt-3 leading-snug">{a.badge.title}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(a.awarded_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-slate-500">
            <p className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Levels: {[...TIERS].reverse().map((t) => `${t.name} (${t.min}+)`).join(" · ")}
            </p>
            <p className="mt-2">
              <Link href="/badges" className="text-primary font-semibold hover:underline">
                About IEEE CIS CUSB badges
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
