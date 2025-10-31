// Core CRM Data Models

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  accountId?: string; // Link to Account/Company
  leadScore?: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  source: string;
  tags: string[];
  category: 'lead' | 'prospect' | 'customer' | 'partner';
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
  createdById?: string; // Creator / owner
}

export interface Account {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'enterprise';
  annualRevenue?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contacts: Contact[];
  opportunities: Opportunity[];
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  contactId?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number; // 0-100
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  description?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'sms' | 'meeting' | 'note' | 'task' | 'campaign';
  subject: string;
  description?: string;
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  userId: string;
  timestamp: Date;
  duration?: number; // in minutes
  outcome?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'proposal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Date;
  completedAt?: Date;
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  name: string;
  accountId: string;
  contactId?: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  description?: string;
  products: DealProduct[];
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface DealProduct {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  price: number;
  cost?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'sales' | 'marketing' | 'support';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Communication Models
export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  messages: EmailMessage[];
  isRead: boolean;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  attachments?: EmailAttachment[];
  isRead: boolean;
  isReplied: boolean;
  isForwarded: boolean;
  timestamp: Date;
  messageId: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

export interface Call {
  id: string;
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'no-answer' | 'busy' | 'failed';
  duration: number; // seconds
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  outcome?: string;
  userId: string;
  timestamp: Date;
}

export interface SMS {
  id: string;
  contactId: string;
  type: 'inbound' | 'outbound';
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  timestamp: Date;
  userId: string;
}

// Marketing Models
export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'direct-mail';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  subject?: string;
  content: string;
  templateId?: string;
  segmentId?: string;
  recipientIds: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria[];
  contactCount: number;
  isDynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logic?: 'and' | 'or';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'follow-up' | 'promotional' | 'newsletter' | 'custom';
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Analytics Models
export interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'marketing' | 'support' | 'custom';
  query: Record<string, any>;
  filters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// AI & Intelligence Models
export interface LeadScore {
  contactId: string;
  score: number;
  factors: LeadScoreFactor[];
  lastCalculated: Date;
}

export interface LeadScoreFactor {
  factor: string;
  weight: number;
  value: number;
  impact: number;
}

export interface AIRecommendation {
  id: string;
  type: 'action' | 'insight' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  contactId?: string;
  accountId?: string;
  opportunityId?: string;
  action?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// Integration Models
export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'calendar' | 'social' | 'payment' | 'other';
  provider: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Security & Compliance Models
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
