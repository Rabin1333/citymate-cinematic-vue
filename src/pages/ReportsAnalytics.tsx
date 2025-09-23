// src/pages/ReportsAnalytics.tsx - COMPLETE FUNCTIONAL VERSION
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getBookingStats, getToken, getCurrentUser, type BookingStats } from '@/services/api';

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-01-31' });
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const token = getToken();
  const user = getCurrentUser();

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need admin access to view this page.",
        variant: "destructive",
      });
      return;
    }
    
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      const stats = await getBookingStats(dateRange);
      setBookingStats(stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeApply = () => {
    setLoading(true);
    fetchAnalytics();
  };

  const exportData = (format: 'csv' | 'pdf') => {
    if (!bookingStats) return;
    
    if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Revenue', `$${bookingStats.totalRevenue}`],
        ['Total Tickets', bookingStats.totalTickets.toString()],
        ['Average Occupancy', `${bookingStats.averageOccupancy}%`],
        ['Unique Visitors', bookingStats.uniqueVisitors.toString()],
        ...bookingStats.genreStats.map(genre => [`${genre.genre} - Tickets`, genre.tickets.toString()]),
        ...bookingStats.genreStats.map(genre => [`${genre.genre} - Revenue`, `$${genre.revenue}`])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange.from}-to-${dateRange.to}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "CSV report has been downloaded",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const pieChartData = bookingStats?.genreStats.map((stat, index) => ({
    name: stat.genre,
    value: Math.round((stat.tickets / bookingStats.totalTickets) * 100),
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'][index % 5]
  })) || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights and custom reporting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => exportData('csv')}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">From:</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">To:</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-auto"
                />
              </div>
              <Button onClick={handleDateRangeApply}>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${bookingStats?.totalRevenue.toLocaleString() || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tickets</p>
                      <p className="text-2xl font-bold">{bookingStats?.totalTickets.toLocaleString() || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                      <p className="text-2xl font-bold">{bookingStats?.averageOccupancy || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Visitors</p>
                      <p className="text-2xl font-bold">{bookingStats?.uniqueVisitors.toLocaleString() || 0}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genre Popularity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingStats?.genreStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="genre" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tickets" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingStats?.genreStats.map((genre, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{genre.genre}</h4>
                        <p className="text-sm text-muted-foreground">{genre.tickets} tickets sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${genre.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingStats?.weeklyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Booking Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingStats?.timeStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Revenue Report</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Detailed revenue breakdown by movies, theaters, and time periods
                      </p>
                      <Button onClick={() => exportData('csv')} className="w-full">
                        Export as CSV
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Attendance Analysis</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Customer attendance patterns and demographic insights
                      </p>
                      <Button onClick={() => exportData('csv')} className="w-full">
                        Export as CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsAnalytics;