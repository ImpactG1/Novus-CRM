import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const quotations = crmStore.getQuotations();
    return NextResponse.json({ quotations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.leadId || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Lead ID and at least one item are required' }, { status: 400 });
    }

    const session = await getCurrentUser();
    const agentId = body.agentId || session?.id || crmStore.getUsers()[1].id;

    // Calculate subtotal, GST (18%), and Grand Total
    let subtotal = 0;
    let gstAmount = 0;

    const items = body.items.map((item: any) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const rate = Number(item.rate) || 0;
      const taxRate = Number(item.taxRate) || 18;
      const taxable = qty * rate;
      const gst = (taxable * taxRate) / 100;
      const total = taxable + gst;

      subtotal += taxable;
      gstAmount += gst;

      return {
        description: item.description || 'Custom Service Item',
        quantity: qty,
        rate,
        taxRate,
        taxable,
        gstAmount: gst,
        total,
      };
    });

    const discount = Number(body.discount) || 0;
    const finalSubtotal = Math.max(0, subtotal - discount);
    const finalGst = (finalSubtotal * 18) / 100;
    const grandTotal = finalSubtotal + finalGst;

    const quote = crmStore.createQuotation({
      ...body,
      agentId,
      items,
      subtotal: finalSubtotal,
      gstAmount: finalGst,
      grandTotal,
      discount,
    });

    return NextResponse.json({ success: true, quotation: quote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
