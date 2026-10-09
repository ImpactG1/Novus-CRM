'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Clock,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Check,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { Lead, LeadStatus, LeadType, User } from '@/lib/types';
import { toast } from 'sonner';

interface LeadTableProps {
  onSelectLead: (leadId: string) => void;
  refreshTrigger?: number;
}

export function LeadTable({ onSelectLead, refreshTrigger = 0 }: LeadTableProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [types, setTypes] = useState<LeadType[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');

  // Checkbox Selection for Bulk Assign
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAssignAgentId, setBulkAssignAgentId] = useState<string>('');
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Excel Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create Lead Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    statusId: '',
    typeId: '',
    assignedToId: '',
    callbackDate: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedStatus !== 'ALL') params.set('statusId', selectedStatus);
      if (selectedType !== 'ALL') params.set('typeId', selectedType);
      if (selectedAgent !== 'ALL') params.set('assignedToId', selectedAgent);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load leads');
      const data = await res.json();
      setLeads(data.leads || []);
      setStatuses(data.statuses || []);
      setTypes(data.types || []);
      setAgents(data.agents || []);
      if (data.agents && data.agents.length > 0 && !bulkAssignAgentId) {
        setBulkAssignAgentId(data.agents[0].id);
      }
    } catch (err: any) {
      toast.error('Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedType, selectedAgent, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedLeadIds.length === 0 || !bulkAssignAgentId) return;

    setBulkAssigning(true);
    try {
      const res = await fetch('/api/leads/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeadIds, agentId: bulkAssignAgentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reassign');

      toast.success(data.message || `Reassigned ${selectedLeadIds.length} leads!`);
      setSelectedLeadIds([]);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error reassigning leads');
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const res = await fetch('/api/leads/excel/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast.success(`Import complete! ${data.importedCount} leads added.`, {
        description: data.skippedCount > 0 ? `${data.skippedCount} duplicates skipped.` : undefined,
      });

      setImportModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error importing Excel');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      toast.error('Name and Phone are mandatory');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeadForm,
          statusId: newLeadForm.statusId || statuses[0]?.id,
          typeId: newLeadForm.typeId || types[0]?.id,
          assignedToId: newLeadForm.assignedToId || agents[0]?.id,
          callbackDate: newLeadForm.callbackDate ? new Date(newLeadForm.callbackDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add lead');

      toast.success('Lead created successfully!');
      setCreateModalOpen(false);
      setNewLeadForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        statusId: '',
        typeId: '',
        assignedToId: '',
        callbackDate: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error creating lead');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Sample Template */}
          <a
            href="/api/leads/excel/template"
            download
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition font-medium"
            title="Download standardized .xlsx import template"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Template
          </a>

          {/* Import Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Import .xlsx
          </Button>

          {/* Export Filtered Leads */}
          <a
            href={`/api/leads/excel/export?search=${encodeURIComponent(searchTerm)}&statusId=${selectedStatus}&typeId=${selectedType}&assignedToId=${selectedAgent}`}
            download
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Export Excel
          </a>

          {/* Create Lead */}
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> + Add Lead
          </Button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses ({leads.length})</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Lead Types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Agent Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">Agent:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedLeadIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{selectedLeadIds.length} leads selected</span>
            <span className="text-muted-foreground">• Ready for bulk reassignment</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Reassign to:</span>
            <select
              value={bulkAssignAgentId}
              onChange={(e) => setBulkAssignAgentId(e.target.value)}
              className="h-8 rounded border border-border bg-card px-2 text-xs"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleBulkAssign}
              disabled={bulkAssigning}
              className="h-8 text-xs font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              {bulkAssigning ? 'Reassigning...' : 'Assign in 1 Click'}
            </Button>
          </div>
        </div>
      )}

      {/* Master Leads Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-3">Lead & Company</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Type</th>
                <th className="p-3">Assigned Agent</th>
                <th className="p-3">Callback Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Loading leads data...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No leads found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const isDue = lead.callbackDate && new Date(lead.callbackDate).getTime() <= Date.now() + 1800000;

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-muted/30 transition cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => onSelectLead(lead.id)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(lead.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-foreground text-sm hover:text-primary transition flex items-center gap-1.5">
                          {lead.name}
                        </div>
                        {lead.company && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span>{lead.company}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-mono text-foreground font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <Badge
                          variant={
                            lead.status?.name.includes('Won')
                              ? 'success'
                              : lead.status?.name.includes('New')
                              ? 'default'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {lead.status?.name || 'New'}
                        </Badge>
                      </td>

                      <td className="p-3">
                        <span className="text-[11px] font-medium text-foreground">
                          {lead.type?.name || '-'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {lead.assignedTo?.name ? lead.assignedTo.name[0] : 'A'}
                          </div>
                          <span className="font-medium text-foreground">
                            {lead.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        {lead.callbackDate ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded ${
                              isDue
                                ? 'bg-amber-500/15 text-amber-400 font-bold animate-pulse'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {formatDateTime(lead.callbackDate)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectLead(lead.id)}
                          className="h-7 text-xs font-medium hover:text-primary hover:bg-primary/10"
                        >
                          View Drawer →
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Bulk Excel Upload */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              Bulk Lead Excel Upload (.xlsx)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload spreadsheets to import hundreds of client leads in seconds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="p-3 rounded-lg border border-dashed border-border text-center bg-muted/20">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                disabled={importing}
                className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground mt-2">
                Supported: <strong>.xlsx</strong> files with Name, Phone, Company, Email, City.
              </p>
            </div>

            <div className="bg-muted/40 p-3 rounded-lg space-y-1.5 text-[11px] text-muted-foreground border border-border/60">
              <span className="font-semibold text-foreground block">Automatic Safety Rules:</span>
              <p>• Duplicate phone numbers are automatically checked and skipped.</p>
              <p>• Unassigned leads are automatically distributed to active agents.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Manual New Lead */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <form onSubmit={handleCreateLead}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New Enterprise Lead
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter contact and business details to initialize pipeline tracking.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Lead Name *</label>
                  <Input
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    required
                    placeholder="e.g. Vikram Malhotra"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Company</label>
                  <Input
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    placeholder="e.g. Acme Tech Labs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Phone Number *</label>
                  <Input
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    required
                    placeholder="+91 98765 00000"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Email</label>
                  <Input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="vikram@acmetech.io"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Status</label>
                  <select
                    value={newLeadForm.statusId}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, statusId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Lead Type</label>
                  <select
                    value={newLeadForm.typeId}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, typeId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Assigned Agent</label>
                  <select
                    value={newLeadForm.assignedToId}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, assignedToId: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Callback Date & Time (Audio Chime Alert)
                </label>
                <Input
                  type="datetime-local"
                  value={newLeadForm.callbackDate}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, callbackDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Initial Notes</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Client requirements, deal expectations..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
