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
import { Plus, Trash2, ReceiptText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName?: string;
  onCreated?: () => void;
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  leadId,
  leadName,
  onCreated,
}: CreateInvoiceModalProps) {
  const [isGst, setIsGst] = useState(true);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>('PAID');
  const [transactionId, setTransactionId] = useState('');
  const [terms, setTerms] = useState('Payment received in full. Thank you for your business.');

  const [items, setItems] = useState<
    Array<{ description: string; quantity: number; rate: number; taxRate: number }>
  >([
    { description: 'Enterprise Cloud CRM (Annual License)', quantity: 1, rate: 49999, taxRate: 18 },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, taxRate: isGst ? 18 : 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.rate) || 0),
    0
  );
  const gstAmount = isGst ? (subtotal * 18) / 100 : 0;
  const grandTotal = subtotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          isGst,
          paymentMode,
          status,
          transactionId: transactionId || null,
          termsConditions: terms,
          items: items.map((it) => ({
            description: it.description || 'Deliverable Item',
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            taxRate: isGst ? 18 : 0,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

      toast.success(`Invoice ${data.invoice.invoiceNumber} created!`);
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error creating invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-500" />
                Generate Tax / Commercial Invoice
              </DialogTitle>
              {/* GST vs Non-GST Toggle */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsGst(true)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                    isGst ? 'bg-card text-foreground shadow-sm font-semibold text-emerald-400' : 'text-muted-foreground'
                  }`}
                >
                  GST (18%)
                </button>
                <button
                  type="button"
                  onClick={() => setIsGst(false)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                    !isGst ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  Non-GST
                </button>
              </div>
            </div>
            <DialogDescription className="text-xs">
              Client: <strong className="text-foreground">{leadName || 'Client'}</strong> •{' '}
              {isGst ? 'Prefixed with INV-GST-2026' : 'Prefixed with INV-NON-2026'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="NEFT">NEFT / Bank Transfer</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PAID">PAID (Settled)</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Transaction / Ref ID</label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI/429104812"
                />
              </div>
            </div>

            {/* Dynamic Items Builder */}
            <div className="border border-border/80 rounded-lg p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Billed Items
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-card p-2 rounded-md border border-border/60">
                    <Input
                      placeholder="Item description"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="flex-1 text-xs"
                      required
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-16 text-xs text-center"
                      required
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Rate ₹"
                      value={it.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      className="w-24 text-xs text-right"
                      required
                    />
                    <span className="text-muted-foreground font-mono text-[11px] w-20 text-right">
                      {formatCurrency((it.quantity || 1) * (it.rate || 0))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="text-muted-foreground hover:text-red-400 p-1 transition disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 pt-3 border-t border-border flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-64 text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {isGst && (
                  <div className="flex justify-between w-64 text-muted-foreground">
                    <span>GST (18%):</span>
                    <span>{formatCurrency(gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 font-bold text-sm text-foreground pt-1 border-t border-border/80">
                  <span>Grand Total:</span>
                  <span className="text-emerald-500">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Invoice Notes / Terms</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {submitting ? 'Generating...' : 'Issue Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
