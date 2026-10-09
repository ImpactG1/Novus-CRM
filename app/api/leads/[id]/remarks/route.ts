import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { note, authorName } = await req.json();
    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Remark note is required' }, { status: 400 });
    }

    const session = await getCurrentUser();
    const author = authorName || session?.name || 'CRM Agent';

    const remark = crmStore.addLeadRemark(params.id, note.trim(), author);
    if (!remark) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, remark }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
