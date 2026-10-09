'use client';

import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Plus,
  Search,
  MessageSquare,
  Clock,
  UserCheck,
  AlertCircle,
  Building2,
  CheckCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { SupportTicket, Priority, TicketStatus } from '@/lib/types';
import { toast } from 'sonner';

export function TicketDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Selected ticket for chat thread modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Create Ticket Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadLeadsForTicket = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeadOptions(data.leads || []);
      if (data.leads && data.leads.length > 0) {
        setSelectedLeadId(data.leads[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadTickets();
    loadLeadsForTicket();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newSubject) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          subject: newSubject,
          description: newDesc,
          priority: newPriority,
          status: 'OPEN',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Support ticket ${data.ticket.ticketNumber} created!`);
      setCreateModalOpen(false);
      setNewSubject('');
      setNewDesc('');
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Error creating ticket');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !newMessage.trim()) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh ticket details
      const updatedTicketRes = await fetch(`/api/tickets/${activeTicket.id}`);
      const updatedData = await updatedTicketRes.json();
      setActiveTicket(updatedData.ticket);
      setNewMessage('');
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Error sending message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Ticket marked as ${newStatus}`);
        loadTickets();
        if (activeTicket && activeTicket.id === ticketId) {
          setActiveTicket({ ...activeTicket, status: newStatus });
        }
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-400" />
            Support Helpdesk & Internal Chat Threads
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage customer complaints, technical triage, and internal collaboration.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> + Create Ticket
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-card p-3 rounded-lg border border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="ALL">All Statuses ({tickets.length})</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            Loading support threads...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
            No support tickets match the current filter.
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTicket(t)}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/10 transition cursor-pointer space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
                    {t.ticketNumber}
                  </span>
                  <Badge
                    variant={
                      t.priority === 'URGENT'
                        ? 'destructive'
                        : t.priority === 'HIGH'
                        ? 'warning'
                        : t.priority === 'MEDIUM'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-[10px]"
                  >
                    {t.priority}
                  </Badge>
                  <Badge
                    variant={
                      t.status === 'RESOLVED'
                        ? 'success'
                        : t.status === 'IN_PROGRESS'
                        ? 'warning'
                        : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {t.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{formatDateTime(t.createdAt)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">{t.subject}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>
                    Client: <strong className="text-foreground">{t.lead?.name || 'Customer'}</strong>
                  </span>
                  {t.lead?.company && (
                    <span className="hidden sm:inline">• {t.lead.company}</span>
                  )}
                  <span>
                    • Assigned to:{' '}
                    <strong className="text-foreground">{t.assignedTo?.name || 'Elena (Support)'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-primary font-medium hover:underline">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.messages?.length || 0} messages (View Thread →)</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Ticket Thread Dialog */}
      <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col bg-card border-border p-0 overflow-hidden">
          {activeTicket && (
            <>
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary">
                      {activeTicket.ticketNumber}
                    </span>
                    <Badge variant={activeTicket.priority === 'URGENT' ? 'destructive' : 'default'}>
                      {activeTicket.priority}
                    </Badge>
                    <Badge variant={activeTicket.status === 'RESOLVED' ? 'success' : 'warning'}>
                      {activeTicket.status}
                    </Badge>
                  </div>

                  {/* Quick Status Setter */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(activeTicket.id, 'IN_PROGRESS')}
                      className="h-7 text-xs"
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(activeTicket.id, 'RESOLVED')}
                      className="h-7 text-xs hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground mt-2">{activeTicket.subject}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Client: {activeTicket.lead?.name} ({activeTicket.lead?.phone})
                </p>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[400px]">
                {/* Initial Description */}
                <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs">
                  <span className="font-semibold text-foreground block mb-1">
                    Initial Support Brief:
                  </span>
                  <p className="text-foreground/90 whitespace-pre-wrap">{activeTicket.description}</p>
                </div>

                {/* Thread Messages */}
                {(!activeTicket.messages || activeTicket.messages.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No replies yet. Type a message below to coordinate.
                  </p>
                ) : (
                  activeTicket.messages.map((m: any) => (
                    <div
                      key={m.id}
                      className="rounded-lg p-3 bg-card border border-border/70 space-y-1 shadow-sm text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {m.sender?.name || 'Agent'}{' '}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({m.sender?.role || 'SUPPORT'})
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Footer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2 bg-muted/10">
                <Input
                  placeholder="Post update or internal troubleshooting note..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-xs flex-1"
                />
                <Button type="submit" size="sm" disabled={sendingMsg} className="h-9">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {sendingMsg ? 'Posting...' : 'Reply'}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <form onSubmit={handleCreateTicket}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Headphones className="w-5 h-5 text-amber-400" />
                Open New Support Ticket
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log technical or customer support incident.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Select Client Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs"
                  required
                >
                  {leadOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} - {l.company || l.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Subject</label>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Webhook API delivery failed"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Incident Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Detailed logs, error codes, steps to reproduce..."
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Open Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
