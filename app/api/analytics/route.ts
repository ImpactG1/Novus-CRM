import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const analytics = crmStore.getAnalytics();
    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
