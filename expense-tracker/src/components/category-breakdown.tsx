'use client';

import { ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

interface CategoryBreakdownProps {
  categoryBreakdown: Record<ExpenseCategory, number>;
  totalSpending: number;
}

const getCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    Food: '🍽️',
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
    Food: 'bg-red-500',
    Transportation: 'bg-blue-500',
    Entertainment: 'bg-purple-500',
    Shopping: 'bg-pink-500',
    Bills: 'bg-yellow-500',
    Other: 'bg-gray-500',
  };
  return colors[category];
};

export default function CategoryBreakdown({ categoryBreakdown, totalSpending }: CategoryBreakdownProps) {
  const categories = Object.entries(categoryBreakdown)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a) as [ExpenseCategory, number][];

  if (categories.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Category Breakdown</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No expenses to show</p>
          <p className="text-sm">Add some expenses to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Category Breakdown</h3>
      
      <div className="space-y-4">
        {categories.map(([category, amount]) => {
          const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-card-foreground">
                    {formatCurrency(amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getCategoryColor(category)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}