import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            full_name, uid, email, phone,
            department, year_of_study, github_url,
            has_experience, reason
        } = body;

        if (!full_name || !uid || !email || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_KEY;

        if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment');
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const payload = JSON.stringify({
            full_name, uid, email, phone,
            department: department || null,
            year_of_study: year_of_study || null,
            github_url: github_url || null,
            has_experience: has_experience || null,
            reason: reason || null
        });

        const res = await fetch(`${SUPABASE_URL}/rest/v1/contribute_x_registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: payload
        });

        if (res.ok || res.status === 201) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        let errorMsg = 'Registration failed';
        try {
            const data = await res.json();
            errorMsg = data.message || data.msg || JSON.stringify(data);
        } catch (e) {
            errorMsg = await res.text() || errorMsg;
        }

        return NextResponse.json({ error: errorMsg }, { status: res.status || 400 });

    } catch (error: any) {
        console.error('❌ Registration error:', error.message);
        return NextResponse.json({ error: 'Failed to register. Please try again later.' }, { status: 500 });
    }
}
