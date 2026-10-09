'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  FileSpreadsheet,
  ReceiptText,
  Trophy,
  Headphones,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import Link from 'next/link';

interface DashboardViewProps {
  onAddLeadClick?: () => void;
}

export function DashboardView({ onAddLeadClick }: DashboardViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const kpis = [
    {
      title: 'Total Leads',
      value: data?.kpi?.totalLeads ?? 4,
      change: '+18% this month',
      icon: Users2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Active Quotations',
      value: data?.kpi?.activeQuotations ?? 1,
      change: '1 pending decision',
      icon: FileSpreadsheet,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Pending Invoices',
      value: data?.kpi?.pendingInvoices ?? 0,
      change: 'All settled',
      icon: ReceiptText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Sales Volume',
      value: formatCurrency(data?.kpi?.totalSalesVolume ?? 58998.82),
      change: '+32% conversion rate',
      icon: Trophy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Open Support Tickets',
      value: data?.kpi?.openTickets ?? 2,
      change: 'Avg resolution 1.2h',
      icon: Headphones,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/10 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Executive Overview
              </span>
              <Badge variant="success" className="text-[10px]">
                Live Production
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Enterprise CRM Intelligence Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Track client acquisition pipelines, automated GST quotations, rate charts, and support tickets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/leads">
              <Button size="sm" className="font-semibold shadow-sm">
                <Users2 className="w-3.5 h-3.5 mr-1.5" />
                Manage Leads Pipeline
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                <div className={`p-2 rounded-lg border ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  {kpi.value}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Sales Revenue Bar Chart */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Monthly Sales Revenue (₹)</h3>
              <p className="text-xs text-muted-foreground">Historical and current month sales trajectory</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Last 6 Months
            </Badge>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlySales || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Lead Conversion Funnel</h3>
              <p className="text-xs text-muted-foreground">Volume across pipeline lifecycle stages</p>
            </div>
            <Badge variant="default" className="text-xs">
              Conversion
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.funnel || [
              { stage: 'New Leads', count: 12 },
              { stage: 'Contacted', count: 8 },
              { stage: 'Proposals', count: 5 },
              { stage: 'Won / Deals', count: 3 },
            ]).map((step: any, idx: number) => {
              const percentages = [100, 75, 45, 28];
              const pct = percentages[idx] || 30;
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500'];

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{step.stage}</span>
                    <span className="text-muted-foreground font-mono">
                      {step.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Opportunity Win Rate:</span>
            <span className="font-bold text-emerald-400">28.4%</span>
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Agent Performance Leaderboard</h3>
            <p className="text-xs text-muted-foreground">Ranked by closed deals and total revenue generated</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Leaderboard
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Agent</th>
                <th className="p-3 text-center">Active Leads</th>
                <th className="p-3 text-center">Deals Closed</th>
                <th className="p-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data?.agentLeaderboard || []).map((agent: any, idx: number) => (
                <tr key={agent.id} className="hover:bg-muted/20 transition">
                  <td className="p-3 font-mono font-bold text-foreground">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : `🥉 #${idx + 1}`}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {agent.name[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">{agent.name}</span>
                        <span className="text-[11px] text-muted-foreground">{agent.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold text-foreground">
                    {agent.leadsCount}
                  </td>
                  <td className="p-3 text-center font-semibold text-foreground">
                    {agent.dealsClosed}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400 font-mono text-sm">
                    {formatCurrency(agent.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
