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
import { Plus, Trash2, Calculator, Send, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName?: string;
  onCreated?: () => void;
}

export function CreateQuotationModal({
  open,
  onOpenChange,
  leadId,
  leadName,
  onCreated,
}: CreateQuotationModalProps) {
  const [subject, setSubject] = useState('Product & Service Proposal');
  const [offer, setOffer] = useState('Special Introductory Offer');
  const [discount, setDiscount] = useState<number>(0);
  const [validTill, setValidTill] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState(
    '1. 100% advance on order confirmation.\n2. Taxes applicable @ 18% GST.\n3. Delivery within 48 hours of payment.'
  );

  const [items, setItems] = useState<
    Array<{ description: string; quantity: number; rate: number; taxRate: number }>
  >([
    { description: 'Enterprise Cloud CRM (Annual)', quantity: 1, rate: 49999, taxRate: 18 },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, taxRate: 18 }]);
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

  // Calculations
  const calculatedItems = items.map((it) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.rate) || 0;
    const taxable = qty * rate;
    const gst = (taxable * (Number(it.taxRate) || 18)) / 100;
    const total = taxable + gst;
    return { ...it, taxable, gst, total };
  });

  const subtotalBeforeDiscount = calculatedItems.reduce((acc, it) => acc + it.taxable, 0);
  const effectiveSubtotal = Math.max(0, subtotalBeforeDiscount - Number(discount || 0));
  const totalGst = (effectiveSubtotal * 18) / 100;
  const grandTotal = effectiveSubtotal + totalGst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          subject,
          offer,
          discount: Number(discount || 0),
          validTill: validTill ? new Date(validTill).toISOString() : null,
          termsConditions: terms,
          items: items.map((it) => ({
            description: it.description || 'Service Deliverable',
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            taxRate: 18,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create quotation');

      toast.success(`Quotation ${data.quotation.quotationNumber} created!`);
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error creating quotation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Create Official Quotation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lead: <strong className="text-foreground">{leadName || 'Client'}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Proposal"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Offer / Highlight</label>
                <Input
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="e.g. 10% Early Bird Discount"
                />
              </div>
            </div>

            {/* Dynamic Items Builder */}
            <div className="border border-border/80 rounded-lg p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Line Items (Auto GST 18%)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
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

              {/* Totals Summary */}
              <div className="mt-4 pt-3 border-t border-border flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-64 text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotalBeforeDiscount)}</span>
                </div>
                <div className="flex items-center justify-between w-64">
                  <span className="text-muted-foreground">Discount (₹):</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-24 h-6 text-right rounded border border-border px-1.5 text-xs bg-background"
                  />
                </div>
                <div className="flex justify-between w-64 text-muted-foreground">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(totalGst)}</span>
                </div>
                <div className="flex justify-between w-64 font-bold text-sm text-foreground pt-1 border-t border-border/80">
                  <span>Grand Total:</span>
                  <span className="text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Valid Till</label>
                <Input
                  type="date"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Generating...' : 'Save & Issue Quotation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
