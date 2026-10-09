import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { generateNumericOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

// Map for active OTPs: email -> { otp, expiresAt }
declare global {
  // eslint-disable-next-line no-var
  var __crmOtpStore: Map<string, { otp: string; expiresAt: number }> | undefined;
}

if (!global.__crmOtpStore) {
  global.__crmOtpStore = new Map();
}
const otpStore = global.__crmOtpStore;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = crmStore.getUserByEmail(cleanEmail);

    // If user does not exist in demo database, auto-provision as AGENT (or ADMIN if email contains 'admin')
    if (!user) {
      user = crmStore.createUser({
        email: cleanEmail,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
        role: cleanEmail.includes('admin') ? 'ADMIN' : cleanEmail.includes('support') ? 'SUPPORT' : 'AGENT',
      });
    }

    const otp = generateNumericOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    otpStore.set(cleanEmail, { otp, expiresAt });

    // Send email / log in dev terminal
    await sendOtpEmail(cleanEmail, otp);

    return NextResponse.json({
      success: true,
      message: `Passcode sent to ${cleanEmail}`,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined, // included in response for ultra-fast local testing
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
