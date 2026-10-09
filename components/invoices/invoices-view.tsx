'use client';

import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Plus,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Invoice } from '@/lib/types';
import { CreateInvoiceModal } from './create-invoice-modal';
import { toast } from 'sonner';

export function InvoicesView() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (e) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.leads && data.leads.length > 0) {
        setSelectedLeadId(data.leads[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadInvoices();
    loadLeads();
  }, []);

  const handleSendEmail = async (id: string) => {
    try {
      toast.loading('Sending invoice receipt email...');
      const res = await fetch(`/api/invoices/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Invoice email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing invoice');
    }
  };

  const handleUpdateStatus = async (id: string, status: Invoice['status']) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        loadInvoices();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.lead?.name && inv.lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            Billing & Invoices
          </h2>
          <p className="text-xs text-muted-foreground">
            GST and Non-GST compliant client tax invoices with payment reconciliation.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> + Issue Invoice
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Type</th>
                <th className="p-3">Client</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3 text-right">GST (18%)</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Loading invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No invoices recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3">
                      <Badge variant={inv.isGst ? 'default' : 'outline'} className="text-[10px]">
                        {inv.isGst ? 'GST 18%' : 'Non-GST'}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {inv.lead?.name || 'Client'}
                      {inv.lead?.company && (
                        <span className="block text-[11px] text-muted-foreground">
                          {inv.lead.company}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {inv.paymentMode || 'UPI'} {inv.transactionId ? `(${inv.transactionId})` : ''}
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(inv.gstAmount)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={inv.status}
                        onChange={(e) => handleUpdateStatus(inv.id, e.target.value as any)}
                        className={`bg-transparent border border-border rounded px-1.5 py-0.5 text-[11px] font-semibold focus:outline-none ${
                          inv.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(inv.id)}
                        className="h-7 text-xs hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        <Mail className="w-3.5 h-3.5 mr-1" /> Send Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        leadId={selectedLeadId}
        leadName={leads.find((l) => l.id === selectedLeadId)?.name}
        onCreated={loadInvoices}
      />
    </div>
  );
}
