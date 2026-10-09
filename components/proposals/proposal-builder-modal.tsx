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
import { Plus, Trash2, Layers, Sparkles, Percent, Wallet, FileSpreadsheet, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName?: string;
  onCreated?: () => void;
}

export function ProposalBuilderModal({
  open,
  onOpenChange,
  leadId,
  leadName,
  onCreated,
}: ProposalBuilderModalProps) {
  const [title, setTitle] = useState('Product & Service Rate Chart');
  const [offer, setOffer] = useState('Festive 10% Volume Credit Bonus');
  const [globalDiscount, setGlobalDiscount] = useState<number>(5);
  const [message, setMessage] = useState(
    'Please review our tiered pricing for enterprise messaging, WhatsApp API, and cloud licenses below.'
  );

  // Multi-table slab generator
  const [tables, setTables] = useState<
    Array<{
      tableName: string;
      rows: Array<{ slab: string; rate: number; discount: number; bonus: string; units: number }>;
    }>
  >([
    {
      tableName: 'Promotional & Transactional SMS Slabs (DLT Registered)',
      rows: [
        { slab: '50,000 - 100,000 SMS', rate: 0.18, discount: 0, bonus: '2,500 Bonus Units', units: 50000 },
        { slab: '100,001 - 500,000 SMS', rate: 0.15, discount: 5, bonus: '15,000 Bonus Units', units: 250000 },
        { slab: '500,001 - 1,000,000 SMS', rate: 0.12, discount: 10, bonus: '50,000 Bonus Units', units: 750000 },
      ],
    },
    {
      tableName: 'WhatsApp Business API Notification Slabs',
      rows: [
        { slab: 'Up to 25,000 Sessions', rate: 0.55, discount: 0, bonus: '500 Free Template Approvals', units: 25000 },
        { slab: '25,001 - 100,000 Sessions', rate: 0.45, discount: 5, bonus: '2,500 Free Template Approvals', units: 75000 },
      ],
    },
  ]);

  // Wallet Credits Tier Builder
  const [includePackages, setIncludePackages] = useState(true);
  const [packages, setPackages] = useState([
    { tierName: 'Starter Wallet', investment: 25000, bonusPercent: 5, totalValue: 26250 },
    { tierName: 'Growth Accelerator', investment: 75000, bonusPercent: 12, totalValue: 84000 },
    { tierName: 'Enterprise Mega Tier', investment: 200000, bonusPercent: 20, totalValue: 240000 },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const applyGlobalDiscount = () => {
    const updated = tables.map((tbl) => ({
      ...tbl,
      rows: tbl.rows.map((r) => ({
        ...r,
        discount: globalDiscount,
      })),
    }));
    setTables(updated);
    toast.success(`Applied ${globalDiscount}% discount to all slabs!`);
  };

  const handleAddTable = () => {
    setTables([
      ...tables,
      {
        tableName: `Service Rate Chart ${tables.length + 1}`,
        rows: [{ slab: 'Standard Tier', rate: 1.0, discount: 0, bonus: '100 Units', units: 1000 }],
      },
    ]);
  };

  const handleAddRow = (tableIdx: number) => {
    const updated = [...tables];
    updated[tableIdx].rows.push({
      slab: 'New Volume Slab',
      rate: 0.15,
      discount: 0,
      bonus: 'Bonus Units',
      units: 10000,
    });
    setTables(updated);
  };

  const handleRemoveRow = (tableIdx: number, rowIdx: number) => {
    const updated = [...tables];
    if (updated[tableIdx].rows.length <= 1) return;
    updated[tableIdx].rows.splice(rowIdx, 1);
    setTables(updated);
  };

  const handlePackageChange = (idx: number, field: string, val: any) => {
    const updated = [...packages];
    updated[idx] = { ...updated[idx], [field]: val };
    const inv = Number(updated[idx].investment) || 0;
    const bonus = Number(updated[idx].bonusPercent) || 0;
    updated[idx].totalValue = Math.round(inv + (inv * bonus) / 100);
    setPackages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setSubmitting(true);
    try {
      // Calculate full row totals with GST (18%)
      const processedSlabsData = tables.map((t) => ({
        tableName: t.tableName,
        rows: t.rows.map((r) => {
          const baseRate = Number(r.rate) || 0;
          const disc = Number(r.discount) || 0;
          const discountedRate = baseRate * (1 - disc / 100);
          const taxable = (Number(r.units) || 1000) * discountedRate;
          const gst = (taxable * 18) / 100;
          const total = taxable + gst;
          return {
            slab: r.slab,
            rate: baseRate,
            discount: disc,
            bonus: r.bonus,
            taxable: Math.round(taxable),
            gst: Math.round(gst),
            total: Math.round(total),
          };
        }),
      }));

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          title,
          offer,
          discount: `${globalDiscount}%`,
          message,
          includeRateTable: true,
          slabsData: processedSlabsData,
          includePackages,
          packagesData: packages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save proposal');

      toast.success('Proposal and Dynamic Rate Chart saved!');
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error saving proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Dynamic Rate Chart & Proposal Builder
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lead: <strong className="text-foreground">{leadName || 'Client'}</strong> • Multi-Table
              Slabs & Wallet Packages
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Proposal Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Offer / Campaign Highlight</label>
                <Input value={offer} onChange={(e) => setOffer(e.target.value)} />
              </div>
            </div>

            {/* Global Discount Applicator Bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-foreground">Global Slab Discount Applicator</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(Number(e.target.value) || 0)}
                  className="w-16 h-8 rounded border border-border bg-background px-2 text-center text-xs"
                />
                <span className="text-muted-foreground">%</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyGlobalDiscount}
                  className="h-8 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300"
                >
                  Apply All
                </Button>
              </div>
            </div>

            {/* Multi-Table Slabs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Rate Chart Tables
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTable}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Rate Table
                </Button>
              </div>

              {tables.map((tbl, tblIdx) => (
                <div key={tblIdx} className="border border-border/80 rounded-lg p-3 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={tbl.tableName}
                      onChange={(e) => {
                        const updated = [...tables];
                        updated[tblIdx].tableName = e.target.value;
                        setTables(updated);
                      }}
                      className="font-semibold text-xs h-8 max-w-md bg-card"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddRow(tblIdx)}
                      className="h-7 text-xs text-primary"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Slab
                    </Button>
                  </div>

                  {/* Slab Rows */}
                  <div className="space-y-1.5 pt-1">
                    {tbl.rows.map((row, rowIdx) => (
                      <div
                        key={rowIdx}
                        className="grid grid-cols-12 gap-2 bg-card p-2 rounded border border-border/60 items-center text-xs"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Volume Slab"
                            value={row.slab}
                            onChange={(e) => {
                              const updated = [...tables];
                              updated[tblIdx].rows[rowIdx].slab = e.target.value;
                              setTables(updated);
                            }}
                            className="w-full bg-transparent border-0 text-foreground font-medium focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground block">Rate ₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={row.rate}
                            onChange={(e) => {
                              const updated = [...tables];
                              updated[tblIdx].rows[rowIdx].rate = Number(e.target.value);
                              setTables(updated);
                            }}
                            className="w-full bg-background border border-border/80 rounded px-1.5 py-0.5 text-xs text-right"
                          />
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground block">Disc %</span>
                          <input
                            type="number"
                            value={row.discount}
                            onChange={(e) => {
                              const updated = [...tables];
                              updated[tblIdx].rows[rowIdx].discount = Number(e.target.value);
                              setTables(updated);
                            }}
                            className="w-full bg-background border border-border/80 rounded px-1.5 py-0.5 text-xs text-right"
                          />
                        </div>
                        <div className="col-span-3">
                          <span className="text-[10px] text-muted-foreground block">Bonus Units</span>
                          <input
                            type="text"
                            value={row.bonus}
                            onChange={(e) => {
                              const updated = [...tables];
                              updated[tblIdx].rows[rowIdx].bonus = e.target.value;
                              setTables(updated);
                            }}
                            className="w-full bg-background border border-border/80 rounded px-1.5 py-0.5 text-xs"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(tblIdx, rowIdx)}
                            disabled={tbl.rows.length <= 1}
                            className="text-muted-foreground hover:text-red-400 p-1 disabled:opacity-20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Wallet Credits Tier Builder */}
            <div className="border border-border/80 rounded-lg p-3 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                    Wallet Credits Tier Packages
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePackages}
                    onChange={(e) => setIncludePackages(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  Include in Proposal
                </label>
              </div>

              {includePackages && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="bg-card p-3 rounded-lg border border-emerald-500/30 space-y-2 shadow-sm"
                    >
                      <input
                        type="text"
                        value={pkg.tierName}
                        onChange={(e) => handlePackageChange(idx, 'tierName', e.target.value)}
                        className="font-bold text-xs text-primary bg-transparent border-0 w-full focus:outline-none"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Investment:</span>
                        <input
                          type="number"
                          value={pkg.investment}
                          onChange={(e) =>
                            handlePackageChange(idx, 'investment', Number(e.target.value))
                          }
                          className="w-24 text-right bg-background border border-border rounded px-1.5 py-0.5 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Bonus Credit %:</span>
                        <input
                          type="number"
                          value={pkg.bonusPercent}
                          onChange={(e) =>
                            handlePackageChange(idx, 'bonusPercent', Number(e.target.value))
                          }
                          className="w-16 text-right bg-background border border-border rounded px-1.5 py-0.5 text-xs text-emerald-400 font-bold"
                        />
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between font-bold text-xs text-foreground">
                        <span>Total Value:</span>
                        <span className="text-emerald-400">₹{pkg.totalValue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {submitting ? 'Generating...' : 'Save Rate Chart Proposal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
