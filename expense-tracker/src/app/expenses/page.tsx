'use client';

import { useState } from 'react';
import ExpenseList from '@/components/expense-list';
import ExpenseForm from '@/components/expense-form';
import { Expense } from '@/types/expense';

export default function ExpensesPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleExpenseUpdated = () => {
    setEditingExpense(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleExpenseDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  if (editingExpense) {
    return (
      <div className="max-w-2xl mx-auto">
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleExpenseUpdated}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div>
      <ExpenseList
        key={refreshKey}
        onEdit={handleEdit}
        onDelete={handleExpenseDeleted}
      />
    </div>
  );
}