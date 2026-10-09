import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const session = await getCurrentUser();
    const senderId = session?.id || crmStore.getUsers()[0].id;

    const newMsg = crmStore.addTicketMessage(params.id, senderId, message.trim());
    if (!newMsg) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: newMsg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
