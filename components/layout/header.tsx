'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Volume2,
  ShieldAlert,
  UserCheck,
  Headphones,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { playReminderSound, requestNotificationPermission } from '@/lib/audio';
import { toast } from 'sonner';

interface HeaderProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
  onRoleSwitch?: (role: 'ADMIN' | 'AGENT' | 'SUPPORT') => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  dueCount?: number;
}

export function Header({
  currentUser,
  onRoleSwitch,
  onOpenLogin,
  onLogout,
  dueCount = 0,
}: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check initial html class
    if (document.documentElement.classList.contains('light')) {
      setTheme('light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  };

  const handleRequestNotifications = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      toast.success('Desktop Notifications enabled!');
    } else {
      toast.info(`Notification status: ${perm}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/70 px-6 backdrop-blur-xl">
      {/* Search / Breadcrumb */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, invoices, quotations..."
            className="h-9 w-full rounded-lg border border-border/80 bg-background/60 pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Role Switcher Pill */}
        <div className="hidden sm:flex items-center bg-muted/60 rounded-lg p-0.5 border border-border/60 text-xs">
          <span className="px-2 text-muted-foreground font-medium text-[11px]">Role:</span>
          {(['ADMIN', 'AGENT', 'SUPPORT'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRoleSwitch?.(r)}
              className={`px-2.5 py-1 rounded-md font-semibold transition text-[11px] ${
                currentUser?.role === r
                  ? 'bg-card text-foreground shadow-sm font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Desktop Notification Enable */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRequestNotifications}
          title="Enable native desktop notifications"
          className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
          {dueCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
              {dueCount}
            </span>
          )}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          title="Toggle light / dark mode"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition ml-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-xs font-bold text-white shadow-sm">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{currentUser?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
              <Badge variant="default" className="mt-1.5 text-[10px]">
                {currentUser?.role}
              </Badge>
            </div>

            <DropdownMenuItem onClick={onOpenLogin} className="text-xs py-2">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              Passwordless OTP Login
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Switch Test Role
            </div>
            <DropdownMenuItem onClick={() => onRoleSwitch?.('ADMIN')} className="text-xs">
              <ShieldAlert className="h-3.5 w-3.5 mr-2 text-purple-400" />
              Switch to ADMIN (Full Access)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleSwitch?.('AGENT')} className="text-xs">
              <UserCheck className="h-3.5 w-3.5 mr-2 text-blue-400" />
              Switch to AGENT (Quotes/Invoices)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleSwitch?.('SUPPORT')} className="text-xs">
              <Headphones className="h-3.5 w-3.5 mr-2 text-amber-400" />
              Switch to SUPPORT (Tickets)
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onLogout} className="text-xs text-red-400 hover:text-red-300">
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
