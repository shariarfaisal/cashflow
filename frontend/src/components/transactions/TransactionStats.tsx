import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionStats as TransactionStatsType } from '@/types/transactions';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Receipt,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionStatsProps {
  stats: TransactionStatsType | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  iconClassName?: string;
  valueColor?: string;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconClassName,
  valueColor,
  iconColor,
}) => {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold', valueColor)}>{value}</p>
            {trend && trendValue && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
                <span
                  className={cn(
                    'text-sm',
                    trend === 'up' && 'text-green-500',
                    trend === 'down' && 'text-red-500',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon className={cn('h-6 w-6', iconColor || 'text-primary')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TransactionStats: React.FC<TransactionStatsProps> = ({
  stats,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const netProfitTrend = stats.net_profit >= 0 ? 'up' : 'down';
  const cashFlowTrend =
    stats.total_income - stats.pending_income - (stats.total_expenses - stats.pending_expenses) >= 0
      ? 'up'
      : 'down';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total Income"
        value={formatCurrency(stats.total_income)}
        icon={TrendingUp}
        valueColor="text-green-600 dark:text-green-400"
        iconColor="text-green-600 dark:text-green-400"
      />

      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.total_expenses)}
        icon={TrendingDown}
        valueColor="text-red-600 dark:text-red-400"
        iconColor="text-red-600 dark:text-red-400"
      />

      <StatCard
        title="Net Profit"
        value={formatCurrency(stats.net_profit)}
        icon={DollarSign}
        trend={netProfitTrend}
        trendValue={`${((stats.net_profit / (stats.total_income || 1)) * 100).toFixed(1)}%`}
        valueColor="text-blue-600 dark:text-blue-400"
        iconColor="text-blue-600 dark:text-blue-400"
      />

      <StatCard
        title="Total Transactions"
        value={formatNumber(stats.total_transactions)}
        icon={Receipt}
        valueColor="text-purple-600 dark:text-purple-400"
        iconColor="text-purple-600 dark:text-purple-400"
      />

      <StatCard
        title="Average Transaction"
        value={formatCurrency(stats.average_transaction)}
        icon={Activity}
        valueColor="text-orange-600 dark:text-orange-400"
        iconColor="text-orange-600 dark:text-orange-400"
      />

      <StatCard
        title="Cash Flow"
        value={formatCurrency(
          stats.total_income - stats.pending_income - (stats.total_expenses - stats.pending_expenses)
        )}
        icon={Clock}
        trend={cashFlowTrend}
        trendValue={`${stats.pending_income > 0 ? formatCurrency(stats.pending_income) + ' pending' : 'All clear'}`}
        valueColor="text-cyan-600 dark:text-cyan-400"
        iconColor="text-cyan-600 dark:text-cyan-400"
      />
    </div>
  );
};