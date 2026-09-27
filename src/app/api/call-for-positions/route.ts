import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isApplicationWindowOpen } from '@/data/positions';
import { getPositions, getRecruitmentSettings } from '@/lib/siteContent';

const optionalUrl = z
    .union([z.url({ protocol: /^https?$/ }), z.literal('')])
    .optional()
    .transform((v) => v || null);

const applicationSchema = z
    .object({
        full_name: z.string().trim().min(2, 'Please enter your full name').max(100),
        uid: z.string().trim().min(4, 'Please enter a valid UID').max(20).transform((v) => v.toUpperCase()),
        email: z.email('Please enter a valid email').trim().toLowerCase(),
        phone: z.string().trim().regex(/^\+?[0-9\s-]{10,15}$/, 'Please enter a valid phone number'),
        department: z.string().trim().min(2, 'Please enter your department').max(100),
        year_of_study: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']),
        is_ieee_member: z.boolean(),
        ieee_member_id: z.string().trim().max(20).optional().transform((v) => v || null),
        first_preference: z.string().regex(/^[a-z0-9-]+$/, 'Please choose a role'),
        second_preference: z.union([z.string().regex(/^[a-z0-9-]+$/), z.literal('')]).optional().transform((v) => v || null),
        why_this_role: z.string().trim().min(50, 'Tell us a bit more about why you want this role (min 50 characters)').max(2000),
        relevant_experience: z.string().trim().min(20, 'Please describe your relevant experience (min 20 characters)').max(2000),
        hours_per_week: z.enum(['2-4', '4-6', '6-8', '8+']),
        linkedin_url: optionalUrl,
        portfolio_url: optionalUrl,
        resume_url: optionalUrl,
    })
    .refine((d) => d.second_preference !== d.first_preference, {
        message: 'Second preference must be different from your first preference',
        path: ['second_preference'],
    });

// Public: whether applications are open (used by the home-page popup).
export async function GET() {
    const settings = await getRecruitmentSettings();
    return NextResponse.json(
        { open: isApplicationWindowOpen(settings), deadline: settings.deadline, tenure: settings.tenure },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
}

export async function POST(req: Request) {
    // Open/closed, deadline and roles are managed from the admin portal.
    const [settings, positions] = await Promise.all([getRecruitmentSettings(), getPositions()]);
    if (!isApplicationWindowOpen(settings)) {
        return NextResponse.json({ error: 'Applications are closed.' }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? 'form');
            if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return NextResponse.json({ error: 'Please fix the highlighted fields', fieldErrors }, { status: 400 });
    }

    const activeRoles = new Set(positions.map((p) => p.id));
    const roleErrors: Record<string, string> = {};
    if (!activeRoles.has(parsed.data.first_preference)) roleErrors.first_preference = 'This role is no longer open';
    if (parsed.data.second_preference && !activeRoles.has(parsed.data.second_preference)) {
        roleErrors.second_preference = 'This role is no longer open';
    }
    if (Object.keys(roleErrors).length) {
        return NextResponse.json({ error: 'Please pick a role that is still open', fieldErrors: roleErrors }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('❌ Missing SUPABASE_URL / SUPABASE_KEY in environment');
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/position_applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(parsed.data)
        });

        if (res.ok) {
            return NextResponse.json({ success: true }, { status: 201 });
        }

        const data = await res.json().catch(() => null);
        if (res.status === 409 || data?.code === '23505') {
            return NextResponse.json(
                { error: 'An application with this UID has already been submitted. Contact ieeeciscusb@gmail.com if you need to make changes.' },
                { status: 409 }
            );
        }

        console.error('❌ Supabase insert failed:', res.status, data);
        return NextResponse.json({ error: 'Could not save your application. Please try again.' }, { status: 502 });
    } catch (error) {
        console.error('❌ Position application error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
    }
}
