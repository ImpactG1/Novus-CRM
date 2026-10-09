'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  FileSpreadsheet,
  ReceiptText,
  Layers,
  Headphones,
  BellRing,
  Volume2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { playReminderSound } from '@/lib/audio';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
}

export function Sidebar({ collapsed, onToggle, currentUser }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Leads & Accounts', href: '/leads', icon: Users2 },
    { label: 'Quotations', href: '/quotations', icon: FileSpreadsheet },
    { label: 'Invoices', href: '/invoices', icon: ReceiptText },
    { label: 'Proposals & Rates', href: '/proposals', icon: Layers },
    { label: 'Support Tickets', href: '/tickets', icon: Headphones },
  ];

  const handleTestSound = () => {
    playReminderSound('chime', 85);
    toast.success('Synthetic Two-Tone Chime (523Hz & 659Hz) triggered!');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-30 select-none',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-bold shadow-md shadow-blue-500/20">
            ▲
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-sm flex items-center gap-1.5">
                Vercel CRM
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-mono font-medium">
                  FREE
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">Serverless Enterprise</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Core Modules
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Audio Test Tile */}
        <div className="pt-4">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Audio Engine
            </div>
          )}
          <button
            onClick={handleTestSound}
            title="Test synthetic Web Audio API chime"
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition border border-dashed border-border/80',
              collapsed && 'justify-center'
            )}
          >
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            {!collapsed && <span>Test 523/659Hz Chime</span>}
          </button>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition bg-muted/40 border border-border/40',
            collapsed && 'justify-center'
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-500 font-bold text-xs text-white">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-foreground">
                {currentUser?.name || 'Alexander Wright'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={currentUser?.role === 'ADMIN' ? 'purple' : currentUser?.role === 'SUPPORT' ? 'warning' : 'default'}
                  className="text-[10px] py-0 px-1.5"
                >
                  {currentUser?.role || 'ADMIN'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
