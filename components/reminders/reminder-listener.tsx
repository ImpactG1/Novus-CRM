'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { playReminderSound, requestNotificationPermission, sendDesktopNotification } from '@/lib/audio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/lib/../components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Phone, Building2, CheckCircle2, Volume2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface DueLead {
  id: string;
  name: string;
  company?: string | null;
  phone: string;
  email?: string | null;
  callbackDate: string;
  notes?: string | null;
  status?: string;
  assignedTo?: string;
}

interface ReminderListenerProps {
  onOpenLead?: (leadId: string) => void;
}

export function ReminderListener({ onOpenLead }: ReminderListenerProps) {
  const [dueLeads, setDueLeads] = useState<DueLead[]>([]);
  const [activeModalLead, setActiveModalLead] = useState<DueLead | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const alertedIdsRef = useRef<Set<string>>(new Set());

  // Listen for initial user gesture to allow Web Audio API playback
  useEffect(() => {
    const handleGesture = () => setHasInteracted(true);
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const checkReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/reminders/due');
      if (!res.ok) return;
      const data = await res.json();
      const leads: DueLead[] = data.dueLeads || [];
      setDueLeads(leads);

      // Check if there are newly due leads not yet alerted in this session
      for (const lead of leads) {
        if (!alertedIdsRef.current.has(lead.id)) {
          alertedIdsRef.current.add(lead.id);

          // 1. Play synthetic two-tone chime (523Hz & 659Hz)
          playReminderSound('chime', 85);

          // 2. Native HTML5 Notification
          sendDesktopNotification(`Follow-Up Due: ${lead.name}`, {
            body: `${lead.company ? lead.company + ' • ' : ''}${lead.phone}\n${lead.notes || 'Callback scheduled now'}`,
          });

          // 3. Open interactive modal
          setActiveModalLead(lead);

          toast.info(`Callback reminder: ${lead.name}`, {
            description: lead.phone,
          });
          break; // Show one at a time
        }
      }
    } catch (e) {
      console.warn('Reminder poll failed:', e);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkReminders();

    // Poll every 30 seconds (Vercel-Friendly)
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const handleSnooze = async (minutes: number = 10) => {
    if (!activeModalLead) return;
    try {
      const res = await fetch('/api/reminders/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: activeModalLead.id, action: 'snooze', minutes }),
      });
      if (res.ok) {
        toast.success(`Reminder snoozed for ${minutes} minutes`);
        alertedIdsRef.current.delete(activeModalLead.id); // allow re-alerting when next due
        setActiveModalLead(null);
        checkReminders();
      }
    } catch (e) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleMarkDone = async () => {
    if (!activeModalLead) return;
    try {
      const res = await fetch('/api/reminders/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: activeModalLead.id, action: 'done' }),
      });
      if (res.ok) {
        toast.success('Callback marked as completed');
        setActiveModalLead(null);
        checkReminders();
      }
    } catch (e) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleOpenLead = () => {
    if (activeModalLead && onOpenLead) {
      const id = activeModalLead.id;
      setActiveModalLead(null);
      onOpenLead(id);
    }
  };

  return (
    <>
      {/* Interactive Due Reminder Modal */}
      <Dialog open={!!activeModalLead} onOpenChange={(open) => !open && setActiveModalLead(null)}>
        <DialogContent className="sm:max-w-md border-amber-500/30 bg-card">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-amber-400">
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Follow-Up Callback Due
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs pt-1">
              Scheduled client follow-up reminder is due now.
            </DialogDescription>
          </DialogHeader>

          {activeModalLead && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-foreground">{activeModalLead.name}</h4>
                  <Badge variant="warning">{activeModalLead.status || 'Due'}</Badge>
                </div>

                {activeModalLead.company && (
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>{activeModalLead.company}</span>
                  </div>
                )}

                <div className="flex items-center text-xs text-foreground font-mono gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeModalLead.phone}</span>
                </div>

                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Due: {formatDateTime(activeModalLead.callbackDate)}</span>
                </div>

                {activeModalLead.notes && (
                  <div className="text-xs bg-muted/40 p-2.5 rounded border border-border/50 text-foreground/90">
                    <span className="font-semibold text-muted-foreground block text-[10px] uppercase mb-1">
                      Notes
                    </span>
                    {activeModalLead.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSnooze(10)}
              className="border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Snooze 10m
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkDone}
              className="hover:bg-emerald-500/20 hover:text-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark Done
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenLead}
              className="bg-primary hover:bg-primary/90 font-medium"
            >
              Open Lead Profile →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
