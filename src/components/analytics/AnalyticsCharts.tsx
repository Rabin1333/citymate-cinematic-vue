import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeSeriesData, MovieStats } from '@/services/analytics';
import { format, parseISO } from 'date-fns';

interface AnalyticsChartsProps {
  timeSeriesData?: TimeSeriesData[];
  movieStatsData?: MovieStats[];
  isLoading: boolean;
  error?: Error | null;
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-80 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export function AnalyticsCharts({ timeSeriesData, movieStatsData, isLoading, error }: AnalyticsChartsProps) {
  const [movieChartType, setMovieChartType] = useState<'tickets' | 'revenue'>('tickets');
  const [movieLimit, setMovieLimit] = useState(6);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Time Series</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Failed to load chart data</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Failed to load chart data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format time series data for charts
  const formattedTimeSeriesData = timeSeriesData?.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    revenueK: Math.round(item.revenue / 1000), // Convert to thousands for better readability
  }));

  // Format and limit movie data
  const limitedMovieData = movieStatsData
    ?.sort((a, b) => movieChartType === 'tickets' ? b.ticketsSold - a.ticketsSold : b.revenue - a.revenue)
    .slice(0, movieLimit);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('Revenue') 
                ? `$${entry.value.toLocaleString()}${entry.dataKey === 'revenueK' ? 'K' : ''}`
                : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tickets Sold & Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {formattedTimeSeriesData && formattedTimeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={formattedTimeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ticketsSold"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Tickets Sold"
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenueK"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                  name="Revenue (K)"
                  activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No time series data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movie Stats Chart */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Movies</CardTitle>
            <div className="flex gap-2">
              <Tabs value={movieChartType} onValueChange={(value: 'tickets' | 'revenue') => setMovieChartType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={movieLimit.toString()} onValueChange={(value) => setMovieLimit(parseInt(value))}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {limitedMovieData && limitedMovieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={limitedMovieData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="movieTitle"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={movieChartType === 'tickets' ? 'ticketsSold' : 'revenue'}
                  fill="hsl(var(--primary))"
                  name={movieChartType === 'tickets' ? 'Tickets Sold' : 'Revenue'}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <p className="text-muted-foreground">No movie data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}