import { Expense, ExpenseCategory, ExpenseSummary, ExpenseFilters } from '@/types/expense';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach(expense => {
    categoryBreakdown[expense.category] += expense.amount;
  });

  const topCategory = Object.entries(categoryBreakdown).reduce(
    (max, [category, amount]) => 
      amount > max.amount ? { category: category as ExpenseCategory, amount } : max,
    { category: null as ExpenseCategory | null, amount: 0 }
  ).category;

  return {
    totalSpending,
    monthlySpending,
    categoryBreakdown,
    topCategory,
    expenseCount: expenses.length,
    averageExpense: expenses.length > 0 ? totalSpending / expenses.length : 0,
  };
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter(expense => {
    if (filters.category && filters.category !== 'All' && expense.category !== filters.category) {
      return false;
    }

    if (filters.dateFrom && expense.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && expense.date > filters.dateTo) {
      return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(searchLower);
      const matchesCategory = expense.category.toLowerCase().includes(searchLower);
      if (!matchesDescription && !matchesCategory) {
        return false;
      }
    }

    return true;
  });
}

export function exportToCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Amount', 'Category', 'Description'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      expense.date,
      expense.amount.toString(),
      expense.category,
      `"${expense.description.replace(/"/g, '""')}"` // Escape quotes in CSV
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string = 'expenses.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}