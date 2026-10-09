import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    // In demo mode or if user has leads, find due reminders
    const dueLeads = crmStore.getDueReminders(session?.id, 30);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      count: dueLeads.length,
      dueLeads: dueLeads.map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        email: l.email,
        callbackDate: l.callbackDate,
        notes: l.notes,
        status: l.status?.name,
        assignedTo: l.assignedTo?.name,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
