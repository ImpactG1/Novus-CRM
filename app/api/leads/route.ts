import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const statusId = searchParams.get('statusId') || undefined;
    const typeId = searchParams.get('typeId') || undefined;
    const assignedToId = searchParams.get('assignedToId') || undefined;

    const leads = crmStore.getLeads({ search, statusId, typeId, assignedToId });
    const statuses = crmStore.getStatuses();
    const types = crmStore.getTypes();
    const agents = crmStore.getUsers().filter((u) => u.role === 'AGENT' || u.role === 'ADMIN');

    return NextResponse.json({
      leads,
      statuses,
      types,
      agents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Check duplicate phone
    const existing = crmStore.getLeads().find((l) => l.phone.replace(/\D/g, '') === body.phone.replace(/\D/g, ''));
    if (existing) {
      return NextResponse.json(
        { error: `A lead with phone number ${body.phone} already exists (${existing.name})` },
        { status: 409 }
      );
    }

    const newLead = crmStore.createLead(body);
    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
