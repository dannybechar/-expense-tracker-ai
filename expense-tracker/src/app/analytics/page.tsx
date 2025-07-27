'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Expense, ExpenseCategory } from '@/types/expense';

interface MonthlyData {
  month: string;
  year: number;
  totalSpending: number;
  expenseCount: number;
  averageExpense: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  topCategory: ExpenseCategory | null;
}

interface YearlyComparison {
  currentYear: number;
  previousYear: number;
  currentYearTotal: number;
  previousYearTotal: number;
  percentageChange: number;
}

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearlyComparison, setYearlyComparison] = useState<YearlyComparison | null>(null);

  useEffect(() => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
    calculateMonthlyAnalytics(loadedExpenses, selectedYear);
    calculateYearlyComparison(loadedExpenses, selectedYear);
  }, [selectedYear]);

  const calculateMonthlyAnalytics = (expenses: Expense[], year: number) => {
    const monthlyMap = new Map<string, Expense[]>();
    
    expenses
      .filter(expense => new Date(expense.date).getFullYear() === year)
      .forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, []);
        }
        monthlyMap.get(monthKey)!.push(expense);
      });

    const monthlyAnalytics: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([monthKey, monthExpenses]) => {
        const [yearStr, monthStr] = monthKey.split('-');
        const totalSpending = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const expenseCount = monthExpenses.length;
        const averageExpense = expenseCount > 0 ? totalSpending / expenseCount : 0;
        
        const categoryBreakdown: Record<ExpenseCategory, number> = {
          Food: 0,
          Transportation: 0,
          Entertainment: 0,
          Shopping: 0,
          Bills: 0,
          Other: 0,
        };
        
        monthExpenses.forEach(expense => {
          categoryBreakdown[expense.category] += expense.amount;
        });
        
        const topCategory = Object.entries(categoryBreakdown)
          .filter(([_, amount]) => amount > 0)
          .sort(([_, a], [__, b]) => b - a)[0]?.[0] as ExpenseCategory | null;

        return {
          month: new Date(parseInt(yearStr), parseInt(monthStr) - 1).toLocaleDateString('en-US', { month: 'long' }),
          year: parseInt(yearStr),
          totalSpending,
          expenseCount,
          averageExpense,
          categoryBreakdown,
          topCategory,
        };
      })
      .sort((a, b) => {
        const aDate = new Date(a.year, new Date(`${a.month} 1`).getMonth());
        const bDate = new Date(b.year, new Date(`${b.month} 1`).getMonth());
        return aDate.getTime() - bDate.getTime();
      });

    setMonthlyData(monthlyAnalytics);
  };

  const calculateYearlyComparison = (expenses: Expense[], currentYear: number) => {
    const previousYear = currentYear - 1;
    
    const currentYearExpenses = expenses.filter(expense => 
      new Date(expense.date).getFullYear() === currentYear
    );
    const previousYearExpenses = expenses.filter(expense => 
      new Date(expense.date).getFullYear() === previousYear
    );
    
    const currentYearTotal = currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousYearTotal = previousYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const percentageChange = previousYearTotal > 0 
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
      : 0;
    
    setYearlyComparison({
      currentYear,
      previousYear,
      currentYearTotal,
      previousYearTotal,
      percentageChange,
    });
  };

  const availableYears = Array.from(
    new Set(expenses.map(expense => new Date(expense.date).getFullYear()))
  ).sort((a, b) => b - a);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors = {
      Food: 'bg-orange-500',
      Transportation: 'bg-blue-500',
      Entertainment: 'bg-purple-500',
      Shopping: 'bg-pink-500',
      Bills: 'bg-red-500',
      Other: 'bg-gray-500',
    };
    return colors[category];
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monthly expense analysis and trends</p>
        </div>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {yearlyComparison && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Yearly Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(yearlyComparison.currentYearTotal)}
              </div>
              <div className="text-sm text-gray-600">{yearlyComparison.currentYear} Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {formatCurrency(yearlyComparison.previousYearTotal)}
              </div>
              <div className="text-sm text-gray-600">{yearlyComparison.previousYear} Total</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${yearlyComparison.percentageChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {yearlyComparison.percentageChange >= 0 ? '+' : ''}{yearlyComparison.percentageChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Year-over-Year Change</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Breakdown - {selectedYear}</h2>
        
        {monthlyData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expense data available for {selectedYear}
          </div>
        ) : (
          <div className="space-y-6">
            {monthlyData.map((month, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{month.month} {month.year}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(month.totalSpending)}</div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{month.expenseCount}</div>
                        <div className="text-sm text-gray-600">Transactions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(month.averageExpense)}</div>
                        <div className="text-sm text-gray-600">Avg. Expense</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{month.topCategory || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Top Category</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-80">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(month.categoryBreakdown)
                        .filter(([_, amount]) => amount > 0)
                        .sort(([_, a], [__, b]) => b - a)
                        .map(([category, amount]) => {
                          const percentage = (amount / month.totalSpending) * 100;
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getCategoryColor(category as ExpenseCategory)}`}></div>
                                <span className="text-sm text-gray-700">{category}</span>
                              </div>
                              <div className="text-sm text-gray-900 font-medium">
                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}