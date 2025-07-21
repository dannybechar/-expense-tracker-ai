'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, ExpenseFilters } from '@/types/expense';
import { formatCurrency, formatDate, filterExpenses, exportToCSV, downloadCSV } from '@/lib/utils';
import { storage } from '@/lib/storage';

interface ExpenseListProps {
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  expenses?: Expense[];
}

const categories: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

export default function ExpenseList({ onEdit, onDelete, expenses: propExpenses }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (propExpenses) {
      setExpenses(propExpenses);
    } else {
      loadExpenses();
    }
  }, [propExpenses]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [expenses, filters, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExpenses = () => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
  };

  const applyFiltersAndSort = () => {
    const filtered = filterExpenses(expenses, filters);
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredExpenses(filtered);
  };

  const handleFilterChange = (key: keyof ExpenseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      storage.deleteExpense(id);
      if (onDelete) {
        onDelete(id);
      } else {
        loadExpenses();
      }
    }
  };

  const handleExport = () => {
    const csvContent = exportToCSV(filteredExpenses);
    downloadCSV(csvContent, `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const getSortIcon = (field: 'date' | 'amount' | 'category') => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↗️' : '↘️';
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">Expenses</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-border text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Category
            </label>
            <select
              value={filters.category || 'All'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No expenses found</p>
            <p>Try adjusting your filters or add some expenses to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th 
                    className="text-left py-3 px-4 font-medium text-card-foreground cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('date')}
                  >
                    Date {getSortIcon('date')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-card-foreground cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {getSortIcon('amount')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-card-foreground cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('category')}
                  >
                    Category {getSortIcon('category')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-card-foreground">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-card-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-card-foreground">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-card-foreground">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-card-foreground">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-destructive hover:text-destructive/80 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}