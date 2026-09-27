import { requirePageAdmin } from "@/lib/adminAuth";
import { REGISTRATION_SOURCES } from "@/lib/adminData";
import RegistrationsBrowser from "@/components/admin/RegistrationsBrowser";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage() {
  await requirePageAdmin();
  return <RegistrationsBrowser sources={Object.entries(REGISTRATION_SOURCES).map(([table, s]) => ({ table, label: s.label }))} />;
}
