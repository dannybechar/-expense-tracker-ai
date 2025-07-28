'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { storage } from '@/lib/storage';

interface CategoryData {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

const getCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '📄',
    Other: '📦',
  };
  return icons[category];
};

const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: '#ef4444', // red-500
    Transportation: '#3b82f6', // blue-500  
    Entertainment: '#8b5cf6', // purple-500
    Shopping: '#ec4899', // pink-500
    Bills: '#f59e0b', // yellow-500
    Other: '#6b7280', // gray-500
  };
  return colors[category];
};

export default function MonthlyInsights() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  monthlyExpenses.forEach(expense => {
    categoryBreakdown[expense.category] += expense.amount;
  });

  const totalSpending = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);
  
  const topCategories: CategoryData[] = Object.entries(categoryBreakdown)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      color: getCategoryColor(category as ExpenseCategory),
      icon: getCategoryIcon(category as ExpenseCategory),
    }));

  // Calculate budget streak (simplified - just counting days with expenses this month)
  const daysWithExpenses = new Set(
    monthlyExpenses.map(expense => new Date(expense.date).getDate())
  ).size;

  // SVG Donut Chart
  const DonutChart = () => {
    const radius = 80;
    const strokeWidth = 20;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    let accumulatedPercentage = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={normalizedRadius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {topCategories.map((category, index) => {
            const strokeDasharray = `${category.percentage / 100 * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercentage / 100 * circumference;
            accumulatedPercentage += category.percentage;
            
            return (
              <circle
                key={category.category}
                cx="80"
                cy="80"
                r={normalizedRadius}
                stroke={category.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Spending</div>
          </div>
        </div>
      </div>
    );
  };

  if (monthlyExpenses.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center border-b border-dashed border-border pb-4">
          Monthly Insights
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>No expenses this month</p>
          <p className="text-sm">Add some expenses to see your insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8">
      <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center border-b border-dashed border-border pb-4">
        Monthly Insights
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="space-y-6">
          <DonutChart />
          <div className="text-center text-sm text-muted-foreground">
            Donut chart!
          </div>
        </div>

        {/* Categories and Budget Streak */}
        <div className="space-y-6">
          {/* Top 3 Categories */}
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center space-x-4">
                <div 
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-card-foreground">
                    {category.category}: {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
            ))}
            <div className="text-right text-sm text-muted-foreground mt-2">
              Top 3!
            </div>
          </div>

          {/* Budget Streak */}
          <div className="border border-dashed border-border rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Budget Streak
            </h3>
            <div className="text-4xl font-bold text-green-500 mb-1">
              {daysWithExpenses}
            </div>
            <div className="text-muted-foreground">
              days!
            </div>
            <div className="mt-3">
              <div className="w-16 h-6 bg-muted rounded-full mx-auto border border-border"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}