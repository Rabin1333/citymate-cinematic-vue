import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShowtimeStats, RecentActivity, UtilizationData } from '@/services/analytics';
import { format, parseISO } from 'date-fns';

interface AnalyticsTablesProps {
  showtimeData?: ShowtimeStats[];
  recentActivityData?: RecentActivity[];
  utilizationData?: UtilizationData[];
  isLoading: boolean;
  error?: Error | null;
}

type SortField = 'date' | 'movie' | 'ticketsSold' | 'occupancyRate' | 'revenue';
type SortDirection = 'asc' | 'desc';

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsTables({ 
  showtimeData, 
  recentActivityData, 
  utilizationData, 
  isLoading, 
  error 
}: AnalyticsTablesProps) {
  const [showtimePage, setShowtimePage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedShowtimeData = () => {
    if (!showtimeData) return [];
    
    return [...showtimeData].sort((a, b) => {
      let aVal: string | number = a[sortField as keyof ShowtimeStats];
      let bVal: string | number = b[sortField as keyof ShowtimeStats];
      
      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
    });
  };

  const paginatedShowtimes = getSortedShowtimeData().slice(
    (showtimePage - 1) * itemsPerPage,
    showtimePage * itemsPerPage
  );

  const paginatedActivity = recentActivityData?.slice(
    (activityPage - 1) * itemsPerPage,
    activityPage * itemsPerPage
  );

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Showtimes Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={8} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Utilization Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={6} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Failed to load table data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Showtimes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Showtimes Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="date">Date</SortButton>
                  </TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>
                    <SortButton field="movie">Movie</SortButton>
                  </TableHead>
                  <TableHead>Screen</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="ticketsSold">Tickets Sold</SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="occupancyRate">Occupancy %</SortButton>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="revenue">Revenue</SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShowtimes.map((showtime) => (
                  <TableRow key={showtime.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(parseISO(showtime.date), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {showtime.time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{showtime.movie}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {showtime.screen}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {showtime.ticketsSold}/{showtime.totalSeats}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={showtime.occupancyRate >= 80 ? "default" : showtime.occupancyRate >= 60 ? "secondary" : "outline"}
                        className={
                          showtime.occupancyRate >= 80 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : showtime.occupancyRate >= 60 
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }
                      >
                        {showtime.occupancyRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${showtime.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {showtimeData && showtimeData.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((showtimePage - 1) * itemsPerPage) + 1} to {Math.min(showtimePage * itemsPerPage, showtimeData.length)} of {showtimeData.length} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowtimePage(p => Math.max(1, p - 1))}
                  disabled={showtimePage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowtimePage(p => p + 1)}
                  disabled={showtimePage * itemsPerPage >= showtimeData.length}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedActivity?.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        activity.type === 'Booking' ? 'default' : 
                        activity.type === 'Refund' ? 'secondary' : 'outline'
                      }>
                        {activity.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{activity.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${activity.amount}</p>
                    <Badge 
                      variant={activity.status === 'Completed' ? 'default' : activity.status === 'Pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {recentActivityData && recentActivityData.length > itemsPerPage && (
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                      disabled={activityPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivityPage(p => p + 1)}
                      disabled={activityPage * itemsPerPage >= recentActivityData.length}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Utilization Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData?.map((util, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{util.screen}</p>
                      <p className="text-sm text-muted-foreground">{util.cinema}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{util.averageOccupancy}%</p>
                      <p className="text-sm text-muted-foreground">{util.totalShows} shows</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${util.averageOccupancy}%` }}
                    />
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-medium">${util.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
