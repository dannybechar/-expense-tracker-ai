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

export function exportToJSON(expenses: Expense[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    expenses: expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadJSON(content: string, filename: string = 'expenses.json'): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
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

export async function exportToPDF(expenses: Expense[]): Promise<Blob> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Report', 20, 25);
  
  // Export info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Records: ${expenses.length}`, 20, 40);
  
  // Table headers
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 20, 55);
  doc.text('Amount', 60, 55);
  doc.text('Category', 100, 55);
  doc.text('Description', 140, 55);
  
  // Draw header line
  doc.line(20, 57, 190, 57);
  
  // Table data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let yPosition = 65;
  const maxDescriptionLength = 25;
  
  expenses.forEach((expense) => {
    if (yPosition > 270) { // Start new page if needed
      doc.addPage();
      yPosition = 25;
      
      // Repeat headers on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Date', 20, yPosition);
      doc.text('Amount', 60, yPosition);
      doc.text('Category', 100, yPosition);
      doc.text('Description', 140, yPosition);
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    }
    
    const formattedDate = formatDate(expense.date);
    const formattedAmount = formatCurrency(expense.amount);
    const truncatedDescription = expense.description.length > maxDescriptionLength 
      ? expense.description.substring(0, maxDescriptionLength) + '...'
      : expense.description;
    
    doc.text(formattedDate, 20, yPosition);
    doc.text(formattedAmount, 60, yPosition);
    doc.text(expense.category, 100, yPosition);
    doc.text(truncatedDescription, 140, yPosition);
    
    yPosition += 8;
  });
  
  // Summary at the end
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  yPosition += 10;
  
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 25;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 20, yPosition);
  
  return new Promise((resolve) => {
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
}

export function downloadPDF(blob: Blob, filename: string = 'expenses.pdf'): void {
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}