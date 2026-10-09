import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const statusId = searchParams.get('statusId') || undefined;
    const typeId = searchParams.get('typeId') || undefined;
    const assignedToId = searchParams.get('assignedToId') || undefined;

    const leads = crmStore.getLeads({ search, statusId, typeId, assignedToId });

    const exportRows = leads.map((l, idx) => ({
      'Sr. No': idx + 1,
      'Lead Name': l.name,
      Company: l.company || '-',
      Phone: l.phone,
      Email: l.email || '-',
      City: l.city || '-',
      State: l.state || '-',
      Status: l.status?.name || '-',
      Type: l.type?.name || '-',
      'Assigned Agent': l.assignedTo?.name || '-',
      'Callback Date': l.callbackDate ? new Date(l.callbackDate).toLocaleString('en-IN') : '-',
      Notes: l.notes || '-',
      'Created Date': new Date(l.createdAt).toLocaleDateString('en-IN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Leads');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="crm_leads_export_${Date.now()}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
