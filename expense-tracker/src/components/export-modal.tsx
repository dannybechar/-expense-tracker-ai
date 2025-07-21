'use client';

import { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { exportToCSV, downloadCSV, exportToJSON, downloadJSON, exportToPDF, downloadPDF, formatCurrency, formatDate } from '@/lib/utils';

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  categories: ExpenseCategory[];
  searchTerm: string;
}

export default function ExportModal({ expenses, isOpen, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'preview'>('filters');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [customFilename, setCustomFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const [filters, setFilters] = useState<ExportFilters>({
    dateFrom: '',
    dateTo: '',
    categories: [],
    searchTerm: ''
  });

  const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  // Generate default filename based on format
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const extension = selectedFormat;
    setCustomFilename(`expenses-${today}.${extension}`);
  }, [selectedFormat]);

  // Filter expenses based on current filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Date filtering
      if (filters.dateFrom && expense.date < filters.dateFrom) return false;
      if (filters.dateTo && expense.date > filters.dateTo) return false;
      
      // Category filtering
      if (filters.categories.length > 0 && !filters.categories.includes(expense.category)) return false;
      
      // Search term filtering
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDescription = expense.description.toLowerCase().includes(searchLower);
        const matchesCategory = expense.category.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesCategory) return false;
      }
      
      return true;
    });
  }, [expenses, filters]);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleCategoryToggle = (category: ExpenseCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSelectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.length === categories.length ? [] : [...categories]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      categories: [],
      searchTerm: ''
    });
  };

  const simulateProgress = (duration: number) => {
    const steps = 20;
    const interval = duration / steps;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setExportProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, interval);
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No data to export with current filters!');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      if (selectedFormat === 'csv') {
        simulateProgress(800);
        await new Promise(resolve => setTimeout(resolve, 800));
        const csvContent = exportToCSV(filteredExpenses);
        downloadCSV(csvContent, customFilename);
      } else if (selectedFormat === 'json') {
        simulateProgress(600);
        await new Promise(resolve => setTimeout(resolve, 600));
        const jsonContent = exportToJSON(filteredExpenses);
        downloadJSON(jsonContent, customFilename);
      } else if (selectedFormat === 'pdf') {
        simulateProgress(2000);
        const pdfBlob = await exportToPDF(filteredExpenses);
        downloadPDF(pdfBlob, customFilename);
      }

      // Success animation
      setExportProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">Advanced Export</h2>
            <p className="text-muted-foreground mt-1">Export your expenses with advanced filtering and formatting options</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors p-1"
            disabled={isExporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'filters' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
            disabled={isExporting}
          >
            Filters & Options
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'preview' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
            disabled={isExporting}
          >
            Preview ({filteredExpenses.length} records)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'filters' && (
            <div className="space-y-6">
              {/* Export Format Selection */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Export Format</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { format: 'csv' as ExportFormat, name: 'CSV', description: 'Comma-separated values' },
                    { format: 'json' as ExportFormat, name: 'JSON', description: 'Structured data format' },
                    { format: 'pdf' as ExportFormat, name: 'PDF', description: 'Professional report' }
                  ].map(({ format, name, description }) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedFormat === format
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 text-card-foreground'
                      }`}
                      disabled={isExporting}
                    >
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filters */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      disabled={isExporting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      disabled={isExporting}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground">Categories</h3>
                  <button
                    onClick={handleSelectAllCategories}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                    disabled={isExporting}
                  >
                    {filters.categories.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        filters.categories.includes(category)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      disabled={isExporting}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Filter */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Search Filter</h3>
                <input
                  type="text"
                  placeholder="Search in descriptions and categories..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  disabled={isExporting}
                />
              </div>

              {/* Custom Filename */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Filename</h3>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  disabled={isExporting}
                />
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground border border-border rounded-md hover:bg-accent transition-colors"
                  disabled={isExporting}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">No Data to Preview</h3>
                  <p className="text-muted-foreground">Adjust your filters to see expenses that will be exported.</p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary/20 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-2">Export Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Records:</span>
                        <span className="ml-2 font-medium text-card-foreground">{filteredExpenses.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="ml-2 font-medium text-card-foreground">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <span className="ml-2 font-medium text-card-foreground uppercase">{selectedFormat}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Filename:</span>
                        <span className="ml-2 font-medium text-card-foreground">{customFilename}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary/10 px-4 py-2 border-b border-border">
                      <h3 className="font-semibold text-card-foreground">Data Preview (First 10 records)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/5">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.slice(0, 10).map((expense, index) => (
                            <tr key={expense.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary/5'}>
                              <td className="px-4 py-3 text-sm text-card-foreground">{formatDate(expense.date)}</td>
                              <td className="px-4 py-3 text-sm text-card-foreground font-medium">{formatCurrency(expense.amount)}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                  {expense.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-card-foreground">{expense.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredExpenses.length > 10 && (
                      <div className="px-4 py-2 bg-secondary/5 text-center text-sm text-muted-foreground border-t border-border">
                        ... and {filteredExpenses.length - 10} more records
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {isExporting && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Exporting {selectedFormat.toUpperCase()}...</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredExpenses.length} records selected • {formatCurrency(totalAmount)} total
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-border text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-md transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={filteredExpenses.length === 0 || isExporting}
                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}