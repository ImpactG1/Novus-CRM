'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Mail,
  CheckCircle,
  Clock,
  ExternalLink,
  Download,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Quotation } from '@/lib/types';
import { CreateQuotationModal } from './create-quotation-modal';
import { toast } from 'sonner';

export function QuotationsView() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      setQuotations(data.quotations || []);
    } catch (e) {
      toast.error('Failed to load quotations');
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
    loadQuotations();
    loadLeads();
  }, []);

  const handleSendEmail = async (id: string) => {
    try {
      toast.loading('Sending quotation email...');
      const res = await fetch(`/api/quotations/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Quotation email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing quotation');
    }
  };

  const handleUpdateStatus = async (id: string, status: Quotation['status']) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        loadQuotations();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const filtered = quotations.filter(
    (q) =>
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.lead?.name && q.lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Quotations & Estimates
          </h2>
          <p className="text-xs text-muted-foreground">
            Official sequential proposals with GST tax breakdown and client email dispatch.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> + Create Quotation
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotation number, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Quote #</th>
                <th className="p-3">Client</th>
                <th className="p-3">Subject</th>
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
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Loading quotations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20 transition">
                    <td className="p-3 font-mono font-bold text-primary">{q.quotationNumber}</td>
                    <td className="p-3 font-medium text-foreground">
                      {q.lead?.name || 'Client'}
                      {q.lead?.company && (
                        <span className="block text-[11px] text-muted-foreground">
                          {q.lead.company}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-foreground">{q.subject}</td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(q.subtotal)}
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(q.gstAmount)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(q.grandTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={q.status}
                        onChange={(e) => handleUpdateStatus(q.id, e.target.value as any)}
                        className="bg-transparent border border-border rounded px-1.5 py-0.5 text-[11px] font-semibold text-foreground focus:outline-none"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(q.id)}
                        className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                      >
                        <Mail className="w-3.5 h-3.5 mr-1" /> Send Email
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateQuotationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        leadId={selectedLeadId}
        leadName={leads.find((l) => l.id === selectedLeadId)?.name}
        onCreated={loadQuotations}
      />
    </div>
  );
}
