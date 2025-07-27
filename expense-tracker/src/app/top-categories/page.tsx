'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { Expense, ExpenseCategory } from '@/types/expense';

interface CategoryStat {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export default function TopCategoriesPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expenses = storage.getExpenses();
    calculateCategoryStats(expenses);
  }, []);

  const calculateCategoryStats = (expenses: Expense[]) => {
    const categoryTotals: Record<ExpenseCategory, { total: number; count: number }> = {
      'Food': { total: 0, count: 0 },
      'Transportation': { total: 0, count: 0 },
      'Entertainment': { total: 0, count: 0 },
      'Shopping': { total: 0, count: 0 },
      'Bills': { total: 0, count: 0 },
      'Other': { total: 0, count: 0 }
    };

    const total = expenses.reduce((sum, expense) => {
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
      return sum + expense.amount;
    }, 0);

    const stats: CategoryStat[] = Object.entries(categoryTotals).map(([category, data]) => ({
      category: category as ExpenseCategory,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      averageAmount: data.count > 0 ? data.total / data.count : 0
    }));

    // Sort by total spending descending
    stats.sort((a, b) => b.total - a.total);

    setCategoryStats(stats);
    setTotalSpending(total);
    setLoading(false);
  };

  const getCategoryIcon = (category: ExpenseCategory): string => {
    const icons: Record<ExpenseCategory, string> = {
      'Food': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Bills': '📋',
      'Other': '📦'
    };
    return icons[category];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Top Expense Categories</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your spending patterns by category
        </p>
      </div>

      {categoryStats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No expenses found
          </h3>
          <p className="text-muted-foreground">
            Add some expenses to see your top categories
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Total Spending: {formatCurrency(totalSpending)}</h2>
          </div>

          <div className="grid gap-4">
            {categoryStats.map((stat, index) => (
              <div
                key={stat.category}
                className="bg-card rounded-lg border border-border p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getCategoryIcon(stat.category)}</div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        #{index + 1} {stat.category}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.count} expense{stat.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(stat.total)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Average per expense: {formatCurrency(stat.averageAmount)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}