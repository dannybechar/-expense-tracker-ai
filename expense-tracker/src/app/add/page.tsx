'use client';

import { useRouter } from 'next/navigation';
import ExpenseForm from '@/components/expense-form';

export default function AddExpensePage() {
  const router = useRouter();

  const handleExpenseAdded = () => {
    router.push('/expenses');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ExpenseForm onSubmit={handleExpenseAdded} />
    </div>
  );
}