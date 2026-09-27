import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getAdminSession } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Portal · IEEE CIS CUSB",
  robots: { index: false, follow: false },
};

// Signed-in pages get the sidebar shell. Signed-out visitors only ever see the login
// screen: every portal page calls requirePageAdmin(), which redirects them there.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      {session ? (
        <AdminShell email={session.email} name={session.name} role={session.role}>
          {children}
        </AdminShell>
      ) : (
        children
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}
