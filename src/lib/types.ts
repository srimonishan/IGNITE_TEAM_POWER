export type Domain = 'apartment';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
export type UserRole = 'admin' | 'tenant' | 'staff';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string;
  phone?: string;
  specialization?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  location: string;
  status: Status;
  domain: Domain;
  timestamp: string;
  assignedTo?: string;
  assignedToUid?: string;
  tenantUid?: string;
  tenantName?: string;
  tenantUnit?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  predictedPriority: Priority;
  predictedCategory: string;
  confidence: number;
  summary: string;
  resolutionSteps: string[];
  estimatedTime: string;
  reasoning: string;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  criticalCount: number;
  recentAlerts: ServiceRequest[];
}

export interface DomainConfig {
  id: Domain;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  categories: string[];
  color: string;
}
