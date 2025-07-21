'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { calculateExpenseSummary, exportToCSV, downloadCSV } from '@/lib/utils';
import { storage } from '@/lib/storage';
import SummaryCards from '@/components/summary-cards';
import CategoryBreakdown from '@/components/category-breakdown';
import RecentExpenses from '@/components/recent-expenses';
import Link from 'next/link';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    try {
      const loadedExpenses = storage.getExpenses();
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (expenses.length === 0) {
      alert('No expenses to export!');
      return;
    }
    
    const csvContent = exportToCSV(expenses);
    const filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = calculateExpenseSummary(expenses);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your expense tracker. Here&apos;s your financial overview.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            Export Data
          </button>
          <Link
            href="/add"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Add Expense
          </Link>
        </div>
      </div>

      <SummaryCards summary={summary} />

      {expenses.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              Welcome to Expense Tracker!
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t added any expenses yet. Start tracking your spending to see 
              insights and manage your finances better.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/add"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Add Your First Expense
              </Link>
              <Link
                href="/expenses"
                className="border border-border text-muted-foreground px-6 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                View All Expenses
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CategoryBreakdown 
              categoryBreakdown={summary.categoryBreakdown}
              totalSpending={summary.totalSpending}
            />
          </div>
          
          <div className="space-y-6">
            <RecentExpenses expenses={expenses} />
            
            {summary.topCategory && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  Top Spending Category
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {summary.topCategory === 'Food' && '🍽️'}
                      {summary.topCategory === 'Transportation' && '🚗'}
                      {summary.topCategory === 'Entertainment' && '🎬'}
                      {summary.topCategory === 'Shopping' && '🛍️'}
                      {summary.topCategory === 'Bills' && '📄'}
                      {summary.topCategory === 'Other' && '📦'}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {summary.topCategory}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your highest spending category
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-card-foreground">
                      {((summary.categoryBreakdown[summary.topCategory] / summary.totalSpending) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of total spending
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
