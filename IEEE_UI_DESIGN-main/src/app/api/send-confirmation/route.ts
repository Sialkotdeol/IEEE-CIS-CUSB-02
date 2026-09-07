import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ Missing RESEND_API_KEY in .env');
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);


    // Send the confirmation email
    await resend.emails.send({
      from: 'IEEE CIS CUSB <code-warriors@ieeeciscusb.site>',
      to: email,
      subject: '🎉 Welcome to Code Warriors — Registration Confirmed!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
              C1S C0DE WARR10RS
            </h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">
              IEEE CIS CUSB
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">
              Hey ${name}! 👋
            </h2>
            <p style="margin: 0 0 24px; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
              Your registration for <strong style="color: #6366f1;">Code Warriors</strong> has been confirmed! 
              You're now part of a peer-learning ecosystem focused on mastering DSA, building consistency, 
              and cracking technical placements.
            </p>

            <!-- What's Next Section -->
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">
                What's Next?
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.7); line-height: 2;">
                <li>📝 <strong>Daily POTD</strong> — Handpicked LeetCode problems every day</li>
                <li>🐛 <strong>Weekly Bug Bounties</strong> — Spot the flaw, claim the bragging rights</li>
                <li>🏆 <strong>Monthly Sprints</strong> — Virtual mock contests to sharpen your speed</li>
                <li>📚 <strong>Master DSA</strong> — From Arrays to Dynamic Programming</li>
              </ul>
            </div>

            <p style="margin: 0 0 32px; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
              <em>Stop brute-forcing your code from O(N²) to O(N log N). Learn how to optimize your logic.</em>
            </p>

            <!-- CTA Button -->
            <div style="text-align: center;">
              <a href="${baseUrl}/code-warriors" 
                 style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                Visit Code Warriors →
              </a>

            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
              IEEE Computational Intelligence Society — Chandigarh University Student Branch
            </p>
            <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.2);">
              Code Better. Think Smarter. Win Together.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
