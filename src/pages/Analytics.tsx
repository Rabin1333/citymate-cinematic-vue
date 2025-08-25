import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { KPIGrid } from '@/components/analytics/KPIGrid';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { AnalyticsTables } from '@/components/analytics/AnalyticsTables';
import { 
  analyticsService, 
  AnalyticsFilters as IAnalyticsFilters,
  OverviewStats,
  MovieStats,
  ShowtimeStats,
  TimeSeriesData,
  RecentActivity,
  UtilizationData
} from '@/services/analytics';

const Analytics = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Default filters - Last 30 days
  const [filters, setFilters] = useState<IAnalyticsFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
    granularity: 'day',
    movieIds: [],
  });

  // Queries
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview', filters],
    queryFn: () => analyticsService.getOverviewStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: movieStatsData,
    isLoading: movieStatsLoading,
    error: movieStatsError,
  } = useQuery<MovieStats[]>({
    queryKey: ['analytics', 'movies', filters],
    queryFn: () => analyticsService.getMovieStats(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: showtimeData,
    isLoading: showtimeLoading,
    error: showtimeError,
  } = useQuery<ShowtimeStats[]>({
    queryKey: ['analytics', 'showtimes', filters],
    queryFn: () => analyticsService.getShowtimeStats(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useQuery<TimeSeriesData[]>({
    queryKey: ['analytics', 'timeseries', filters],
    queryFn: () => analyticsService.getTimeSeriesData(filters),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: recentActivityData,
    isLoading: recentActivityLoading,
    error: recentActivityError,
  } = useQuery<RecentActivity[]>({
    queryKey: ['analytics', 'recent-activity'],
    queryFn: () => analyticsService.getRecentActivity(20),
    staleTime: 2 * 60 * 1000, // 2 minutes for recent activity
  });

  const {
    data: utilizationData,
    isLoading: utilizationLoading,
    error: utilizationError,
  } = useQuery<UtilizationData[]>({
    queryKey: ['analytics', 'utilization', filters],
    queryFn: () => analyticsService.getUtilizationData(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Handle CSV export
  const handleExport = async (type: 'bookings' | 'revenue' | 'utilization') => {
    setIsExporting(true);
    
    try {
      const csvData = await analyticsService.exportCSV(filters, type);
      
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-export-${filters.dateRange.from.toISOString().split('T')[0]}-to-${filters.dateRange.to.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: IAnalyticsFilters) => {
    setFilters(newFilters);
  };

  // Check for any errors and show toast
  useEffect(() => {
    const errors = [
      overviewError,
      movieStatsError,
      showtimeError,
      timeSeriesError,
      recentActivityError,
      utilizationError,
    ].filter(Boolean);

    if (errors.length > 0) {
      toast({
        title: 'Data loading error',
        description: 'Some analytics data failed to load. Please refresh to try again.',
        variant: 'destructive',
      });
    }
  }, [
    overviewError,
    movieStatsError,
    showtimeError,
    timeSeriesError,
    recentActivityError,
    utilizationError,
    toast,
  ]);

  const isAnyLoading = 
    overviewLoading || 
    movieStatsLoading || 
    showtimeLoading || 
    timeSeriesLoading || 
    recentActivityLoading || 
    utilizationLoading;

  const hasAnyError = 
    overviewError || 
    movieStatsError || 
    showtimeError || 
    timeSeriesError || 
    recentActivityError || 
    utilizationError;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-foreground-secondary">
            Comprehensive insights into your cinema performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* KPI Grid */}
      <KPIGrid
        data={overviewData}
        isLoading={overviewLoading}
        error={overviewError}
      />

      {/* Charts */}
      <AnalyticsCharts
        timeSeriesData={timeSeriesData}
        movieStatsData={movieStatsData}
        isLoading={timeSeriesLoading || movieStatsLoading}
        error={timeSeriesError || movieStatsError}
      />

      {/* Tables */}
      <AnalyticsTables
        showtimeData={showtimeData}
        recentActivityData={recentActivityData}
        utilizationData={utilizationData}
        isLoading={showtimeLoading || recentActivityLoading || utilizationLoading}
        error={showtimeError || recentActivityError || utilizationError}
      />

      {/* Footer Info */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>
              Currently using mock data. Switch to production mode by setting{' '}
              <code className="px-1 py-0.5 bg-muted rounded text-xs">VITE_USE_MOCKS=false</code>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;