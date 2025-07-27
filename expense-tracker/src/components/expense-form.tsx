'use client';

import { useState } from 'react';
import { ExpenseCategory, ExpenseFormData, Expense } from '@/types/expense';
import { generateId } from '@/lib/utils';
import { storage } from '@/lib/storage';

interface ExpenseFormProps {
  onSubmit?: (expense: Expense) => void;
  initialData?: Expense;
  onCancel?: () => void;
}

const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

export default function ExpenseForm({ onSubmit, initialData, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount.toString() || '',
    category: initialData?.category || 'Food',
    description: initialData?.description || '',
    vendor: initialData?.vendor || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ExpenseFormData> = {};

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const expense: Expense = {
        id: initialData?.id || generateId(),
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        vendor: formData.vendor?.trim() || undefined,
        date: formData.date,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: initialData ? new Date().toISOString() : undefined,
      };

      if (initialData) {
        storage.updateExpense(initialData.id, expense);
      } else {
        storage.addExpense(expense);
      }

      if (onSubmit) {
        onSubmit(expense);
      }

      if (!initialData) {
        setFormData({
          amount: '',
          category: 'Food',
          description: '',
          vendor: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-card-foreground mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground ${
              errors.amount ? 'border-destructive' : 'border-border'
            }`}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-card-foreground mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            disabled={isSubmitting}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground ${
              errors.description ? 'border-destructive' : 'border-border'
            }`}
            placeholder="Enter expense description"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-card-foreground mb-2">
            Vendor (Optional)
          </label>
          <input
            type="text"
            id="vendor"
            value={formData.vendor || ''}
            onChange={(e) => handleInputChange('vendor', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            placeholder="Enter vendor name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-card-foreground mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground ${
              errors.date ? 'border-destructive' : 'border-border'
            }`}
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-destructive">{errors.date}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}