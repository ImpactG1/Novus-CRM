import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const invoices = crmStore.getInvoices();
    return NextResponse.json({ invoices });
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
    const isGst = body.isGst ?? true;

    let subtotal = 0;
    let gstAmount = 0;

    const items = body.items.map((item: any) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const rate = Number(item.rate) || 0;
      const taxRate = isGst ? (Number(item.taxRate) || 18) : 0;
      const taxable = qty * rate;
      const gst = isGst ? (taxable * taxRate) / 100 : 0;
      const total = taxable + gst;

      subtotal += taxable;
      gstAmount += gst;

      return {
        description: item.description || 'Service Deliverable',
        quantity: qty,
        rate,
        taxRate,
        taxable,
        gstAmount: gst,
        total,
      };
    });

    const grandTotal = subtotal + gstAmount;

    const invoice = crmStore.createInvoice({
      ...body,
      agentId,
      isGst,
      items,
      subtotal,
      gstAmount,
      grandTotal,
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
