'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { Expense } from '@/types/expense';

interface VendorStat {
  vendor: string;
  total: number;
  count: number;
  percentage: number;
  averageAmount: number;
  lastPurchase: string;
}

export default function TopVendorsPage() {
  const [vendorStats, setVendorStats] = useState<VendorStat[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expenses = storage.getExpenses();
    calculateVendorStats(expenses);
  }, []);

  const calculateVendorStats = (expenses: Expense[]) => {
    // Filter expenses that have vendor information
    const expensesWithVendors = expenses.filter(expense => expense.vendor && expense.vendor.trim() !== '');
    
    const vendorTotals: Record<string, { total: number; count: number; dates: string[] }> = {};

    const total = expensesWithVendors.reduce((sum, expense) => {
      const vendor = expense.vendor!.trim();
      if (!vendorTotals[vendor]) {
        vendorTotals[vendor] = { total: 0, count: 0, dates: [] };
      }
      vendorTotals[vendor].total += expense.amount;
      vendorTotals[vendor].count += 1;
      vendorTotals[vendor].dates.push(expense.date);
      return sum + expense.amount;
    }, 0);

    const stats: VendorStat[] = Object.entries(vendorTotals).map(([vendor, data]) => {
      // Find the most recent purchase date
      const sortedDates = data.dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      return {
        vendor,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
        averageAmount: data.count > 0 ? data.total / data.count : 0,
        lastPurchase: sortedDates[0]
      };
    });

    // Sort by total spending descending
    stats.sort((a, b) => b.total - a.total);

    setVendorStats(stats);
    setTotalSpending(total);
    setLoading(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVendorIcon = (vendor: string): string => {
    const lowerVendor = vendor.toLowerCase();
    
    // Common vendor patterns
    if (lowerVendor.includes('restaurant') || lowerVendor.includes('cafe') || lowerVendor.includes('food')) {
      return '🍽️';
    }
    if (lowerVendor.includes('gas') || lowerVendor.includes('fuel') || lowerVendor.includes('shell') || lowerVendor.includes('exxon')) {
      return '⛽';
    }
    if (lowerVendor.includes('grocery') || lowerVendor.includes('market') || lowerVendor.includes('walmart') || lowerVendor.includes('target')) {
      return '🛒';
    }
    if (lowerVendor.includes('amazon') || lowerVendor.includes('shop') || lowerVendor.includes('store')) {
      return '🛍️';
    }
    if (lowerVendor.includes('bank') || lowerVendor.includes('utility') || lowerVendor.includes('electric') || lowerVendor.includes('water')) {
      return '🏦';
    }
    if (lowerVendor.includes('pharmacy') || lowerVendor.includes('cvs') || lowerVendor.includes('walgreens')) {
      return '💊';
    }
    
    return '🏪'; // Default store icon
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Top Vendors</h1>
        <p className="text-muted-foreground mt-2">
          Track your spending by vendor and merchant
        </p>
      </div>

      {vendorStats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No vendor data found
          </h3>
          <p className="text-muted-foreground">
            Add vendor information to your expenses to see top vendors
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-2">
              Total Vendor Spending: {formatCurrency(totalSpending)}
            </h2>
            <p className="text-muted-foreground">
              Across {vendorStats.length} vendor{vendorStats.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid gap-4">
            {vendorStats.map((stat, index) => (
              <div
                key={stat.vendor}
                className="bg-card rounded-lg border border-border p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getVendorIcon(stat.vendor)}</div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        #{index + 1} {stat.vendor}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.count} purchase{stat.count !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last purchase: {formatDate(stat.lastPurchase)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(stat.total)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.percentage.toFixed(1)}% of vendor spending
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Average per purchase: {formatCurrency(stat.averageAmount)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}