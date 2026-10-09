import { NextResponse } from 'next/server';
import { crmStore } from '@/lib/store';
import ExcelJS from 'exceljs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const proposal = crmStore.getProposals().find((p) => p.id === params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const lead = crmStore.getLeadById(proposal.leadId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Enterprise CRM';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Rate Chart Proposal', {
      views: [{ showGridLines: true }],
    });

    // Title Row
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${proposal.title.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 40;

    // Metadata Rows
    sheet.getCell('A3').value = 'Client Name:';
    sheet.getCell('B3').value = lead?.name || 'Valued Client';
    sheet.getCell('A4').value = 'Company:';
    sheet.getCell('B4').value = lead?.company || '-';
    sheet.getCell('A5').value = 'Offer / Terms:';
    sheet.getCell('B5').value = proposal.offer || 'Standard Enterprise Rates';
    ['A3', 'A4', 'A5'].forEach((cell) => {
      sheet.getCell(cell).font = { bold: true, color: { argb: 'FF475569' } };
    });

    let currentRow = 7;

    // Slabs Tables
    if (proposal.slabsData && Array.isArray(proposal.slabsData)) {
      for (const table of proposal.slabsData) {
        // Table Header
        sheet.mergeCells(`A${currentRow}:F${currentRow}`);
        const tblHeader = sheet.getCell(`A${currentRow}`);
        tblHeader.value = table.tableName || 'Service Slabs';
        tblHeader.font = { bold: true, size: 12, color: { argb: 'FF2563EB' } };
        currentRow += 1;

        // Column Titles
        const headerRow = sheet.getRow(currentRow);
        headerRow.values = ['Volume Slab', 'Base Rate (₹)', 'Discount %', 'Bonus Units', 'GST (18%)', 'Total (₹)'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' },
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        currentRow += 1;

        // Rows
        for (const r of table.rows || []) {
          const row = sheet.getRow(currentRow);
          row.values = [
            r.slab,
            Number(r.rate || 0),
            `${r.discount || 0}%`,
            r.bonus || '-',
            Number(r.gst || 0),
            Number(r.total || 0),
          ];
          row.getCell(2).numFmt = '₹#,##0.00';
          row.getCell(5).numFmt = '₹#,##0.00';
          row.getCell(6).numFmt = '₹#,##0.00';
          row.getCell(6).font = { bold: true };
          currentRow += 1;
        }

        currentRow += 2; // spacing
      }
    }

    // Packages Table
    if (proposal.packagesData && Array.isArray(proposal.packagesData) && proposal.packagesData.length > 0) {
      sheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const pkgTitle = sheet.getCell(`A${currentRow}`);
      pkgTitle.value = 'WALLET PACKAGES & BONUS CREDITS';
      pkgTitle.font = { bold: true, size: 12, color: { argb: 'FF16A34A' } };
      currentRow += 1;

      const pkgHeader = sheet.getRow(currentRow);
      pkgHeader.values = ['Package Tier', 'Investment (₹)', 'Bonus Credit %', 'Total Wallet Value (₹)'];
      pkgHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      pkgHeader.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF16A34A' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      currentRow += 1;

      for (const p of proposal.packagesData) {
        const row = sheet.getRow(currentRow);
        row.values = [
          p.tierName,
          Number(p.investment || 0),
          `+${p.bonusPercent || 0}%`,
          Number(p.totalValue || 0),
        ];
        row.getCell(2).numFmt = '₹#,##0.00';
        row.getCell(4).numFmt = '₹#,##0.00';
        row.getCell(4).font = { bold: true };
        currentRow += 1;
      }
    }

    // Auto-fit column widths
    sheet.columns.forEach((col) => {
      let maxLen = 15;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLen) maxLen = Math.min(len + 4, 35);
      });
      col.width = maxLen;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="proposal_rate_chart_${proposal.id}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    console.error('Proposal Excel generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
