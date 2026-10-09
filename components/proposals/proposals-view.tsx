'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Mail,
  Download,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Proposal } from '@/lib/types';
import { ProposalBuilderModal } from './proposal-builder-modal';
import { toast } from 'sonner';

export function ProposalsView() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals');
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch (e) {
      toast.error('Failed to load proposals');
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
    loadProposals();
    loadLeads();
  }, []);

  const handleSendEmail = async (id: string) => {
    try {
      toast.loading('Sending proposal rate chart email...');
      const res = await fetch(`/api/proposals/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Proposal emailed to client!');
    } catch (err: any) {
      toast.error(err.message || 'Error emailing proposal');
    }
  };

  const filtered = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.lead?.name && p.lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Dynamic Proposals & Rate Charts
          </h2>
          <p className="text-xs text-muted-foreground">
            Multi-table volume pricing charts (SMS, WhatsApp) and wallet package credit tiers with ExcelJS export.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> + Create Dynamic Proposal
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposal title, lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Proposals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-xs">
            Loading rate chart proposals...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
            No proposals generated yet.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Client: <strong className="text-foreground">{p.lead?.name || 'Customer'}</strong>
                  </p>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  {p.discount ? `${p.discount} Discount` : 'Standard'}
                </Badge>
              </div>

              {p.offer && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-xs text-primary font-medium">
                  {p.offer}
                </div>
              )}

              {/* Tables Preview */}
              <div className="space-y-2">
                {(p.slabsData || []).map((tbl: any, idx: number) => (
                  <div key={idx} className="bg-muted/30 p-2.5 rounded-lg border border-border/50 text-xs">
                    <span className="font-semibold text-foreground block mb-1">{tbl.tableName}</span>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{tbl.rows?.length || 0} volume tiers configured</span>
                      <span>GST 18% inclusive calculations</span>
                    </div>
                  </div>
                ))}

                {p.includePackages && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-xs text-emerald-400 font-medium flex justify-between">
                    <span>Wallet Credit Packages:</span>
                    <span>{(p.packagesData || []).length} Tiers Included</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <a
                  href={`/api/proposals/${p.id}/excel`}
                  download
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground transition border border-border font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Excel Sheet
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendEmail(p.id)}
                  className="h-8 text-xs hover:bg-indigo-500/10 hover:text-indigo-400"
                >
                  <Mail className="w-3.5 h-3.5 mr-1" /> Send to Lead
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ProposalBuilderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        leadId={selectedLeadId}
        leadName={leads.find((l) => l.id === selectedLeadId)?.name}
        onCreated={loadProposals}
      />
    </div>
  );
}
