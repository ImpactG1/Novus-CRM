'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName?: string;
  onCreated?: () => void;
}

export function CreateSaleModal({
  open,
  onOpenChange,
  leadId,
  leadName,
  onCreated,
}: CreateSaleModalProps) {
  const [amount, setAmount] = useState<number>(58998);
  const [modeOfPayment, setModeOfPayment] = useState('NEFT');
  const [transactionId, setTransactionId] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [validityDays, setValidityDays] = useState(365);
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [dltRequired, setDltRequired] = useState(true);
  const [dltDone, setDltDone] = useState(true);
  const [targetAudience, setTargetAudience] = useState('B2B Clients');
  const [targetLocation, setTargetLocation] = useState('Pan India');
  const [remarks, setRemarks] = useState('Onboarding checklist initiated');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setSubmitting(true);
    try {
      const validityDate = new Date(Date.now() + validityDays * 86400000).toISOString();

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          amount: Number(amount || 0),
          modeOfPayment,
          transactionId: transactionId || null,
          gstNo: gstNo || null,
          validity: validityDate,
          isPrepaid,
          dltRequired,
          dltDone,
          targetAudience,
          targetLocation,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert deal');

      toast.success('Lead successfully converted to Won Sale! 🎉');
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error converting deal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy className="w-5 h-5" />
              <DialogTitle className="text-lg font-bold text-foreground">
                Convert Lead to Closed Sale
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Client: <strong className="text-foreground">{leadName || 'Client'}</strong> • Lead
              status will automatically be marked Won.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Deal Amount (₹)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Payment Method</label>
                <select
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="NEFT">NEFT / RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Transaction Ref ID</label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN9410294"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">GST Identification No</label>
                <Input
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Validity (Days)</label>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrepaid}
                    onChange={(e) => setIsPrepaid(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>100% Prepaid</span>
                </label>
              </div>
            </div>

            {/* DLT Compliance */}
            <div className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
              <span className="font-medium">DLT SMS Entity Compliance:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dltRequired}
                    onChange={(e) => setDltRequired(e.target.checked)}
                  />
                  <span>DLT Required</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400">
                  <input
                    type="checkbox"
                    checked={dltDone}
                    onChange={(e) => setDltDone(e.target.checked)}
                  />
                  <span>DLT Completed</span>
                </label>
              </div>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Remarks / Fulfillment Notes</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {submitting ? 'Recording...' : 'Convert to Won Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
