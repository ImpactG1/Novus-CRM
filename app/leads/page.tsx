'use client';

import { LeadTable } from '@/components/leads/lead-table';
import { useLeadDrawer } from '@/components/layout/app-shell';

export default function LeadsPage() {
  const { openLead, refreshTrigger } = useLeadDrawer();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Master Leads & Client Accounts
        </h1>
        <p className="text-xs text-muted-foreground">
          Filter, reassign, export, and manage client pipeline opportunities.
        </p>
      </div>

      <LeadTable
        onSelectLead={openLead}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
