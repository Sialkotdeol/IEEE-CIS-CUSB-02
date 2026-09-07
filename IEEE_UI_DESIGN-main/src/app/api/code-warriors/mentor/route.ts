import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type MentorApplication } from "@/lib/codeWarriorsDb";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, uid, department, year, leetcode_handle, linkedin, resume_link, experience, mobile } = body;

    if (!name || !email || !uid || !department || !year || !leetcode_handle || !resume_link || !experience || !mobile) {
      return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
    }

    const newApplication: MentorApplication = {
      id: "mntr-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      uid,
      department,
      year,
      mobile,
      resume_link,
      experience,
      linkedin: linkedin || "",
      leetcode_handle,
      created_at: new Date().toISOString()
    };

    const saved = await codeWarriorsDb.saveMentorApplication(newApplication);

    // Send confirmation email (fire-and-forget, don't block registration success)
    try {
      if (resend) {
        await resend.emails.send({
          from: 'IEEE CIS CUSB <code-warriors@ieeeciscusb.site>',
          to: email,
          subject: '✅ Mentor Application Received — Code Warriors',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">C1S C0DE WARR10RS</h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">IEEE CIS CUSB</p>
              </div>
              <div style="padding: 40px 32px;">
                <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Hello ${name},</h2>
                <p style="margin: 0 0 24px; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                  We have successfully received your application to become a mentor for <strong style="color: #6366f1;">Code Warriors</strong>!
                </p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <h3 style="margin: 0 0 16px; font-size: 16px; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">Application Status: Under Review</h3>
                  <p style="margin: 0; color: rgba(255,255,255,0.7); line-height: 1.6;">
                    Our team will review your profile, resume, and past mentoring experience. If your profile aligns with our requirements, we will reach out to you soon with further details.
                  </p>
                </div>
                <p style="margin: 0 0 32px; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
                  <em>Thank you for stepping up to guide the next generation of problem solvers!</em>
                </p>
              </div>
              <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                  &copy; ${new Date().getFullYear()} IEEE CIS Student Branch, CUSB. All rights reserved.
                </p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Failed to send mentor application confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, application: saved });
  } catch (error: any) {
    console.error("Mentor application error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apps = await codeWarriorsDb.getMentorApplications();
    return NextResponse.json({ success: true, applications: apps });
  } catch (error: any) {
    console.error("Error fetching mentor applications:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
