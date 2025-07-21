export type ServiceStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'scheduled';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface CloudService {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: ServiceStatus;
  lastSync?: string;
  features: string[];
  connected: boolean;
  premium?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'personal' | 'tax' | 'analysis';
  fields: string[];
  format: 'csv' | 'pdf' | 'json' | 'xlsx';
  useCase: string;
  popular?: boolean;
}

export interface ExportHistory {
  id: string;
  templateId: string;
  templateName: string;
  service: string;
  status: ExportStatus;
  recordCount: number;
  fileSize: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  shareUrl?: string;
  error?: string;
}

export interface ScheduledExport {
  id: string;
  templateId: string;
  service: string;
  frequency: ScheduleFrequency;
  nextRun: string;
  enabled: boolean;
  destination: string;
}

export interface ShareSettings {
  isPublic: boolean;
  password?: string;
  expiresAt?: string;
  allowDownload: boolean;
  allowComments: boolean;
}