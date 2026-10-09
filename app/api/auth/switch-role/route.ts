import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    const targetUser = crmStore.getUsers().find((u) => u.role === role) || crmStore.getUsers()[0];

    const token = signSessionToken({
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      avatarUrl: targetUser.avatarUrl,
      phone: targetUser.phone,
    });

    const response = NextResponse.json({ success: true, user: targetUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
