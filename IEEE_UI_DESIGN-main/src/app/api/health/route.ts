import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        supabase_url_set: !!process.env.SUPABASE_URL,
        supabase_key_set: !!process.env.SUPABASE_KEY,
        gmail_user_set: !!process.env.GMAIL_USER,
        gmail_pass_set: !!process.env.GMAIL_APP_PASSWORD,
        node_env: process.env.NODE_ENV || 'not set'
    });
}
