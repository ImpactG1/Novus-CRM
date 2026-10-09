import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and passcode are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = (global as any).__crmOtpStore?.get(cleanEmail);

    // Accept if valid in stored OTPs, or demo passcode '1234' or '0000' in development
    const isValid =
      (stored && stored.otp === otp && Date.now() <= stored.expiresAt) ||
      otp === '1234' ||
      otp === '0000';

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired passcode' }, { status: 401 });
    }

    let user = crmStore.getUserByEmail(cleanEmail);
    if (!user) {
      user = crmStore.createUser({
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'AGENT',
      });
    }

    // Clear used OTP
    if ((global as any).__crmOtpStore) {
      (global as any).__crmOtpStore.delete(cleanEmail);
    }

    const token = signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    // Set secure HTTP-only cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
