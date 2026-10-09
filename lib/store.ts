import {
  initialUsers,
  initialStatuses,
  initialTypes,
  initialProducts,
  initialLeads,
  initialQuotations,
  initialInvoices,
  initialProposals,
  initialSales,
  initialTickets,
} from './mock-data';
import {
  User,
  Lead,
  LeadStatus,
  LeadType,
  Product,
  Quotation,
  Invoice,
  Proposal,
  Sale,
  SupportTicket,
  TicketMessage,
  LeadRemark,
} from './types';

// In-memory persistent state (globalThis to persist through Fast Refresh in Next.js development)
declare global {
  // eslint-disable-next-line no-var
  var __crmStore: {
    users: User[];
    statuses: LeadStatus[];
    types: LeadType[];
    products: Product[];
    leads: Lead[];
    quotations: Quotation[];
    invoices: Invoice[];
    proposals: Proposal[];
    sales: Sale[];
    tickets: SupportTicket[];
    nextQuoteNumber: number;
    nextInvoiceNumber: number;
    nextTicketNumber: number;
  } | undefined;
}

if (!global.__crmStore) {
  global.__crmStore = {
    users: JSON.parse(JSON.stringify(initialUsers)),
    statuses: JSON.parse(JSON.stringify(initialStatuses)),
    types: JSON.parse(JSON.stringify(initialTypes)),
    products: JSON.parse(JSON.stringify(initialProducts)),
    leads: JSON.parse(JSON.stringify(initialLeads)),
    quotations: JSON.parse(JSON.stringify(initialQuotations)),
    invoices: JSON.parse(JSON.stringify(initialInvoices)),
    proposals: JSON.parse(JSON.stringify(initialProposals)),
    sales: JSON.parse(JSON.stringify(initialSales)),
    tickets: JSON.parse(JSON.stringify(initialTickets)),
    nextQuoteNumber: 2,
    nextInvoiceNumber: 2,
    nextTicketNumber: 839211,
  };
}

const store = global.__crmStore;

