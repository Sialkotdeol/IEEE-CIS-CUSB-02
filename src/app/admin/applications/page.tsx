import { requirePageAdmin } from "@/lib/adminAuth";
import { APPLICATION_STATUSES, getApplicationsWithScores } from "@/lib/adminData";
import { getPositions } from "@/lib/siteContent";
import ApplicationsBoard from "@/components/admin/ApplicationsBoard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePageAdmin();
  const [{ applications, error }, positions, { status }] = await Promise.all([
    getApplicationsWithScores(),
    getPositions({ includeInactive: true }),
    searchParams,
  ]);
  return (
    <ApplicationsBoard
      applications={applications}
      roles={Object.fromEntries(positions.map((p) => [p.id, p.title]))}
      statuses={[...APPLICATION_STATUSES]}
      initialStatus={status}
      loadError={error}
    />
  );
}
