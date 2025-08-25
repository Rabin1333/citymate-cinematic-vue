import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OverviewStats } from '@/services/analytics';

interface KPIGridProps {
  data?: OverviewStats;
  isLoading: boolean;
  error?: Error | null;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: 'currency' | 'percentage' | 'number';
  isLoading: boolean;
}

function KPICard({ title, value, icon, trend, format = 'number', isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground-secondary">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {Math.abs(trend.value)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KPIGrid({ data, isLoading, error }: KPIGridProps) {
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-foreground-secondary">Failed to load analytics data</p>
              <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data && !isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-foreground-secondary">No data available for the selected range</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <KPICard
        title="Tickets Sold"
        value={data?.ticketsSold || 0}
        icon={<Ticket className="w-4 h-4" />}
        trend={{ value: 12.5, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Seats Booked"
        value={data?.seatsBooked || 0}
        icon={<Users className="w-4 h-4" />}
        trend={{ value: 8.2, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Unique Customers"
        value={data?.uniqueCustomers || 0}
        icon={<Users className="w-4 h-4" />}
        trend={{ value: 15.1, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Gross Revenue"
        value={data?.grossRevenue || 0}
        icon={<DollarSign className="w-4 h-4" />}
        format="currency"
        trend={{ value: 23.4, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Net Revenue"
        value={data?.netRevenue || 0}
        icon={<DollarSign className="w-4 h-4" />}
        format="currency"
        trend={{ value: 18.7, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Cancellations"
        value={data?.cancellations || 0}
        icon={<AlertCircle className="w-4 h-4" />}
        trend={{ value: 3.2, isPositive: false }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Refunds"
        value={data?.refunds || 0}
        icon={<RefreshCw className="w-4 h-4" />}
        format="currency"
        trend={{ value: 5.1, isPositive: false }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Avg. Ticket Price"
        value={data?.averageTicketPrice || 0}
        icon={<DollarSign className="w-4 h-4" />}
        format="currency"
        trend={{ value: 2.3, isPositive: true }}
        isLoading={isLoading}
      />
      
      <KPICard
        title="Avg. Occupancy"
        value={data?.averageOccupancyRate || 0}
        icon={<Users className="w-4 h-4" />}
        format="percentage"
        trend={{ value: 4.8, isPositive: true }}
        isLoading={isLoading}
      />
    </div>
  );
}