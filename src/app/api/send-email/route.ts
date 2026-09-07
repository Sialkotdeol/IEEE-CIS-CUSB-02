import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { full_name, email } = body;

        if (!full_name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!process.env.RESEND_API_KEY) {
            console.error('❌ Missing RESEND_API_KEY in .env');
            return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
        }

        const htmlBody = `
<div style="font-family:'Segoe UI',Arial,sans-serif;width:100%;margin:0 auto;background:#ffffff">
  <div style="padding:16px 28px;font-size:14px;line-height:1.6;color:#222">
    <p style="margin:0 0 10px">Dear <strong>${full_name}</strong>,</p>
    <p style="margin:0 0 8px">Warm greetings from <strong>IEEE Computational Intelligence Society – Chandigarh University Student Branch (IEEE CIS CUSB)</strong>.</p>
    <p style="margin:0 0 8px">Thank you for registering for <strong>Contribute-X: Open Source Bootcamp &amp; Contribution Challenge</strong> organized by IEEE Computational Intelligence Society (IEEE CIS) Chandigarh University Student Branch in collaboration with IEEE Robotics &amp; Automation Society (IEEE RAS) Chandigarh University Student Branch.</p>
    <p style="margin:0 0 8px">Please note that this email <strong>cannot</strong> be used for applying Duty Leave (DL). This communication is being issued strictly as part of the Standard Operating Procedure (SOP) of the event to avoid any confusion related to the recommendation and approval of Duty Leave.</p>
    <p style="margin:0 0 8px">The Open Source Bootcamp &amp; Contribution Challenge (Contribute-X) is scheduled to be held in <strong>A1 Seminar Hall</strong> on <strong>6th March 2026 (Offline Mode)</strong>. All registered participants are required to be present during the event in order to validate their participation in this structured open source immersion program.</p>
    <p style="margin:0 0 8px"><strong>Participants must carry their own laptop to the event</strong>, as it is essential for the hands-on GitHub contribution sprint during Phase II.</p>
    <p style="margin:0 0 4px">The event will consist of two structured phases:</p>
    <p style="margin:0 0 2px;padding-left:14px"><strong>Phase I</strong> – Open Source Masterclass (Conceptual + Live Demonstration)</p>
    <p style="margin:0 0 10px;padding-left:14px"><strong>Phase II</strong> – Live Contribution Challenge (Hands-on GitHub Contribution Sprint)</p>
    <p style="margin:0 0 4px">To ensure smooth coordination and timely updates, all participants are requested to join the official WhatsApp group:</p>
    <p style="margin:0 0 10px"><strong>WhatsApp Group Link:</strong> <a href="https://chat.whatsapp.com/CjtbG1fme66K0XYJp6Dg4b?mode=hqctcla" style="color:#0066cc">https://chat.whatsapp.com/CjtbG1fme66K0XYJp6Dg4b</a></p>
    <hr style="border:none;border-top:1px solid #ddd;margin:10px 0">
    <p style="margin:0 0 6px"><strong>Duty Leave Instructions (Important)</strong></p>
    <p style="margin:0 0 6px">Participants who wish to apply for Duty Leave (DL) must complete the following steps before coming to the event:</p>
    <p style="margin:0 0 4px;padding-left:14px"><strong>1.</strong> Download and print the Duty Leave document: <a href="https://drive.google.com/file/d/1ZyuZXPEvul3nMBU2LrOCX7bjbaBVMA8o/view?usp=sharing" style="color:#0066cc">Download DL Document</a></p>
    <p style="margin:0 0 4px;padding-left:14px"><strong>2.</strong> Fill in the required details.</p>
    <p style="margin:0 0 4px;padding-left:14px"><strong>3.</strong> Get the document signed by your respective higher/concerned departmental authority prior to the event date.</p>
    <p style="margin:0 0 8px;padding-left:14px"><strong>4.</strong> While getting the document signed, you may show this email as a reference for event verification.</p>
    <p style="margin:0 0 8px">Kindly ensure that the document is signed in advance. The organizing team will not be responsible for any delay or rejection of Duty Leave due to incomplete or unsigned documents.</p>
    <p style="margin:0 0 8px">After attending the event, an official attendance confirmation email will be issued from our side. Participants must then proceed with the Post VDL process strictly according to their respective departmental guidelines.</p>
    <p style="margin:0 0 8px">All participants are requested to strictly adhere to the above instructions to avoid any inconvenience at later stages.</p>
    <p style="margin:0 0 8px">We look forward to your active participation in building a strong open source culture within the university.</p>
    <p style="margin:0 0 10px">For any queries or further clarification, feel free to contact the organizing team.</p>
    <p style="margin:12px 0 2px">Warm regards,</p>
    <p style="margin:0"><strong>Angadveer Singh Deol</strong></p>
    <p style="margin:0;color:#555;font-size:13px">Web Master, IEEE CIS CUSB | +91 9115161551</p>
    <p style="margin:10px 0 2px"><em>Best regards,</em> <strong>IEEE CIS CUSB</strong></p>
  </div>
</div>`;

        await resend.emails.send({
            from: 'IEEE CIS CUSB <contribute-x@ieeeciscusb.site>',
            to: email,
            subject: 'CONTRIBUTE-X 2026 — Registration Confirmed',
            html: htmlBody,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('❌ Email error:', error.message);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
