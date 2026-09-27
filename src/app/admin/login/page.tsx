import { redirect } from "next/navigation";
import { getAdminSession, isAdminConfigured } from "@/lib/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLoginForm configured={isAdminConfigured()} />;
}
