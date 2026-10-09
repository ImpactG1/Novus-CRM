export type Role = 'ADMIN' | 'AGENT' | 'SUPPORT';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type QuotationStatus = 'PENDING' | 'APPROVED' | 'NOT_INTERESTED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type DemoMode = 'ONLINE' | 'OFFLINE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string | Date;
}

export interface LeadStatus {
  id: string;
  name: string;
  color: string;
}

export interface LeadType {
  id: string;
  name: string;
}

export interface LeadRemark {
  id: string;
  leadId: string;
  note: string;
  createdBy?: string | null;
  createdAt: string | Date;
}

export interface Product {
  id: string;
  name: string;
  hsnCode?: string | null;
  price: number;
  description?: string | null;
  taxRate: number;
}

export interface QuotationItem {
  id?: string;
  productId?: string | null;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  taxable: number;
  gstAmount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  leadId: string;
  agentId: string;
  subject: string;
  offer?: string | null;
  discount: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  validTill?: string | null;
  callbackDate?: string | null;
  termsConditions?: string | null;
  createdAt: string | Date;
  items?: QuotationItem[];
  lead?: { name: string; email?: string | null; phone: string; company?: string | null };
  agent?: { name: string; email: string };
}

export interface InvoiceItem {
  id?: string;
  productId?: string | null;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  taxable: number;
  gstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  leadId: string;
  agentId: string;
  isGst: boolean;
  status: InvoiceStatus;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paymentMode?: string | null;
  transactionId?: string | null;
  validTill?: string | null;
  callbackDate?: string | null;
  termsConditions?: string | null;
  createdAt: string | Date;
  items?: InvoiceItem[];
  lead?: { name: string; email?: string | null; phone: string; company?: string | null };
  agent?: { name: string; email: string };
}

export interface ProposalSlabRow {
  slab: string;
  rate: number;
  discount: number;
  bonus: string;
  taxable: number;
  gst: number;
  total: number;
}

export interface ProposalSlabTable {
  tableName: string;
  rows: ProposalSlabRow[];
}

export interface ProposalPackageTier {
  tierName: string;
  investment: number;
  bonusPercent: number;
  totalValue: number;
  description?: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  agentId: string;
  productId?: string | null;
  title: string;
  offer?: string | null;
  discount: string;
  message?: string | null;
  status: string;
  proposalType: string;
  includeRateTable: boolean;
  slabsData: ProposalSlabTable[];
  includePackages: boolean;
  packagesData: ProposalPackageTier[];
  createdAt: string | Date;
  lead?: { name: string; email?: string | null; phone: string };
  agent?: { name: string; email: string };
}

export interface Sale {
  id: string;
  leadId: string;
  agentId: string;
  saleDate: string | Date;
  amount: number;
  validity?: string | null;
  gstNo?: string | null;
  modeOfPayment?: string | null;
  isPrepaid: boolean;
  transactionId?: string | null;
  targetAudience?: string | null;
  targetLocation?: string | null;
  dltDone: boolean;
  dltRequired: boolean;
  remarks?: string | null;
  createdAt: string | Date;
  lead?: { name: string; company?: string | null; phone: string };
  agent?: { name: string; email: string };
}

export interface Demo {
  id: string;
  leadId: string;
  agentId: string;
  productId?: string | null;
  demoDateTime: string | Date;
  demoMode: DemoMode;
  quantity: number;
  price: number;
  createdAt: string | Date;
  lead?: { name: string; company?: string | null };
  agent?: { name: string };
}

export interface Appointment {
  id: string;
  leadId: string;
  agentId: string;
  productId?: string | null;
  appointmentDate: string | Date;
  targetAudience?: string | null;
  targetLocation?: string | null;
  createdAt: string | Date;
  lead?: { name: string; company?: string | null };
  agent?: { name: string };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  leadId: string;
  createdById: string;
  assignedToId?: string | null;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  lead?: { name: string; company?: string | null; email?: string | null; phone: string };
  createdBy?: { name: string; email: string; role: Role };
  assignedTo?: { name: string; email: string; role: Role } | null;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: string | Date;
  sender?: { name: string; role: Role; avatarUrl?: string | null };
}

export interface Lead {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  source?: string | null;
  callbackDate?: string | null;
  notes?: string | null;
  statusId?: string | null;
  status?: LeadStatus | null;
  typeId?: string | null;
  type?: LeadType | null;
  assignedToId?: string | null;
  assignedTo?: User | null;
  remarks?: LeadRemark[];
  quotations?: Quotation[];
  invoices?: Invoice[];
  proposals?: Proposal[];
  sales?: Sale[];
  demos?: Demo[];
  appointments?: Appointment[];
  supportTickets?: SupportTicket[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
