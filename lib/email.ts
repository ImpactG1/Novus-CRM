import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'CRM System <onboarding@resend.dev>';

export async function sendOtpEmail(email: string, otp: string) {
  // Always log in terminal for quick development/demo
  console.log(`\n==========================================`);
  console.log(`[DEV OTP]: ${otp} for ${email}`);
  console.log(`==========================================\n`);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
      <div style="margin-bottom: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">Enterprise CRM Portal</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Secure Passwordless Sign-In</p>
      </div>
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600;">Your One-Time Passcode</span>
        <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #2563eb; margin-top: 8px;">
          ${otp}
        </div>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
        This code is valid for <strong>10 minutes</strong>. If you did not request this login, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Your Login Code: ${otp}`,
    html: htmlContent,
  });
}

export async function sendQuotationEmail({
  to,
  cc,
  quotationNumber,
  subject,
  leadName,
  items,
  subtotal,
  gstAmount,
  grandTotal,
  validTill,
  terms,
}: {
  to: string;
  cc?: string;
  quotationNumber: string;
  subject: string;
  leadName: string;
  items: Array<{ description: string; quantity: number; rate: number; taxable: number; gstAmount: number; total: number }>;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  validTill?: string | null;
  terms?: string | null;
}) {
  const itemRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 13px;">${item.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.taxable.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.gstAmount.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600;">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between;">
        <div>
          <h2 style="margin: 0; color: #0f172a; font-size: 24px;">Quotation</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">No: <strong>${quotationNumber}</strong></p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Subject: ${subject}</p>
          ${validTill ? `<p style="margin: 4px 0 0; font-size: 13px; color: #ef4444;">Valid Till: ${new Date(validTill).toLocaleDateString('en-IN')}</p>` : ''}
        </div>
      </div>

      <p style="font-size: 14px; color: #334155;">Dear <strong>${leadName}</strong>,</p>
      <p style="font-size: 14px; color: #64748b;">Thank you for your interest. Please review the official quotation details below:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px;">
        <thead style="background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b;">
          <tr>
            <th style="padding: 8px 12px; text-align: left;">Description</th>
            <th style="padding: 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; text-align: right;">Rate</th>
            <th style="padding: 8px 12px; text-align: right;">Taxable</th>
            <th style="padding: 8px 12px; text-align: right;">GST (18%)</th>
            <th style="padding: 8px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="width: 260px; margin-left: auto; margin-bottom: 24px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;">
          <span>Subtotal:</span><span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;">
          <span>GST (18%):</span><span>₹${gstAmount.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 1px solid #e2e8f0; color: #0f172a;">
          <span>Grand Total:</span><span style="color: #2563eb;">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      ${terms ? `<div style="background: #f8fafc; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #64748b;"><strong style="color: #334155;">Terms & Conditions:</strong><br/>${terms}</div>` : ''}
    </div>
  `;

  return sendEmail({
    to,
    cc,
    subject: `Quotation #${quotationNumber} - ${subject}`,
    html,
  });
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  isGst,
  leadName,
  items,
  subtotal,
  gstAmount,
  grandTotal,
  paymentMode,
  transactionId,
  status,
}: {
  to: string;
  invoiceNumber: string;
  isGst: boolean;
  leadName: string;
  items: Array<{ description: string; quantity: number; rate: number; taxable: number; gstAmount: number; total: number }>;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paymentMode?: string | null;
  transactionId?: string | null;
  status: string;
}) {
  const itemRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 13px;">${item.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.taxable.toLocaleString('en-IN')}</td>
        ${isGst ? `<td style="padding: 10px 12px; font-size: 13px; text-align: right;">₹${item.gstAmount.toLocaleString('en-IN')}</td>` : ''}
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600;">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 24px;">${isGst ? 'Tax Invoice (GST)' : 'Commercial Invoice'}</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Invoice #: <strong>${invoiceNumber}</strong></p>
        <span style="display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: ${status === 'PAID' ? '#dcfce7; color: #15803d;' : '#fef3c7; color: #b45309;'}">${status}</span>
      </div>

      <p style="font-size: 14px; color: #334155;">Billed to: <strong>${leadName}</strong></p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0;">
        <thead style="background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b;">
          <tr>
            <th style="padding: 8px 12px; text-align: left;">Item</th>
            <th style="padding: 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; text-align: right;">Rate</th>
            <th style="padding: 8px 12px; text-align: right;">Taxable</th>
            ${isGst ? '<th style="padding: 8px 12px; text-align: right;">GST (18%)</th>' : ''}
            <th style="padding: 8px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="width: 260px; margin-left: auto; margin-bottom: 24px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;">
          <span>Subtotal:</span><span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${isGst ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #64748b;"><span>GST (18%):</span><span>₹${gstAmount.toLocaleString('en-IN')}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 1px solid #e2e8f0; color: #0f172a;">
          <span>Grand Total:</span><span style="color: #16a34a;">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      ${paymentMode ? `<p style="font-size: 13px; color: #64748b; margin: 0;">Payment Method: <strong>${paymentMode}</strong> ${transactionId ? `(Txn: ${transactionId})` : ''}</p>` : ''}
    </div>
  `;

  return sendEmail({
    to,
    subject: `Invoice #${invoiceNumber} - ${leadName}`,
    html,
  });
}

