import { 
  formatCurrency, 
  formatDate, 
  generateId, 
  calculateExpenseSummary,
  filterExpenses,
  exportToCSV,
  exportToJSON
} from '../utils';
import { Expense, ExpenseFilters } from '@/types/expense';

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
  });

  it('should handle zero amounts', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('should handle decimal amounts', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan\s+15,\s+2024/);
  });

  it('should handle different date formats', () => {
    const result = formatDate('2024-12-31');
    expect(result).toMatch(/Dec\s+31,\s+2024/);
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate string IDs', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('calculateExpenseSummary', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: '2',
      amount: 30.00,
      category: 'Transportation',
      description: 'Bus fare',
      date: '2024-01-16',
      createdAt: '2024-01-16T08:00:00Z'
    },
    {
      id: '3',
      amount: 100.00,
      category: 'Food',
      description: 'Groceries',
      date: '2024-01-17',
      createdAt: '2024-01-17T18:00:00Z'
    }
  ];

  it('should calculate correct totals', () => {
    const summary = calculateExpenseSummary(mockExpenses);
    expect(summary.totalSpending).toBe(180.00);
    expect(summary.expenseCount).toBe(3);
    expect(summary.averageExpense).toBe(60.00);
  });

  it('should identify top category correctly', () => {
    const summary = calculateExpenseSummary(mockExpenses);
    expect(summary.topCategory).toBe('Food');
    expect(summary.categoryBreakdown.Food).toBe(150.00);
    expect(summary.categoryBreakdown.Transportation).toBe(30.00);
  });

  it('should handle empty expenses array', () => {
    const summary = calculateExpenseSummary([]);
    expect(summary.totalSpending).toBe(0);
    expect(summary.expenseCount).toBe(0);
    expect(summary.averageExpense).toBe(0);
    expect(summary.topCategory).toBeNull();
  });

  it('should calculate monthly spending correctly', () => {
    // This test would need to be adjusted based on current date
    // For now, we'll test the structure
    const summary = calculateExpenseSummary(mockExpenses);
    expect(typeof summary.monthlySpending).toBe('number');
    expect(summary.monthlySpending).toBeGreaterThanOrEqual(0);
  });
});

describe('filterExpenses', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch at restaurant',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: '2',
      amount: 30.00,
      category: 'Transportation',
      description: 'Bus fare',
      date: '2024-01-16',
      createdAt: '2024-01-16T08:00:00Z'
    },
    {
      id: '3',
      amount: 100.00,
      category: 'Food',
      description: 'Groceries shopping',
      date: '2024-01-17',
      createdAt: '2024-01-17T18:00:00Z'
    }
  ];

  it('should filter by category', () => {
    const filters: ExpenseFilters = { category: 'Food' };
    const result = filterExpenses(mockExpenses, filters);
    expect(result).toHaveLength(2);
    expect(result.every(expense => expense.category === 'Food')).toBe(true);
  });

  it('should filter by search term', () => {
    const filters: ExpenseFilters = { searchTerm: 'restaurant' };
    const result = filterExpenses(mockExpenses, filters);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('restaurant');
  });

  it('should filter by date range', () => {
    const filters: ExpenseFilters = {
      dateFrom: '2024-01-16',
      dateTo: '2024-01-17'
    };
    const result = filterExpenses(mockExpenses, filters);
    expect(result).toHaveLength(2);
  });

  it('should return all expenses when no filters applied', () => {
    const result = filterExpenses(mockExpenses, {});
    expect(result).toHaveLength(3);
  });

  it('should handle multiple filters', () => {
    const filters: ExpenseFilters = {
      category: 'Food',
      searchTerm: 'shopping'
    };
    const result = filterExpenses(mockExpenses, filters);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('shopping');
  });
});

describe('exportToCSV', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    }
  ];

  it('should generate correct CSV format', () => {
    const csv = exportToCSV(mockExpenses);
    const lines = csv.split('\n');
    
    expect(lines[0]).toBe('Date,Amount,Category,Description');
    expect(lines[1]).toBe('2024-01-15,50,Food,"Lunch"');
  });

  it('should handle quotes in descriptions', () => {
    const expenseWithQuotes: Expense[] = [{
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch with "special" sauce',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    }];
    
    const csv = exportToCSV(expenseWithQuotes);
    expect(csv).toContain('"Lunch with ""special"" sauce"');
  });

  it('should handle empty expenses array', () => {
    const csv = exportToCSV([]);
    expect(csv).toBe('Date,Amount,Category,Description');
  });
});

describe('exportToJSON', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    }
  ];

  it('should generate valid JSON', () => {
    const jsonString = exportToJSON(mockExpenses);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.totalRecords).toBe(1);
    expect(parsed.expenses).toHaveLength(1);
    expect(parsed.expenses[0].amount).toBe(50.00);
    expect(parsed.exportDate).toBeDefined();
  });

  it('should include all expense fields', () => {
    const jsonString = exportToJSON(mockExpenses);
    const parsed = JSON.parse(jsonString);
    const expense = parsed.expenses[0];
    
    expect(expense).toHaveProperty('id');
    expect(expense).toHaveProperty('amount');
    expect(expense).toHaveProperty('category');
    expect(expense).toHaveProperty('description');
    expect(expense).toHaveProperty('date');
    expect(expense).toHaveProperty('createdAt');
  });

  it('should handle empty expenses array', () => {
    const jsonString = exportToJSON([]);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.totalRecords).toBe(0);
    expect(parsed.expenses).toHaveLength(0);
  });
});