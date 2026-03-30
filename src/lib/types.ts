export type Domain = 'apartment' | 'university' | 'healthcare' | 'mall' | 'corporate';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

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
