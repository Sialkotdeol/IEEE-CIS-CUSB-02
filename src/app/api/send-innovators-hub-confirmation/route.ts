import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, type } = await request.json();

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


    let bodyText = '';
    if (type === 'Team') {
      bodyText = 'Your team registration for the CIS Innovators Hub has been successfully received! Our core team will evaluate your idea and reach out regarding the next steps for screening.';
    } else if (type === 'Individual_Match') {
      bodyText = 'Your individual registration for the CIS Innovators Hub has been successfully received! We will try our best to match you with teammates that align with your preferred domain.';
    } else if (type === 'Individual_Later') {
      bodyText = 'Your individual registration for the CIS Innovators Hub has been successfully received! Please remember to form your team before the upcoming deadline, after which we will automatically match you with a team.';
    } else {
      bodyText = 'Your registration for the CIS Innovators Hub has been successfully received!';
    }

    // Send the confirmation email
    await resend.emails.send({
      from: 'IEEE CIS CUSB <innovators@ieeeciscusb.site>',
      to: email,
      subject: '🚀 Welcome to CIS Innovators Hub!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
              CIS INNOVATORS HUB
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
              ${bodyText}
            </p>

            <!-- What's Next Section -->
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px;">
                The Journey Ahead
              </h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.7); line-height: 2;">
                <li>💡 <strong>Ideathon Screening</strong> — Best ideas and teams get shortlisted</li>
                <li>🤝 <strong>Mentorship</strong> — Build your project under expert guidance</li>
                <li>🚀 <strong>Hackathons</strong> — Compete nationally and internationally</li>
                <li>📄 <strong>Research</strong> — Convert projects into IEEE publications</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
              <a href="${baseUrl}/innovators-hub" 
                 style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                Return to Hub →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
              IEEE Computational Intelligence Society — Chandigarh University Student Branch
            </p>
            <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.2);">
              10 Teams. 10 Projects. One Vision — Innovation.
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