export async function sendProposalEmail({
  to,
  title,
  leadName,
  offer,
  message,
  slabsData,
  packagesData,
}: {
  to: string;
  title: string;
  leadName: string;
  offer?: string | null;
  message?: string | null;
  slabsData?: any[];
  packagesData?: any[];
}) {
  let rateTablesHtml = '';
  if (slabsData && Array.isArray(slabsData) && slabsData.length > 0) {
    rateTablesHtml = slabsData
      .map(
        (table: any) => `
        <div style="margin-top: 20px;">
          <h4 style="margin: 0 0 8px; color: #0f172a; font-size: 15px;">${table.tableName || 'Service Slabs'}</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0;">
            <thead style="background: #f1f5f9; color: #475569;">
              <tr>
                <th style="padding: 6px 10px; text-align: left;">Volume / Slab</th>
                <th style="padding: 6px 10px; text-align: right;">Rate (₹)</th>
                <th style="padding: 6px 10px; text-align: right;">Disc %</th>
                <th style="padding: 6px 10px; text-align: right;">Bonus Units</th>
                <th style="padding: 6px 10px; text-align: right;">GST (18%)</th>
                <th style="padding: 6px 10px; text-align: right;">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(table.rows || [])
                .map(
                  (r: any) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 10px;">${r.slab || '-'}</td>
                  <td style="padding: 6px 10px; text-align: right;">₹${Number(r.rate || 0).toLocaleString('en-IN')}</td>
                  <td style="padding: 6px 10px; text-align: right;">${r.discount || 0}%</td>
                  <td style="padding: 6px 10px; text-align: right;">${r.bonus || '0'}</td>
                  <td style="padding: 6px 10px; text-align: right;">₹${Number(r.gst || 0).toLocaleString('en-IN')}</td>
                  <td style="padding: 6px 10px; text-align: right; font-weight: 600;">₹${Number(r.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
      )
      .join('');
  }

  let packagesHtml = '';
  if (packagesData && Array.isArray(packagesData) && packagesData.length > 0) {
    packagesHtml = `
      <div style="margin-top: 24px;">
        <h4 style="margin: 0 0 8px; color: #0f172a; font-size: 15px;">Wallet Credits & Packages</h4>
        <div style="display: flex; gap: 12px;">
          ${packagesData
            .map(
              (pkg: any) => `
            <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc;">
              <h5 style="margin: 0; font-size: 14px; color: #2563eb;">${pkg.tierName}</h5>
              <div style="font-size: 18px; font-weight: 700; margin: 6px 0;">₹${Number(pkg.investment || 0).toLocaleString('en-IN')}</div>
              <p style="margin: 0; font-size: 12px; color: #16a34a;">+${pkg.bonusPercent || 0}% Bonus Credits</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Total Value: ₹${Number(pkg.totalValue || 0).toLocaleString('en-IN')}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="margin: 0 0 4px; color: #0f172a; font-size: 22px;">${title}</h2>
      <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">Prepared for: <strong>${leadName}</strong></p>
      ${offer ? `<div style="background: #eff6ff; color: #1d4ed8; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px;"><strong>Special Offer:</strong> ${offer}</div>` : ''}
      ${message ? `<p style="font-size: 14px; color: #334155; line-height: 1.6;">${message}</p>` : ''}
      ${rateTablesHtml}
      ${packagesHtml}
    </div>
  `;

  return sendEmail({
    to,
    subject: `Proposal: ${title} - ${leadName}`,
    html,
  });
}

async function sendEmail({
  to,
  cc,
  subject,
  html,
}: {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}) {
  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);

  // 1. Try Resend if API key is provided
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const res = await resend.emails.send({
        from: emailFrom,
        to: [to],
        cc: cc ? [cc] : undefined,
        subject,
        html,
      });
      console.log('[RESEND SUCCESS]:', res);
      return { success: true, provider: 'resend', data: res };
    } catch (err) {
      console.warn('[RESEND ERROR]:', err);
    }
  }

  // 2. Try SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        cc,
        subject,
        html,
      });
      console.log('[SMTP SUCCESS]:', info.messageId);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn('[SMTP ERROR]:', err);
    }
  }

  // 3. Fallback dev mode (Logged to console)
  return { success: true, provider: 'dev-console', message: 'Logged to console in development mode' };
}
