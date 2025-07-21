'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { CloudService, ExportTemplate, ExportHistory, ScheduledExport } from '@/types/cloud-export';
import QRCode from 'qrcode';

interface CloudExportDashboardProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudExportDashboard({ expenses, isOpen, onClose }: CloudExportDashboardProps) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'templates' | 'history' | 'schedule' | 'share'>('integrations');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [shareQR, setShareQR] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock data - in a real app, this would come from API
  const cloudServices: CloudService[] = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      description: 'Send exports directly to email recipients',
      status: 'connected',
      lastSync: '2 hours ago',
      features: ['Email delivery', 'Multiple recipients', 'Custom templates'],
      connected: true
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: '📊',
      description: 'Sync data to Google Sheets automatically',
      status: 'connected',
      lastSync: '5 minutes ago',
      features: ['Real-time sync', 'Automatic formatting', 'Collaborative editing'],
      connected: true
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      description: 'Store exports in your Dropbox account',
      status: 'disconnected',
      lastSync: undefined,
      features: ['Cloud storage', 'File versioning', 'Team sharing'],
      connected: false
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      description: 'Microsoft OneDrive integration',
      status: 'error',
      lastSync: '1 day ago',
      features: ['Office integration', 'Enterprise security', 'Version history'],
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Send reports to Slack channels',
      status: 'disconnected',
      lastSync: undefined,
      features: ['Channel notifications', 'Direct messages', 'Bot integration'],
      connected: false,
      premium: true
    },
    {
      id: 'webhook',
      name: 'Custom Webhook',
      icon: '🔗',
      description: 'Connect to any service via webhook',
      status: 'disconnected',
      lastSync: undefined,
      features: ['Custom endpoints', 'Header customization', 'Retry logic'],
      connected: false,
      premium: true
    }
  ];

  const exportTemplates: ExportTemplate[] = [
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'IRS-compliant expense report for tax filing',
      icon: '📋',
      category: 'tax',
      fields: ['Date', 'Amount', 'Category', 'Business Purpose', 'Receipt'],
      format: 'pdf',
      useCase: 'Perfect for annual tax preparation and audits',
      popular: true
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Comprehensive monthly expense overview',
      icon: '📅',
      category: 'business',
      fields: ['Category', 'Total Amount', 'Transaction Count', 'Average'],
      format: 'csv',
      useCase: 'Great for monthly budget reviews and planning',
      popular: true
    },
    {
      id: 'category-analysis',
      name: 'Category Analysis',
      description: 'Deep dive into spending patterns by category',
      icon: '📊',
      category: 'analysis',
      fields: ['Category', 'Amount', 'Percentage', 'Trend', 'Insights'],
      format: 'xlsx',
      useCase: 'Identify spending trends and optimization opportunities'
    },
    {
      id: 'receipt-backup',
      name: 'Receipt Backup',
      description: 'Complete transaction log with metadata',
      icon: '💾',
      category: 'personal',
      fields: ['All Fields', 'Timestamps', 'Location', 'Payment Method'],
      format: 'json',
      useCase: 'Complete data backup for record keeping'
    },
    {
      id: 'team-report',
      name: 'Team Expense Report',
      description: 'Formatted for team sharing and collaboration',
      icon: '👥',
      category: 'business',
      fields: ['Date', 'Amount', 'Category', 'Description', 'Status'],
      format: 'pdf',
      useCase: 'Professional reports for team meetings and approvals',
      popular: true
    },
    {
      id: 'budget-tracking',
      name: 'Budget Tracker',
      description: 'Track expenses against budget categories',
      icon: '🎯',
      category: 'personal',
      fields: ['Category', 'Budgeted', 'Actual', 'Difference', 'Status'],
      format: 'csv',
      useCase: 'Monitor spending against budget goals'
    }
  ];

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      templateId: 'monthly-summary',
      templateName: 'Monthly Summary',
      service: 'Google Sheets',
      status: 'completed',
      recordCount: 245,
      fileSize: '12.4 KB',
      createdAt: '2025-01-21T10:30:00Z',
      completedAt: '2025-01-21T10:31:15Z',
      downloadUrl: '#',
      shareUrl: 'https://expenses.app/share/abc123'
    },
    {
      id: '2',
      templateId: 'tax-report',
      templateName: 'Tax Report',
      service: 'Email',
      status: 'completed',
      recordCount: 189,
      fileSize: '2.1 MB',
      createdAt: '2025-01-20T15:45:00Z',
      completedAt: '2025-01-20T15:47:22Z',
      downloadUrl: '#'
    },
    {
      id: '3',
      templateId: 'category-analysis',
      templateName: 'Category Analysis',
      service: 'Dropbox',
      status: 'failed',
      recordCount: 312,
      fileSize: '0 KB',
      createdAt: '2025-01-19T09:15:00Z',
      error: 'Connection timeout - please check Dropbox integration'
    },
    {
      id: '4',
      templateId: 'team-report',
      templateName: 'Team Expense Report',
      service: 'Slack',
      status: 'processing',
      recordCount: 78,
      fileSize: 'Processing...',
      createdAt: '2025-01-21T14:20:00Z'
    }
  ];

  const scheduledExports: ScheduledExport[] = [
    {
      id: '1',
      templateId: 'monthly-summary',
      service: 'Google Sheets',
      frequency: 'monthly',
      nextRun: '2025-02-01T09:00:00Z',
      enabled: true,
      destination: 'Monthly Reports Sheet'
    },
    {
      id: '2',
      templateId: 'tax-report',
      service: 'Email',
      frequency: 'quarterly',
      nextRun: '2025-04-01T09:00:00Z',
      enabled: true,
      destination: 'accountant@company.com'
    }
  ];

  const generateShareQR = async (shareUrl: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setShareQR(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleServiceConnect = async (serviceId: string) => {
    // Simulate connection process
    console.log(`Connecting to ${serviceId}...`);
    // In real app, this would handle OAuth flow
  };

  const handleExport = async (templateId: string, serviceId: string) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exported ${templateId} to ${serviceId}`);
      // In real app, this would trigger the actual export
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `https://expenses.app/share/${Math.random().toString(36).substr(2, 9)}`;
    await generateShareQR(shareUrl);
    setShowShareModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cloud Export Hub
              </h2>
              <p className="text-muted-foreground">Connect, automate, and share your expense data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors p-2 rounded-lg hover:bg-white/50"
            disabled={isExporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-card">
          {[
            { id: 'integrations', label: 'Integrations', icon: '🔗' },
            { id: 'templates', label: 'Templates', icon: '📋' },
            { id: 'history', label: 'History', icon: '📊' },
            { id: 'schedule', label: 'Schedule', icon: '⏰' },
            { id: 'share', label: 'Share', icon: '🔗' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'integrations' | 'templates' | 'history' | 'schedule' | 'share')}
              className={`px-6 py-4 font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-accent'
              }`}
              disabled={isExporting}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Connect Your Services</h3>
                <p className="text-muted-foreground">Integrate with popular cloud services to automate your expense reporting</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cloudServices.map(service => (
                  <div 
                    key={service.id} 
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                      service.connected 
                        ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800'
                        : service.status === 'error'
                        ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800'
                        : 'border-border hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                            {service.name}
                            {service.premium && (
                              <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
                                PRO
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              service.status === 'connected' ? 'bg-green-500' :
                              service.status === 'error' ? 'bg-red-500' :
                              service.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                              'bg-gray-400'
                            }`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {service.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceConnect(service.id)}
                        disabled={isExporting || service.status === 'connecting'}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          service.connected
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100'
                        }`}
                      >
                        {service.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    {service.lastSync && (
                      <p className="text-xs text-muted-foreground mb-3">Last sync: {service.lastSync}</p>
                    )}
                    <div className="space-y-1">
                      {service.features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Export Templates</h3>
                <p className="text-muted-foreground">Pre-configured export formats for different use cases</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportTemplates.map(template => (
                  <div 
                    key={template.id}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-border hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-card-foreground">{template.name}</h4>
                            {template.popular && (
                              <span className="px-2 py-1 text-xs bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              template.category === 'business' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' :
                              template.category === 'tax' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' :
                              template.category === 'analysis' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100'
                            }`}>
                              {template.category}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-full uppercase">
                              {template.format}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <p className="text-xs text-muted-foreground mb-3 italic">{template.useCase}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.fields.slice(0, 3).map(field => (
                        <span key={field} className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded">
                          {field}
                        </span>
                      ))}
                      {template.fields.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded">
                          +{template.fields.length - 3} more
                        </span>
                      )}
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex gap-2">
                          <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                            disabled={isExporting}
                          >
                            <option value="">Select service...</option>
                            {cloudServices.filter(s => s.connected).map(service => (
                              <option key={service.id} value={service.id}>{service.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleExport(template.id, selectedService)}
                            disabled={!selectedService || isExporting}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isExporting ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Exporting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Export Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">Export History</h3>
                  <p className="text-muted-foreground">Track all your export activities</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent">
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent">
                    Export History
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {exportHistory.map(export_ => (
                  <div key={export_.id} className="p-4 border border-border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          export_.status === 'completed' ? 'bg-green-500' :
                          export_.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                          export_.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-card-foreground">{export_.templateName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{export_.service}</span>
                            <span>•</span>
                            <span>{export_.recordCount} records</span>
                            <span>•</span>
                            <span>{export_.fileSize}</span>
                            <span>•</span>
                            <span>{new Date(export_.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {export_.status === 'completed' && (
                          <>
                            {export_.shareUrl && (
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                              </button>
                            )}
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </>
                        )}
                        {export_.status === 'failed' && export_.error && (
                          <div className="text-sm text-red-600 max-w-xs">{export_.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Automated Exports</h3>
                <p className="text-muted-foreground">Set up recurring exports to keep your data in sync</p>
              </div>

              <div className="grid gap-4">
                {scheduledExports.map(schedule => (
                  <div key={schedule.id} className="p-6 border border-border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">
                            {exportTemplates.find(t => t.id === schedule.templateId)?.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{schedule.service}</span>
                            <span>•</span>
                            <span className="capitalize">{schedule.frequency}</span>
                            <span>•</span>
                            <span>Next: {new Date(schedule.nextRun).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">→ {schedule.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            className="sr-only peer"
                            onChange={() => {}}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="p-6 border-2 border-dashed border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium text-card-foreground">Add New Schedule</span>
                    <span className="text-sm text-muted-foreground">Automate your export workflow</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Share & Collaborate</h3>
                <p className="text-muted-foreground">Generate shareable links and collaborate with your team</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-border rounded-xl">
                  <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <span className="text-blue-500">🔗</span>
                    Quick Share Link
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a secure link to share your expense data with others
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://expenses.app/share/abc123"
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-accent"
                        readOnly
                      />
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Generate
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Password protect
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Set expiration
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-border rounded-xl">
                  <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <span className="text-purple-500">👥</span>
                    Team Collaboration
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite team members to view and collaborate on expense data
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="teammate@company.com"
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-md"
                      />
                      <select className="px-3 py-2 text-sm border border-border rounded-md">
                        <option>View only</option>
                        <option>Can edit</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <button className="w-full px-4 py-2 border border-border rounded-md hover:bg-accent text-sm">
                      Send Invitation
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-border rounded-xl">
                  <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <span className="text-green-500">📱</span>
                    QR Code Access
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate QR codes for quick mobile access
                  </p>
                  <div className="text-center">
                    {shareQR ? (
                      <img src={shareQR} alt="QR Code" className="mx-auto mb-3" />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-gray-400">QR Code Preview</span>
                      </div>
                    )}
                    <button
                      onClick={handleShare}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Generate QR Code
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-border rounded-xl">
                  <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <span className="text-orange-500">📊</span>
                    Public Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a public dashboard with selected metrics
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Total expenses
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Category breakdown
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Monthly trends
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded" />
                        Recent transactions
                      </label>
                    </div>
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm">
                      Create Public Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>{expenses.length} records ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>End-to-end encrypted</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-border text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-md transition-colors"
                disabled={isExporting}
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-md transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                disabled={isExporting}
              >
                🚀 Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-card rounded-xl shadow-2xl border border-border max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Share Link Generated</h3>
            <div className="text-center">
              {shareQR && (
                <img src={shareQR} alt="QR Code" className="mx-auto mb-4" />
              )}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                <code className="text-sm break-all">https://expenses.app/share/abc123def</code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText('https://expenses.app/share/abc123def')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}