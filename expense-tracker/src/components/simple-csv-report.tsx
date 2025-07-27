'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { storage } from '@/lib/storage';
import { exportToCSV, downloadCSV, formatCurrency } from '@/lib/utils';

export default function SimpleCsvReport() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
  }, []);

  const handleExportCSV = async () => {
    if (expenses.length === 0) {
      alert('No expenses to export!');
      return;
    }

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const csvContent = exportToCSV(expenses);
      downloadCSV(csvContent, 'simple-expense-report.csv');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Simple CSV Report</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Total Expenses:</span>
            <span className="ml-2 font-bold text-gray-800">{expenses.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <span className="ml-2 font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No expenses found. Add some expenses first!</p>
        </div>
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Expenses (Last 5)</h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(-5).reverse().map((expense, index) => (
                  <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-600">{expense.date}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{expense.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleExportCSV}
          disabled={expenses.length === 0 || isExporting}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Downloads a CSV file with all {expenses.length} expenses
        </p>
      </div>
    </div>
  );
}