import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { sendQuotationEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const quote = crmStore.getQuotations().find((q) => q.id === params.id);
    if (!quote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const lead = crmStore.getLeadById(quote.leadId);
    const recipientEmail = lead?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Lead does not have an email address configured' }, { status: 400 });
    }

    const agent = crmStore.getUserById(quote.agentId);

    const result = await sendQuotationEmail({
      to: recipientEmail,
      cc: agent?.email,
      quotationNumber: quote.quotationNumber,
      subject: quote.subject,
      leadName: lead?.name || 'Valued Client',
      items: quote.items || [],
      subtotal: quote.subtotal,
      gstAmount: quote.gstAmount,
      grandTotal: quote.grandTotal,
      validTill: quote.validTill,
      terms: quote.termsConditions,
    });

    return NextResponse.json({
      success: true,
      message: `Quotation #${quote.quotationNumber} emailed to ${recipientEmail}`,
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
