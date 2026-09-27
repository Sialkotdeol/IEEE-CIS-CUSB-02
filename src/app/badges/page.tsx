import type { Metadata } from "next";
import { Award, Share2, Wallet } from "lucide-react";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import BadgeMedal from "@/components/badges/BadgeMedal";
import FindWallet from "@/components/badges/FindWallet";
import { getAllBadges } from "@/lib/badges";
import { ISSUER, TIERS } from "@/lib/badgeShared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Digital badges · ${ISSUER}`,
  description: "Earn a digital badge for every IEEE CIS CUSB event you take part in, and show them off on LinkedIn.",
};

export default async function BadgesLanding() {
  const badges = await getAllBadges();
  const steps = [
    { icon: Award, title: "Take part", text: "Join an IEEE CIS CUSB event, workshop or programme." },
    { icon: Wallet, title: "Earn a badge", text: "Every event has its own badge. It lands in your personal wallet." },
    { icon: Share2, title: "Show it off", text: "Add badges to your LinkedIn profile or share your wallet link." },
  ];
  return (
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Award size={14} className="text-primary" /> Recognition
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Digital <span className="gaming-text-gradient">Badges</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              One badge for every event you&apos;re part of. Collect them in your wallet and show the world your journey with IEEE CIS CUSB.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-14">
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-lg">{title}</h2>
                <p className="text-sm text-slate-500 mt-1">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-6 sm:p-8 max-w-xl mx-auto mb-16 text-center">
            <h2 className="text-2xl font-black">Find your wallet</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">Enter the email you registered with and we&apos;ll send you your wallet link.</p>
            <FindWallet />
          </div>

          {badges.length > 0 && (
            <>
              <h2 className="text-3xl font-black text-center mb-8">Badges you can earn</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-14">
                {badges.map((b) => (
                  <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
                    <BadgeMedal badge={b} size={130} />
                    <p className="font-bold text-sm mt-3">{b.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {b.awarded} holder{b.awarded === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-black mb-4">Level up</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[...TIERS].reverse().map((t) => (
                <div key={t.name} className="px-5 py-3 rounded-2xl border bg-white" style={{ borderColor: `${t.color}40` }}>
                  <p className="font-black" style={{ color: t.color }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.min}+ badge{t.min === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
