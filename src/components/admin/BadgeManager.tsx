"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus } from "lucide-react";
import { api, Button, Card, EmptyState, PageHeader, run } from "@/components/admin/ui";
import BadgeMedal from "@/components/badges/BadgeMedal";
import BadgeForm from "@/components/admin/BadgeForm";
import type { Badge } from "@/lib/badgeShared";

export default function BadgeManager({
  badges,
  events,
  holderCount,
}: {
  badges: (Badge & { awarded: number })[];
  events: { slug: string; title: string }[];
  holderCount: number;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Badges"
        description={`One digital badge per event, made from the event poster. Everyone who earns one gets a public wallet they can share on LinkedIn. ${holderCount} wallet${holderCount === 1 ? "" : "s"} so far.`}
        actions={
          <>
            <a href="/badges" target="_blank" rel="noopener noreferrer">
              <Button>
                Public badges page <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> New badge
            </Button>
          </>
        }
      />

      {creating && (
        <Card className="p-5 mb-6 border-primary/40">
          <BadgeForm
            initial={{ title: "", event_slug: "", description: "", image_path: null, image_url: null, focus_x: 0.5, focus_y: 0.5, zoom: 1 }}
            events={events}
            submitLabel="Create badge"
            onCancel={() => setCreating(false)}
            onSubmit={async (d) => {
              const res = await run(() => api<{ id: string }>("/api/admin/badges", { method: "POST", body: { action: "create", ...d, image_url: undefined } }), "Badge created");
              if (res) router.push(`/admin/badges/${res.id}`);
            }}
          />
        </Card>
      )}

      {badges.length === 0 && !creating ? (
        <Card>
          <EmptyState title="No badges yet">Create one for your next (or last) event and award it to participants.</EmptyState>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((b) => (
            <Link key={b.id} href={`/admin/badges/${b.id}`}>
              <Card className="p-5 flex flex-col items-center text-center hover:border-primary/40 transition-colors h-full">
                <BadgeMedal badge={b} size={130} />
                <p className="font-bold mt-3">{b.title}</p>
                <p className="text-xs text-slate-500">
                  {b.awarded} awarded{b.event_slug ? ` · ${events.find((e) => e.slug === b.event_slug)?.title || b.event_slug}` : ""}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
