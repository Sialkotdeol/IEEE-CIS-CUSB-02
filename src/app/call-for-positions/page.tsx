import type { Metadata } from "next";
import CallForPositionsClient from "@/components/positions/CallForPositionsClient";
import { getPositions, getRecruitmentSettings } from "@/lib/siteContent";

// Roles and open/closed state come from the admin portal; the portal revalidates
// this page on every change, and it also refreshes at least once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Call for Positions · IEEE CIS CUSB",
  description: "Apply to join the IEEE CIS Chandigarh University Student Branch core team.",
};

export default async function CallForPositionsPage() {
  const [positions, settings] = await Promise.all([getPositions(), getRecruitmentSettings()]);
  return <CallForPositionsClient positions={positions} settings={settings} />;
}
