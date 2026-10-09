import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'crm-super-secret-dev-jwt-key-2026';
export const SESSION_COOKIE_NAME = 'crm_session';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'SUPPORT';
  avatarUrl?: string | null;
  phone?: string | null;
}

export function generateNumericOtp(): string {
  // 4-digit numeric OTP
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function signSessionToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySessionToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
