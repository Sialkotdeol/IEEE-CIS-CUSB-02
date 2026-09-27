import { NextRequest } from "next/server";
import { adminRoute, ApiError, logActivity } from "@/lib/adminApi";
import { REGISTRATION_SOURCES, fetchAll, isRegistrationSource } from "@/lib/adminData";
import { csvResponse, toCsv } from "@/lib/csv";

// Registration tables: full rows (JSON or CSV), or just name/email pairs for certificates.
export const GET = adminRoute(async (session, req) => {
  const params = (req as NextRequest).nextUrl.searchParams;
  const table = params.get("table") || "";
  if (!isRegistrationSource(table)) throw new ApiError(400, "Unknown table");
  const cfg = REGISTRATION_SOURCES[table];

  if (params.get("fields") === "recipients") {
    const { rows, error } = await fetchAll<Record<string, string>>(table, `${cfg.name}, ${cfg.uid}, ${cfg.email}`);
    if (error) throw new ApiError(502, error);
    const seen = new Set<string>();
    const recipients = rows
      .map((r) => ({
        name: (r[cfg.name] || "").trim(),
        uid: (r[cfg.uid] || "").trim().toUpperCase(),
        email: (r[cfg.email] || "").trim().toLowerCase(),
      }))
      .filter((r) => r.name && r.email && !seen.has(r.email) && seen.add(r.email));
    return { recipients };
  }

  const { rows, error } = await fetchAll<Record<string, unknown>>(table);
  if (error) throw new ApiError(502, error);

  if (params.get("format") === "csv") {
    await logActivity(session, "registrations.export", { type: "table", id: table }, { rows: rows.length });
    return csvResponse(toCsv(rows), `${table}-${new Date().toISOString().slice(0, 10)}.csv`);
  }
  await logActivity(session, "registrations.view", { type: "table", id: table }, { rows: rows.length });
  return { rows };
});
