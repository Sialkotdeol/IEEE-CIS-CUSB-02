import { z } from "zod";
import { adminRoute, check, logActivity, readJson, revalidatePublic } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Open/close applications, set or clear the deadline, change the tenure label.
const schema = z.object({
  open: z.boolean(),
  deadline: z.union([z.iso.datetime({ offset: true }), z.null()]),
  tenure: z.string().trim().min(1).max(40),
});

export const PUT = adminRoute(
  async (session, req) => {
    const value = schema.parse(await readJson(req));
    check(
      await supabaseAdmin()
        .from("site_settings")
        .upsert({ key: "recruitment", value, updated_at: new Date().toISOString(), updated_by: session.email })
    );
    await logActivity(session, value.open ? "recruitment.open" : "recruitment.close", { type: "settings", id: "recruitment" }, value);
    revalidatePublic("/call-for-positions");
    return { success: true };
  },
  { owner: true }
);
