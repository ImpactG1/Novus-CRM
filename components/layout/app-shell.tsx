'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { LeadProfileDrawer } from '@/components/leads/lead-profile-drawer';
import { ReminderListener } from '@/components/reminders/reminder-listener';
import { LoginModal } from '@/components/auth/login-modal';
import { Toaster, toast } from 'sonner';

interface LeadDrawerContextType {
  activeLeadId: string | null;
  openLead: (id: string) => void;
  closeLead: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const LeadDrawerContext = createContext<LeadDrawerContextType>({
  activeLeadId: null,
  openLead: () => {},
  closeLead: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const useLeadDrawer = () => useContext(LeadDrawerContext);

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load current session
  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.warn('Failed to load user session:', e);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleRoleSwitch = async (role: 'ADMIN' | 'AGENT' | 'SUPPORT') => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        toast.success(`Role switched to ${role} (${data.user.name})`);
        setRefreshKey((prev) => prev + 1);
      }
    } catch (e) {
      toast.error('Failed to switch role');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('Signed out. Reset to demo guest.');
      loadUser();
    } catch (e) {}
  };

  const contextValue: LeadDrawerContextType = {
    activeLeadId,
    openLead: (id: string) => setActiveLeadId(id),
    closeLead: () => setActiveLeadId(null),
    refreshTrigger: refreshKey,
    triggerRefresh: () => setRefreshKey((prev) => prev + 1),
  };

  return (
    <LeadDrawerContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
        {/* Sonner Toast Notifications */}
        <Toaster position="top-right" richColors theme="dark" />

        {/* Collapsible Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
        />

        {/* Main App Container */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Sticky Header */}
          <Header
            currentUser={currentUser}
            onRoleSwitch={handleRoleSwitch}
            onOpenLogin={() => setLoginModalOpen(true)}
            onLogout={handleLogout}
          />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Global Interactive Lead Profile Drawer */}
        <LeadProfileDrawer
          leadId={activeLeadId}
          open={!!activeLeadId}
          onOpenChange={(open) => !open && setActiveLeadId(null)}
          onLeadUpdated={() => setRefreshKey((prev) => prev + 1)}
        />

        {/* Global Background Reminders Engine & Modal */}
        <ReminderListener onOpenLead={(id) => setActiveLeadId(id)} />

        {/* Passwordless OTP Login Modal */}
        <LoginModal
          open={loginModalOpen}
          onOpenChange={setLoginModalOpen}
          onSuccess={(user) => {
            setCurrentUser(user);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </div>
    </LeadDrawerContext.Provider>
  );
}
