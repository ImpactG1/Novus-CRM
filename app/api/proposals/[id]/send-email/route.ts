import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { sendProposalEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const proposal = crmStore.getProposals().find((p) => p.id === params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const lead = crmStore.getLeadById(proposal.leadId);
    const recipientEmail = lead?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Lead does not have an email address configured' }, { status: 400 });
    }

    const result = await sendProposalEmail({
      to: recipientEmail,
      title: proposal.title,
      leadName: lead?.name || 'Valued Client',
      offer: proposal.offer,
      message: proposal.message,
      slabsData: proposal.slabsData,
      packagesData: proposal.packagesData,
    });

    return NextResponse.json({
      success: true,
      message: `Proposal "${proposal.title}" emailed to ${recipientEmail}`,
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
