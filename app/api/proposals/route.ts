import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const proposals = crmStore.getProposals();
    return NextResponse.json({ proposals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.leadId || !body.title) {
      return NextResponse.json({ error: 'Lead ID and proposal title are required' }, { status: 400 });
    }

    const session = await getCurrentUser();
    const agentId = body.agentId || session?.id || crmStore.getUsers()[1].id;

    const proposal = crmStore.createProposal({
      ...body,
      agentId,
    });

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
