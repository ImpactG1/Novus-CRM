import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { leadIds, agentId } = await req.json();
    if (!Array.isArray(leadIds) || leadIds.length === 0 || !agentId) {
      return NextResponse.json({ error: 'leadIds array and agentId are required' }, { status: 400 });
    }

    const success = crmStore.bulkAssignLeads(leadIds, agentId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to assign leads or agent not found' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${leadIds.length} leads to agent`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
