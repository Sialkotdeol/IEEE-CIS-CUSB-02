import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import WalletVisibility from "@/components/badges/WalletVisibility";
import { getHolderByToken, siteOrigin } from "@/lib/badges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage your badge wallet · IEEE CIS CUSB", robots: { index: false, follow: false } };

export default async function ManageWalletPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const holder = await getHolderByToken(token);
  if (!holder) notFound();
  const walletUrl = `${await siteOrigin()}/badges/wallet/${holder.wallet_slug}`;
  return (
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Manage your wallet</p>
          <h1 className="text-3xl font-black">Hi, {holder.name.split(" ")[0]}</h1>
          <p className="text-slate-500 mt-2 mb-8">Choose whether anyone with your wallet link can see your badges.</p>
          <WalletVisibility token={token} initialPublic={holder.is_public} walletUrl={walletUrl} />
          <p className="text-xs text-slate-400 mt-8">
            This page is private to you — don&apos;t share its link. Individual badge pages you&apos;ve added to LinkedIn stay viewable so your credentials can still be verified.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
