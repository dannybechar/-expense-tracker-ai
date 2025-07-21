'use client';

import { ExpenseSummary } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  summary: ExpenseSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(summary.totalSpending),
      icon: '💰',
      description: 'All time total',
    },
    {
      title: 'This Month',
      value: formatCurrency(summary.monthlySpending),
      icon: '📅',
      description: 'Current month spending',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(summary.averageExpense),
      icon: '📊',
      description: 'Per expense average',
    },
    {
      title: 'Total Expenses',
      value: summary.expenseCount.toString(),
      icon: '📝',
      description: 'Number of expenses',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{card.icon}</div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}