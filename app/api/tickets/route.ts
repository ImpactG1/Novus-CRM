import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const tickets = crmStore.getTickets();
    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.leadId || !body.subject || !body.description) {
      return NextResponse.json(
        { error: 'Lead ID, subject, and description are required' },
        { status: 400 }
      );
    }

    const session = await getCurrentUser();
    const createdById = body.createdById || session?.id || crmStore.getUsers()[1].id;

    const ticket = crmStore.createTicket({
      ...body,
      createdById,
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
