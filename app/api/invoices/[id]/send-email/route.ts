import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { sendInvoiceEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const inv = crmStore.getInvoices().find((i) => i.id === params.id);
    if (!inv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const lead = crmStore.getLeadById(inv.leadId);
    const recipientEmail = lead?.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Lead does not have an email address configured' }, { status: 400 });
    }

    const result = await sendInvoiceEmail({
      to: recipientEmail,
      invoiceNumber: inv.invoiceNumber,
      isGst: inv.isGst,
      leadName: lead?.name || 'Valued Client',
      items: inv.items || [],
      subtotal: inv.subtotal,
      gstAmount: inv.gstAmount,
      grandTotal: inv.grandTotal,
      paymentMode: inv.paymentMode,
      transactionId: inv.transactionId,
      status: inv.status,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice #${inv.invoiceNumber} emailed to ${recipientEmail}`,
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
