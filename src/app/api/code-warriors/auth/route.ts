import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Profile } from "@/lib/codeWarriorsDb";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null as any;

// Simple password hashing using SHA-256 + a salt (no bcrypt needed, no extra deps)
const hashPassword = (password: string): string => {
  const salt = "ieee-cw-2024-salt"; // static salt — good enough for this app
  return crypto.createHash("sha256").update(salt + password).digest("hex");
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Strip password_hash before sending profile to client
const safeProfile = (profile: Profile) => {
  const { password_hash, ...safe } = profile as any;
  return safe;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    if (action === "login") {
      const { email: rawEmail, password: rawPassword } = body;
      const email = typeof rawEmail === "string" ? rawEmail.trim() : rawEmail;
      const password = typeof rawPassword === "string" ? rawPassword.trim() : rawPassword;

      if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
      }

      const profile = await codeWarriorsDb.getProfileByEmail(email);

      if (!profile) {
        return NextResponse.json({ message: "No account found with that email. Please register first." }, { status: 404 });
      }

      // If profile has no password yet (legacy accounts), allow any password and set it now
      if (!profile.password_hash) {
        const updated = await codeWarriorsDb.saveProfile({
          ...profile,
          password_hash: hashPassword(password)
        });
        return NextResponse.json({ profile: safeProfile(updated) });
      }

      if (!verifyPassword(password, profile.password_hash)) {
        return NextResponse.json({ message: "Incorrect password. Please try again." }, { status: 401 });
      }

      return NextResponse.json({ profile: safeProfile(profile) });
    }

    // ─── REGISTER ─────────────────────────────────────────────────────────────
    if (action === "register") {
      const { name, email, password, uid, department, year, leetcode, linkedin, college, section, referred_by, mobile } = body;

      if (!name || !email || !password || !uid || !department || !year || !leetcode) {
        return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
      }

      // Check if email or handle already taken
      const existingEmailProfile = await codeWarriorsDb.getProfileByEmail(email);
      const existingHandleProfile = await codeWarriorsDb.getProfileByHandle(leetcode);

      const emailExists = !!existingEmailProfile;
      const handleExists = !!existingHandleProfile;

      if (emailExists) {
        return NextResponse.json({ message: "Email already registered." }, { status: 400 });
      }
      if (handleExists) {
        return NextResponse.json({ message: "This LeetCode username is already registered." }, { status: 400 });
      }

      // Validate handle exists on LeetCode and pull stats
      let cw_rating = 0;
      let cw_max_rating = 0;
      let rank = "Unrated";
      let max_rank = "Unrated";
      let fetchedTotalSolved = 0;

      try {
        const lcRes = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                  username
                }
              }
            `,
            variables: { username: leetcode }
          })
        });

        if (lcRes.ok) {
          const lcData = await lcRes.json();
          if (!lcData.data?.matchedUser) {
            return NextResponse.json({ message: `LeetCode username "${leetcode}" not found. Please double-check it.` }, { status: 400 });
          }
        }
      } catch (err) {
        console.warn("LeetCode API unreachable during registration:", err);
      }

      const newProfile: Profile = {
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        uid,
        department,
        year,
        leetcode_handle: leetcode,
        linkedin_profile: linkedin || "",
        cw_rating,
        cw_max_rating,
        rank,
        max_rank,
        current_streak: 0,
        max_streak: 0,
        quests_solved: fetchedTotalSolved,
        is_admin: ["admin@ieee.org", "deol@ieee.org", "ieeeciscusb.webmaster@gmail.com"].includes(email.toLowerCase()),
        created_at: new Date().toISOString(),
        college: college || "CUSB",
        section: section || "A",
        referred_by: referred_by || "",
        mobile: mobile || "",
        password_hash: hashPassword(password)
      };

      const saved = await codeWarriorsDb.saveProfile(newProfile);

      // Save to code_warriors_registrations table
      try {
        await supabase.from("code_warriors_registrations").insert([{
          name,
          email,
          uid,
          department,
          year,
          leetcode_handle: leetcode,
          linkedin_profile: linkedin,
          college,
          section,
          referred_by,
          mobile,
          created_at: new Date().toISOString()
        }]);
      } catch (regErr) {
        console.warn("Failed to insert into code_warriors_registrations:", regErr);
      }

      // Send confirmation email (fire-and-forget, don't block registration success)
      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'IEEE CIS CUSB <code-warriors@ieeeciscusb.site>',
            to: email,
            subject: '🎉 Welcome to Code Warriors — Registration Confirmed!',
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">C1S C0DE WARR10RS</h1>
                  <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">IEEE CIS CUSB</p>
                </div>
                <div style="padding: 40px 32px;">
                  <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Hey ${name}! 👋</h2>
                  <p style="margin: 0 0 24px; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                    Your registration for <strong style="color: #6366f1;">Code Warriors</strong> has been confirmed! 
                    You're now part of a peer-learning ecosystem focused on mastering DSA, building consistency, 
                    and cracking technical placements.
                  </p>
                  <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
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
                  <div style="text-align: center;">
                    <a href="https://ieee-cis-cusb.vercel.app/code-warriors" 
                       style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                      Visit Code Warriors →
                    </a>
                  </div>
                </div>
                <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">IEEE Computational Intelligence Society — Chandigarh University Student Branch</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.2);">Code Better. Think Smarter. Win Together.</p>
                </div>
              </div>
            `,
          });
          console.log(`✅ Confirmation email sent to ${email}`);
        } else {
          console.warn("⚠️ Resend credentials not configured. Skipping confirmation email.");
        }
      } catch (emailErr) {
        console.warn("Confirmation email failed (non-blocking):", emailErr);
      }

      return NextResponse.json({ profile: safeProfile(saved) });
    }

    // ─── ADMIN RESET PASSWORD ─────────────────────────────────────────────────
    if (action === "admin_reset_password") {
      const { userId, newPassword, adminId } = body;

      if (!userId || !newPassword || !adminId) {
        return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
      }

      // Verify the requester is actually an admin
      const profiles = await codeWarriorsDb.getProfiles();
      const adminProfile = profiles.find((p: Profile) => p.id === adminId);
      if (!adminProfile?.is_admin) {
        return NextResponse.json({ message: "Unauthorized. Only admins can reset passwords." }, { status: 403 });
      }

      const targetProfile = profiles.find((p: Profile) => p.id === userId);
      if (!targetProfile) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      const updated = await codeWarriorsDb.saveProfile({
        ...targetProfile,
        password_hash: hashPassword(newPassword)
      });

      return NextResponse.json({ message: "Password reset successfully.", profile: safeProfile(updated) });
    }

    // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
    if (action === "forgot_password") {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ message: "Email is required." }, { status: 400 });
      }

      const profile = await codeWarriorsDb.getProfileByEmail(email);

      if (!profile) {
        return NextResponse.json({ message: "If an account with that email exists, we sent a password reset link." });
      }

      if (!process.env.JWT_SECRET) {
         return NextResponse.json({ message: "Server configuration error: JWT_SECRET missing." }, { status: 500 });
      }

      const token = jwt.sign({ userId: profile.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const host = req.headers.get("host") || "localhost:3000";
      const resetLink = `${protocol}://${host}/code-warriors/reset-password?token=${token}`;

      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'IEEE CIS CUSB <code-warriors@ieeeciscusb.site>',
            to: email,
            subject: 'Code Warriors — Password Reset Request',
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">C1S C0DE WARR10RS</h1>
                </div>
                <div style="padding: 40px 32px;">
                  <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Password Reset Request</h2>
                  <p style="margin: 0 0 24px; font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                    We received a request to reset your password. Click the button below to choose a new one. This link will expire in 15 minutes.
                  </p>
                  <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                      Reset Password →
                    </a>
                  </div>
                  <p style="margin: 0 0 32px; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              </div>
            `
          });
        } catch (e) {
          console.error("Failed to send reset email:", e);
        }
      }

      return NextResponse.json({ message: "If an account with that email exists, we sent a password reset link." });
    }

    // ─── VERIFY RESET TOKEN ──────────────────────────────────────────────────
    if (action === "verify_reset_token") {
      const { token } = body;
      
      if (!token) {
        return NextResponse.json({ valid: false, message: "Token is required." }, { status: 400 });
      }

      if (!process.env.JWT_SECRET) {
         return NextResponse.json({ valid: false, message: "Server configuration error." }, { status: 500 });
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return NextResponse.json({ valid: true });
      } catch (err) {
        return NextResponse.json({ valid: false, message: "Invalid or expired token." }, { status: 400 });
      }
    }

    // ─── RESET PASSWORD WITH TOKEN ─────────────────────────────────────────────
    if (action === "reset_password_with_token") {
      const { token, newPassword } = body;
      
      if (!token || !newPassword) {
        return NextResponse.json({ message: "Token and new password are required." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
      }

      if (!process.env.JWT_SECRET) {
         return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
      }

      const profiles = await codeWarriorsDb.getProfiles();
      const targetProfile = profiles.find((p: Profile) => p.id === decoded.userId);

      if (!targetProfile) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      const updated = await codeWarriorsDb.saveProfile({
        ...targetProfile,
        password_hash: hashPassword(newPassword)
      });

      return NextResponse.json({ message: "Password reset successfully.", profile: safeProfile(updated) });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("Auth API error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

// Helper: convert platform rating & stats to Warrior rank label
function getPlatformRank(rating: number, solved: number, streak: number): string {
  if (rating >= 2000 && solved >= 200 && streak >= 100) return "Legend";
  if (rating >= 1000 && solved >= 100 && streak >= 60) return "Champion";
  if (rating >= 600 && solved >= 60 && streak >= 30) return "Knight";
  if (rating >= 300 && solved >= 30 && streak >= 14) return "Elite Warrior";
  if (rating >= 150 && solved >= 15 && streak >= 7) return "Warrior";
  if (rating >= 50 && solved >= 5 && streak >= 3) return "Apprentice";
  if (rating > 0 || solved > 0) return "Novice";
  return "Unrated";
}
