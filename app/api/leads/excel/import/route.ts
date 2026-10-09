import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No Excel file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ error: 'Excel sheet appears to be empty' }, { status: 400 });
    }

    const currentLeads = crmStore.getLeads();
    const existingPhones = new Set(
      currentLeads.map((l) => l.phone.replace(/\D/g, '')).filter(Boolean)
    );

    const statuses = crmStore.getStatuses();
    const types = crmStore.getTypes();
    const agents = crmStore.getUsers().filter((u) => u.role === 'AGENT');

    let importedCount = 0;
    const skippedDuplicates: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      // Normalize column names
      const name = row['Name'] || row['Lead Name'] || row['name'] || row['lead_name'];
      const phone = String(row['Phone'] || row['Mobile'] || row['phone'] || '').trim();
      const company = row['Company'] || row['company'] || '';
      const email = row['Email'] || row['email'] || '';
      const city = row['City'] || row['city'] || '';
      const state = row['State'] || row['state'] || '';
      const statusText = row['Status'] || row['status'] || '';
      const typeText = row['Type'] || row['type'] || '';
      const notes = row['Notes'] || row['notes'] || '';

      if (!name || !phone) {
        errors.push(`Row ${i + 2}: Missing Name or Phone`);
        continue;
      }

      const normalizedPhone = phone.replace(/\D/g, '');
      if (existingPhones.has(normalizedPhone)) {
        skippedDuplicates.push(`${name} (${phone})`);
        continue;
      }

      // Match status and type or default
      const matchedStatus = statuses.find(
        (s) => s.name.toLowerCase() === String(statusText).toLowerCase()
      ) || statuses[0];

      const matchedType = types.find((t) =>
        t.name.toLowerCase().includes(String(typeText).toLowerCase().slice(0, 3))
      ) || types[0];

      // Assign to round-robin or first agent
      const assignedAgent = agents[importedCount % (agents.length || 1)] || crmStore.getUsers()[0];

      crmStore.createLead({
        name,
        company: company || undefined,
        phone,
        email: email || undefined,
        city: city || undefined,
        state: state || undefined,
        statusId: matchedStatus.id,
        typeId: matchedType.id,
        assignedToId: assignedAgent.id,
        notes: notes || 'Imported via Bulk Excel Upload',
      });

      existingPhones.add(normalizedPhone);
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount: skippedDuplicates.length,
      skippedDuplicates: skippedDuplicates.slice(0, 10), // sample duplicates
      errors,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process file' }, { status: 500 });
  }
}
