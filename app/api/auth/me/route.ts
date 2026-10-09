import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { crmStore } from '@/lib/store';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      // Default to Alexander Wright (Admin) or first user if no cookie for instant seamless preview
      const defaultUser = crmStore.getUsers()[0];
      return NextResponse.json({
        user: defaultUser,
        isDemoGuest: true,
      });
    }

    const fullUser = crmStore.getUserById(session.id) || session;
    return NextResponse.json({ user: fullUser, isDemoGuest: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
