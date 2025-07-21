'use client';

import { Expense } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface RecentExpensesProps {
  expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Expenses</h3>
        <Link 
          href="/expenses"
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          View All
        </Link>
      </div>
      
      {recentExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No expenses yet</p>
          <p className="text-sm">
            <Link href="/add" className="text-primary hover:text-primary/80">
              Add your first expense
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentExpenses.map((expense) => (
            <div 
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      {expense.description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-card-foreground">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}