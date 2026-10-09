import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const sampleData = [
      {
        Name: 'Sanjay Deshmukh',
        Company: 'Deshmukh Industries Pvt Ltd',
        Phone: '+91 98900 11223',
        Email: 'sanjay@deshmukh.co.in',
        City: 'Pune',
        State: 'Maharashtra',
        Status: 'New Lead',
        Type: 'Hot Lead 🔥',
        Notes: 'Interested in WhatsApp notification API',
      },
      {
        Name: 'Meera Nambiar',
        Company: 'Kochi Cloud Solutions',
        Phone: '+91 98470 33445',
        Email: 'meera@kochicloud.io',
        City: 'Kochi',
        State: 'Kerala',
        Status: 'Contacted',
        Type: 'Warm Lead ☀️',
        Notes: 'Requested 10 seat CRM proposal',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template');

    // Buffer output
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="leads_sample_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
