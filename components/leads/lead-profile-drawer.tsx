'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Send,
  FileSpreadsheet,
  ReceiptText,
  Layers,
  Trophy,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Download,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CreateQuotationModal } from '@/components/quotations/create-quotation-modal';
import { CreateInvoiceModal } from '@/components/invoices/create-invoice-modal';
import { ProposalBuilderModal } from '@/components/proposals/proposal-builder-modal';
import { CreateSaleModal } from '@/components/sales/create-sale-modal';
import { toast } from 'sonner';

interface LeadProfileDrawerProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated?: () => void;
}

export function LeadProfileDrawer({
  leadId,
  open,
  onOpenChange,
  onLeadUpdated,
}: LeadProfileDrawerProps) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [addingRemark, setAddingRemark] = useState(false);

  // Modals state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  // Load full lead data
  const loadLead = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (!res.ok) throw new Error('Lead not found');
      const data = await res.json();
      setLead(data.lead);
    } catch (err: any) {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && leadId) {
      loadLead();
    }
  }, [open, leadId]);

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim() || !leadId) return;

    setAddingRemark(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newRemark }),
      });
      if (!res.ok) throw new Error('Failed to add remark');
      toast.success('Remark added to timeline');
      setNewRemark('');
      loadLead();
      onLeadUpdated?.();
    } catch (err: any) {
      toast.error('Error adding remark');
    } finally {
      setAddingRemark(false);
    }
  };

  const handleSendQuoteEmail = async (quoteId: string) => {
    try {
      toast.loading('Sending quotation email...');
      const res = await fetch(`/api/quotations/${quoteId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      toast.success(data.message || 'Quotation email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing quote');
    }
  };

  const handleSendInvoiceEmail = async (invId: string) => {
    try {
      toast.loading('Sending invoice email...');
      const res = await fetch(`/api/invoices/${invId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invoice email');
      toast.success(data.message || 'Invoice email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing invoice');
    }
  };

  const handleSendProposalEmail = async (propId: string) => {
    try {
      toast.loading('Sending proposal rate chart email...');
      const res = await fetch(`/api/proposals/${propId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send proposal email');
      toast.success(data.message || 'Proposal emailed!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing proposal');
    }
  };

  if (!open) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl">
          {loading || !lead ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span>Loading lead profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Profile Info */}
              <SheetHeader>
                <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
                  <div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                      {lead.name}
                      <Badge variant="default" className="text-xs">
                        {lead.status?.name || 'New Lead'}
                      </Badge>
                      {lead.type?.name && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                          {lead.type.name}
                        </span>
                      )}
                    </SheetTitle>
                    {lead.company && (
                      <SheetDescription className="text-sm font-medium text-foreground/80 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-4 h-4 text-primary" />
                        {lead.company}
                      </SheetDescription>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSaleModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                    >
                      <Trophy className="w-3.5 h-3.5 mr-1.5" /> Convert to Sale
                    </Button>
                  </div>
                </div>

                {/* Quick Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-muted-foreground border-t border-border/80">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-mono text-foreground font-medium">{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{lead.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{lead.city ? `${lead.city}, ${lead.state || ''}` : '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {lead.callbackDate ? formatDateTime(lead.callbackDate) : 'No Callback Set'}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              {/* Tabs Content Navigation */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto h-10">
                  <TabsTrigger value="overview">Overview & Remarks</TabsTrigger>
                  <TabsTrigger value="quotations">Quotations ({lead.quotations?.length || 0})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({lead.invoices?.length || 0})</TabsTrigger>
                  <TabsTrigger value="proposals">Proposal ({lead.proposals?.length || 0})</TabsTrigger>
                  <TabsTrigger value="sales">Sales ({lead.sales?.length || 0})</TabsTrigger>
                  <TabsTrigger value="demos">Demos & Schedule</TabsTrigger>
                </TabsList>

                {/* TAB 1: OVERVIEW & REMARKS */}
                <TabsContent value="overview" className="space-y-4 pt-2">
                  {/* Add Remark Form */}
                  <form onSubmit={handleAddRemark} className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Add Follow-Up Note / Remark
                    </span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Log customer conversation, call outcomes, action items..."
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        className="text-xs flex-1"
                        required
                      />
                      <Button type="submit" size="sm" disabled={addingRemark}>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Log
                      </Button>
                    </div>
                  </form>

                  {/* Remarks Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Chronological Follow-Up History
                    </h4>

                    {(!lead.remarks || lead.remarks.length === 0) ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No remarks logged yet. Use the field above to add the first follow-up note.
                      </p>
                    ) : (
                      <div className="relative border-l border-border ml-3 pl-4 space-y-4">
                        {lead.remarks.map((rem: any) => (
                          <div key={rem.id} className="relative group">
                            <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                            <div className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                                <span className="font-semibold text-foreground">
                                  {rem.createdBy || 'Agent'}
                                </span>
                                <span>{formatDateTime(rem.createdAt)}</span>
                              </div>
                              <p className="text-xs text-foreground/90 whitespace-pre-wrap">{rem.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: QUOTATIONS */}
                <TabsContent value="quotations" className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Lead Quotations
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => setQuoteModalOpen(true)}
                      className="h-8 text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Quotation
                    </Button>
                  </div>

                  {(!lead.quotations || lead.quotations.length === 0) ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">No quotations generated yet for this lead.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuoteModalOpen(true)}
                        className="mt-3 text-xs"
                      >
                        Create First Quotation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.quotations.map((q: any) => (
                        <div key={q.id} className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-sm text-primary">
                                {q.quotationNumber}
                              </span>
                              <h5 className="font-medium text-xs text-foreground mt-0.5">{q.subject}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-bold text-foreground">
                                {formatCurrency(q.grandTotal)}
                              </span>
                              <Badge
                                variant={q.status === 'APPROVED' ? 'success' : q.status === 'PENDING' ? 'warning' : 'secondary'}
                                className="block mt-0.5 text-[10px]"
                              >
                                {q.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                            <span className="text-muted-foreground">
                              Created: {formatDateTime(q.createdAt)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendQuoteEmail(q.id)}
                              className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                            >
                              <Mail className="w-3.5 h-3.5 mr-1" /> Send to Client
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: INVOICES */}
                <TabsContent value="invoices" className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Billed Invoices
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => setInvModalOpen(true)}
                      className="h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Invoice
                    </Button>
                  </div>

                  {(!lead.invoices || lead.invoices.length === 0) ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <ReceiptText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">No invoices generated for this lead yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInvModalOpen(true)}
                        className="mt-3 text-xs"
                      >
                        Generate Invoice
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.invoices.map((inv: any) => (
                        <div key={inv.id} className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-sm text-emerald-400">
                                {inv.invoiceNumber}
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Mode: {inv.paymentMode || 'UPI'} {inv.transactionId ? `(Txn: ${inv.transactionId})` : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-bold text-foreground">
                                {formatCurrency(inv.grandTotal)}
                              </span>
                              <Badge
                                variant={inv.status === 'PAID' ? 'success' : 'warning'}
                                className="block mt-0.5 text-[10px]"
                              >
                                {inv.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                            <span className="text-muted-foreground">
                              {inv.isGst ? 'Tax Invoice (GST 18%)' : 'Commercial Invoice'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendInvoiceEmail(inv.id)}
                              className="h-7 text-xs hover:bg-emerald-500/10 hover:text-emerald-300"
                            >
                              <Mail className="w-3.5 h-3.5 mr-1" /> Send Email Receipt
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 4: PROPOSALS */}
                <TabsContent value="proposals" className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Multi-Table Rate Charts & Proposals
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => setPropModalOpen(true)}
                      className="h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Dynamic Rate Chart
                    </Button>
                  </div>

                  {(!lead.proposals || lead.proposals.length === 0) ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">No rate chart proposals created yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPropModalOpen(true)}
                        className="mt-3 text-xs"
                      >
                        Build Rate Chart
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lead.proposals.map((p: any) => (
                        <div key={p.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm text-foreground">{p.title}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5">{p.offer}</p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`/api/proposals/${p.id}/excel`}
                                download
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-muted hover:bg-accent text-foreground transition border border-border"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel Sheet
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendProposalEmail(p.id)}
                                className="h-7 text-xs"
                              >
                                <Mail className="w-3.5 h-3.5 mr-1" /> Email Lead
                              </Button>
                            </div>
                          </div>

                          {/* Preview Slabs Data */}
                          {p.slabsData && Array.isArray(p.slabsData) && (
                            <div className="space-y-2 pt-2">
                              {p.slabsData.map((tbl: any, idx: number) => (
                                <div key={idx} className="bg-muted/30 p-2.5 rounded border border-border/50 text-xs">
                                  <span className="font-semibold text-primary block mb-1">
                                    {tbl.tableName}
                                  </span>
                                  <div className="space-y-1">
                                    {(tbl.rows || []).slice(0, 3).map((r: any, rIdx: number) => (
                                      <div key={rIdx} className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>{r.slab}</span>
                                        <span>Rate: ₹{r.rate} | Total: ₹{r.total?.toLocaleString('en-IN')}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 5: SALES */}
                <TabsContent value="sales" className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Converted Deals & Sales
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => setSaleModalOpen(true)}
                      className="h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Trophy className="w-3.5 h-3.5 mr-1" /> Log Won Sale
                    </Button>
                  </div>

                  {(!lead.sales || lead.sales.length === 0) ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">Deal has not been converted yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.sales.map((sale: any) => (
                        <div key={sale.id} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base text-emerald-400">
                              {formatCurrency(sale.amount)}
                            </span>
                            <Badge variant="success" className="text-[10px]">
                              Won & Settled
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Mode: <strong className="text-foreground">{sale.modeOfPayment}</strong></div>
                            <div>Txn: <strong className="text-foreground">{sale.transactionId || '-'}</strong></div>
                            <div>DLT: <strong className="text-foreground">{sale.dltDone ? 'Completed' : 'Pending'}</strong></div>
                            <div>Date: <strong className="text-foreground">{new Date(sale.saleDate).toLocaleDateString('en-IN')}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 6: DEMOS & APPOINTMENTS */}
                <TabsContent value="demos" className="space-y-4 pt-2">
                  <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3 text-xs">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      Product Demonstration & Appointment Scheduler
                    </h4>
                    <p className="text-muted-foreground">
                      Schedule live product demonstrations via Google Meet or on-site customer briefing sessions.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success('Demo invite link generated: meet.google.com/crm-demo-call')}
                        className="text-xs"
                      >
                        Generate Google Meet Link
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => toast.success('Calendar invitation dispatched to client!')}
                        className="text-xs"
                      >
                        Send Calendar Invite
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Sub Modals */}
      <CreateQuotationModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        leadId={leadId || ''}
        leadName={lead?.name}
        onCreated={() => {
          loadLead();
          onLeadUpdated?.();
        }}
      />

      <CreateInvoiceModal
        open={invModalOpen}
        onOpenChange={setInvModalOpen}
        leadId={leadId || ''}
        leadName={lead?.name}
        onCreated={() => {
          loadLead();
          onLeadUpdated?.();
        }}
      />

      <ProposalBuilderModal
        open={propModalOpen}
        onOpenChange={setPropModalOpen}
        leadId={leadId || ''}
        leadName={lead?.name}
        onCreated={() => {
          loadLead();
          onLeadUpdated?.();
        }}
      />

      <CreateSaleModal
        open={saleModalOpen}
        onOpenChange={setSaleModalOpen}
        leadId={leadId || ''}
        leadName={lead?.name}
        onCreated={() => {
          loadLead();
          onLeadUpdated?.();
        }}
      />
    </>
  );
}
