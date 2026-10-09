import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const sales = crmStore.getSales();
    return NextResponse.json({ sales });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.leadId || !body.amount) {
      return NextResponse.json({ error: 'Lead ID and sale amount are required' }, { status: 400 });
    }

    const session = await getCurrentUser();
    const agentId = body.agentId || session?.id || crmStore.getUsers()[1].id;

    const sale = crmStore.createSale({
      ...body,
      agentId,
    });

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
