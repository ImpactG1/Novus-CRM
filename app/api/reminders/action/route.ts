import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { leadId, action, minutes } = await req.json();

    if (!leadId || !action) {
      return NextResponse.json({ error: 'leadId and action are required' }, { status: 400 });
    }

    if (action === 'snooze') {
      const snoozeMinutes = Number(minutes) || 10;
      const updated = crmStore.snoozeReminder(leadId, snoozeMinutes);
      return NextResponse.json({
        success: true,
        message: `Reminder snoozed for ${snoozeMinutes} minutes`,
        lead: updated,
      });
    }

    if (action === 'done') {
      const updated = crmStore.clearReminder(leadId);
      return NextResponse.json({
        success: true,
        message: 'Reminder marked as done',
        lead: updated,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