export const crmStore = {
  // --- USERS ---
  getUsers: () => store.users,
  getUserByEmail: (email: string) =>
    store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  getUserById: (id: string) => store.users.find((u) => u.id === id),
  createUser: (data: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name || data.email?.split('@')[0] || 'New User',
      email: data.email!,
      role: data.role || 'AGENT',
      phone: data.phone || null,
      avatarUrl: data.avatarUrl || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    return newUser;
  },

  // --- METADATA ---
  getStatuses: () => store.statuses,
  getTypes: () => store.types,
  getProducts: () => store.products,

  // --- LEADS ---
  getLeads: (filter?: {
    search?: string;
    statusId?: string;
    typeId?: string;
    assignedToId?: string;
  }) => {
    let list = [...store.leads];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          l.phone.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }
    if (filter?.statusId && filter.statusId !== 'ALL') {
      list = list.filter((l) => l.statusId === filter.statusId);
    }
    if (filter?.typeId && filter.typeId !== 'ALL') {
      list = list.filter((l) => l.typeId === filter.typeId);
    }
    if (filter?.assignedToId && filter.assignedToId !== 'ALL') {
      list = list.filter((l) => l.assignedToId === filter.assignedToId);
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getLeadById: (id: string) => {
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;

    // Attach related quotations, invoices, proposals, sales
    const quotations = store.quotations.filter((q) => q.leadId === id);
    const invoices = store.invoices.filter((i) => i.leadId === id);
    const proposals = store.proposals.filter((p) => p.leadId === id);
    const sales = store.sales.filter((s) => s.leadId === id);
    const supportTickets = store.tickets.filter((t) => t.leadId === id);

    return {
      ...lead,
      quotations,
      invoices,
      proposals,
      sales,
      supportTickets,
    };
  },

  createLead: (data: Partial<Lead>) => {
    const status = store.statuses.find((s) => s.id === data.statusId) || store.statuses[0];
    const type = store.types.find((t) => t.id === data.typeId) || store.types[0];
    const assignedTo = store.users.find((u) => u.id === data.assignedToId) || store.users[1];

    const newLead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name || 'Unnamed Lead',
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || '',
      city: data.city || null,
      state: data.state || null,
      address: data.address || null,
      source: data.source || 'Direct Entry',
      callbackDate: data.callbackDate || null,
      notes: data.notes || null,
      statusId: status.id,
      status,
      typeId: type.id,
      type,
      assignedToId: assignedTo.id,
      assignedTo,
      remarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.leads.unshift(newLead);
    return newLead;
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    const idx = store.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    const current = store.leads[idx];
    const status = updates.statusId ? store.statuses.find((s) => s.id === updates.statusId) || current.status : current.status;
    const type = updates.typeId ? store.types.find((t) => t.id === updates.typeId) || current.type : current.type;
    const assignedTo = updates.assignedToId ? store.users.find((u) => u.id === updates.assignedToId) || current.assignedTo : current.assignedTo;

    store.leads[idx] = {
      ...current,
      ...updates,
      status,
      type,
      assignedTo,
      updatedAt: new Date().toISOString(),
    };
    return store.leads[idx];
  },

  deleteLead: (id: string) => {
    const idx = store.leads.findIndex((l) => l.id === id);
    if (idx !== -1) {
      store.leads.splice(idx, 1);
      return true;
    }
    return false;
  },

  addLeadRemark: (leadId: string, note: string, authorName: string) => {
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const remark: LeadRemark = {
      id: `rem_${Date.now()}`,
      leadId,
      note,
      createdBy: authorName,
      createdAt: new Date().toISOString(),
    };
    if (!lead.remarks) lead.remarks = [];
    lead.remarks.unshift(remark);
    lead.updatedAt = new Date().toISOString();
    return remark;
  },

  bulkAssignLeads: (leadIds: string[], newAgentId: string) => {
    const agent = store.users.find((u) => u.id === newAgentId);
    if (!agent) return false;

    store.leads.forEach((l) => {
      if (leadIds.includes(l.id)) {
        l.assignedToId = agent.id;
        l.assignedTo = agent;
        l.updatedAt = new Date().toISOString();
      }
    });
    return true;
  },

  // --- QUOTATIONS ---
  getQuotations: () => store.quotations,
  createQuotation: (data: Partial<Quotation>) => {
    const quoteNum = `QT-2026-${String(store.nextQuoteNumber++).padStart(4, '0')}`;
    const lead = store.leads.find((l) => l.id === data.leadId);
    const agent = store.users.find((u) => u.id === data.agentId) || store.users[1];

    const newQuotation: Quotation = {
      id: `quote_${Date.now()}`,
      quotationNumber: quoteNum,
      leadId: data.leadId!,
      agentId: agent.id,
      subject: data.subject || 'Quotation',
      offer: data.offer || null,
      discount: Number(data.discount || 0),
      subtotal: Number(data.subtotal || 0),
      gstAmount: Number(data.gstAmount || 0),
      grandTotal: Number(data.grandTotal || 0),
      status: data.status || 'PENDING',
      validTill: data.validTill || null,
      callbackDate: data.callbackDate || null,
      termsConditions: data.termsConditions || '1. Valid for 15 days.\n2. 100% advance payment.',
      createdAt: new Date().toISOString(),
      items: data.items || [],
      lead: lead ? { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company } : undefined,
      agent: { name: agent.name, email: agent.email },
    };

    store.quotations.unshift(newQuotation);
    return newQuotation;
  },

  updateQuotationStatus: (id: string, status: Quotation['status']) => {
    const q = store.quotations.find((item) => item.id === id);
    if (q) {
      q.status = status;
      return q;
    }
    return null;
  },

  // --- INVOICES ---
  getInvoices: () => store.invoices,
  createInvoice: (data: Partial<Invoice>) => {
    const prefix = data.isGst ? 'INV-GST-2026' : 'INV-NON-2026';
    const invNum = `${prefix}-${String(store.nextInvoiceNumber++).padStart(4, '0')}`;
    const lead = store.leads.find((l) => l.id === data.leadId);
    const agent = store.users.find((u) => u.id === data.agentId) || store.users[1];

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invNum,
      leadId: data.leadId!,
      agentId: agent.id,
      isGst: data.isGst ?? true,
      status: data.status || 'PENDING',
      subtotal: Number(data.subtotal || 0),
      gstAmount: Number(data.gstAmount || 0),
      grandTotal: Number(data.grandTotal || 0),
      paymentMode: data.paymentMode || 'UPI',
      transactionId: data.transactionId || null,
      validTill: data.validTill || null,
      callbackDate: data.callbackDate || null,
      termsConditions: data.termsConditions || 'Standard payment terms apply.',
      createdAt: new Date().toISOString(),
      items: data.items || [],
      lead: lead ? { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company } : undefined,
      agent: { name: agent.name, email: agent.email },
    };

    store.invoices.unshift(newInvoice);
    return newInvoice;
  },

  updateInvoiceStatus: (id: string, status: Invoice['status']) => {
    const inv = store.invoices.find((i) => i.id === id);
    if (inv) {
      inv.status = status;
      return inv;
    }
    return null;
  },

  // --- PROPOSALS ---
  getProposals: () => store.proposals,
  createProposal: (data: Partial<Proposal>) => {
    const lead = store.leads.find((l) => l.id === data.leadId);
    const agent = store.users.find((u) => u.id === data.agentId) || store.users[1];

    const newProposal: Proposal = {
      id: `prop_${Date.now()}`,
      leadId: data.leadId!,
      agentId: agent.id,
      productId: data.productId || null,
      title: data.title || 'Product & Service Rate Chart',
      offer: data.offer || null,
      discount: data.discount || '0',
      message: data.message || null,
      status: data.status || 'Active',
      proposalType: data.proposalType || 'standard',
      includeRateTable: data.includeRateTable ?? true,
      slabsData: data.slabsData || [],
      includePackages: data.includePackages ?? false,
      packagesData: data.packagesData || [],
      createdAt: new Date().toISOString(),
      lead: lead ? { name: lead.name, email: lead.email, phone: lead.phone } : undefined,
      agent: { name: agent.name, email: agent.email },
    };

    store.proposals.unshift(newProposal);
    return newProposal;
  },

  // --- SALES ---
  getSales: () => store.sales,
  createSale: (data: Partial<Sale>) => {
    const lead = store.leads.find((l) => l.id === data.leadId);
    const agent = store.users.find((u) => u.id === data.agentId) || store.users[1];

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      leadId: data.leadId!,
      agentId: agent.id,
      saleDate: data.saleDate || new Date().toISOString(),
      amount: Number(data.amount || 0),
      validity: data.validity || null,
      gstNo: data.gstNo || null,
      modeOfPayment: data.modeOfPayment || 'UPI',
      isPrepaid: data.isPrepaid ?? true,
      transactionId: data.transactionId || null,
      targetAudience: data.targetAudience || null,
      targetLocation: data.targetLocation || null,
      dltDone: data.dltDone ?? false,
      dltRequired: data.dltRequired ?? false,
      remarks: data.remarks || null,
      createdAt: new Date().toISOString(),
      lead: lead ? { name: lead.name, company: lead.company, phone: lead.phone } : undefined,
      agent: { name: agent.name, email: agent.email },
    };

    store.sales.unshift(newSale);

    // If won, auto-update lead status to converted
    if (lead) {
      const wonStatus = store.statuses.find((s) => s.name.toLowerCase().includes('won') || s.name.toLowerCase().includes('convert'));
      if (wonStatus) {
        lead.statusId = wonStatus.id;
        lead.status = wonStatus;
      }
    }

    return newSale;
  },

  // --- TICKETS ---
  getTickets: () => store.tickets,
  getTicketById: (id: string) => store.tickets.find((t) => t.id === id),
  createTicket: (data: Partial<SupportTicket>) => {
    const ticketNum = `TICK-${store.nextTicketNumber++}`;
    const lead = store.leads.find((l) => l.id === data.leadId);
    const creator = store.users.find((u) => u.id === data.createdById) || store.users[1];
    const assignee = store.users.find((u) => u.id === data.assignedToId) || store.users[3];

    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber: ticketNum,
      leadId: data.leadId!,
      createdById: creator.id,
      assignedToId: assignee?.id || null,
      subject: data.subject || 'Support Request',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lead: lead ? { name: lead.name, company: lead.company, email: lead.email, phone: lead.phone } : undefined,
      createdBy: { name: creator.name, email: creator.email, role: creator.role },
      assignedTo: assignee ? { name: assignee.name, email: assignee.email, role: assignee.role } : null,
      messages: [],
    };

    store.tickets.unshift(newTicket);
    return newTicket;
  },

  addTicketMessage: (ticketId: string, senderId: string, messageText: string) => {
    const ticket = store.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    const sender = store.users.find((u) => u.id === senderId) || store.users[0];
    const msg: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId,
      message: messageText,
      createdAt: new Date().toISOString(),
      sender: { name: sender.name, role: sender.role, avatarUrl: sender.avatarUrl },
    };

    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push(msg);
    ticket.updatedAt = new Date().toISOString();
    return msg;
  },

  updateTicket: (id: string, updates: Partial<SupportTicket>) => {
    const ticket = store.tickets.find((t) => t.id === id);
    if (!ticket) return null;

    if (updates.status) ticket.status = updates.status;
    if (updates.priority) ticket.priority = updates.priority;
    if (updates.assignedToId) {
      ticket.assignedToId = updates.assignedToId;
      const assignee = store.users.find((u) => u.id === updates.assignedToId);
      ticket.assignedTo = assignee ? { name: assignee.name, email: assignee.email, role: assignee.role } : null;
    }
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  },

  // --- REMINDERS ENGINE ---
  getDueReminders: (userId?: string, advanceMinutes: number = 30) => {
    const nowMs = Date.now();
    const thresholdMs = nowMs + advanceMinutes * 60 * 1000;

    return store.leads.filter((lead) => {
      if (!lead.callbackDate) return false;
      if (userId && lead.assignedToId !== userId) return false;

      const callbackMs = new Date(lead.callbackDate).getTime();
      // Due if callback time is in the past (overdue) or within advanceMinutes window
      return callbackMs <= thresholdMs;
    });
  },

  snoozeReminder: (leadId: string, minutes: number = 10) => {
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const newDate = new Date(Date.now() + minutes * 60 * 1000);
    lead.callbackDate = newDate.toISOString();
    lead.updatedAt = new Date().toISOString();
    return lead;
  },

  clearReminder: (leadId: string) => {
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    lead.callbackDate = null;
    lead.updatedAt = new Date().toISOString();
    return lead;
  },

  // --- ANALYTICS ---
  getAnalytics: () => {
    const totalLeads = store.leads.length;
    const activeQuotations = store.quotations.filter((q) => q.status === 'PENDING').length;
    const pendingInvoices = store.invoices.filter((i) => i.status === 'PENDING').length;
    const totalSalesVolume = store.sales.reduce((sum, s) => sum + s.amount, 0);
    const openTickets = store.tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    // Funnel
    const funnel = [
      { stage: 'New Leads', count: store.leads.filter((l) => l.status?.name.includes('New')).length || 1 },
      { stage: 'Contacted', count: store.leads.filter((l) => l.status?.name.includes('Contacted')).length || 1 },
      { stage: 'Proposals', count: store.proposals.length || 1 },
      { stage: 'Won / Deals', count: store.sales.length || 1 },
    ];

    // Monthly Sales
    const monthlySales = [
      { month: 'May', revenue: 145000 },
      { month: 'Jun', revenue: 210000 },
      { month: 'Jul', revenue: 185000 },
      { month: 'Aug', revenue: 320000 },
      { month: 'Sep', revenue: 290000 },
      { month: 'Oct', revenue: totalSalesVolume > 0 ? totalSalesVolume : 178000 },
    ];

    // Agent Leaderboard
    const agentLeaderboard = store.users
      .filter((u) => u.role === 'AGENT')
      .map((agent) => {
        const agentLeads = store.leads.filter((l) => l.assignedToId === agent.id);
        const agentSales = store.sales.filter((s) => s.agentId === agent.id);
        const salesTotal = agentSales.reduce((sum, s) => sum + s.amount, 0);
        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          leadsCount: agentLeads.length,
          dealsClosed: agentSales.length,
          revenue: salesTotal,
          avatarUrl: agent.avatarUrl,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return {
      kpi: {
        totalLeads,
        activeQuotations,
        pendingInvoices,
        totalSalesVolume,
        openTickets,
      },
      funnel,
      monthlySales,
      agentLeaderboard,
    };
  },
};
