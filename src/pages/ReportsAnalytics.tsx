import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, Users, DollarSign, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-01-31' });

  // Mock data for charts
  const attendanceData = [
    { date: 'Mon', attendance: 245 },
    { date: 'Tue', attendance: 189 },
    { date: 'Wed', attendance: 312 },
    { date: 'Thu', attendance: 287 },
    { date: 'Fri', attendance: 456 },
    { date: 'Sat', attendance: 523 },
    { date: 'Sun', attendance: 498 }
  ];

  const genrePopularityData = [
    { genre: 'Action', tickets: 1245, revenue: 18675 },
    { genre: 'Drama', tickets: 987, revenue: 14805 },
    { genre: 'Comedy', tickets: 756, revenue: 11340 },
    { genre: 'Sci-Fi', tickets: 654, revenue: 9810 },
    { genre: 'Horror', tickets: 432, revenue: 6480 },
    { genre: 'Romance', tickets: 321, revenue: 4815 }
  ];

  const pieChartData = [
    { name: 'Action', value: 35, color: '#8884d8' },
    { name: 'Drama', value: 25, color: '#82ca9d' },
    { name: 'Comedy', value: 20, color: '#ffc658' },
    { name: 'Sci-Fi', value: 15, color: '#ff7300' },
    { name: 'Other', value: 5, color: '#0088fe' }
  ];

  const seasonalTrendsData = [
    { month: 'Jan', tickets: 2456, revenue: 36840 },
    { month: 'Feb', tickets: 2789, revenue: 41835 },
    { month: 'Mar', tickets: 3245, revenue: 48675 },
    { month: 'Apr', tickets: 2987, revenue: 44805 },
    { month: 'May', tickets: 3456, revenue: 51840 },
    { month: 'Jun', tickets: 4123, revenue: 61845 },
    { month: 'Jul', tickets: 4567, revenue: 68505 },
    { month: 'Aug', tickets: 4234, revenue: 63510 },
    { month: 'Sep', tickets: 3789, revenue: 56835 },
    { month: 'Oct', tickets: 3234, revenue: 48510 },
    { month: 'Nov', tickets: 2987, revenue: 44805 },
    { month: 'Dec', tickets: 3567, revenue: 53505 }
  ];

  const demographicData = [
    { ageGroup: '18-24', percentage: 28, count: 2456 },
    { ageGroup: '25-34', percentage: 35, count: 3078 },
    { ageGroup: '35-44', percentage: 22, count: 1934 },
    { ageGroup: '45-54', percentage: 10, count: 879 },
    { ageGroup: '55+', percentage: 5, count: 439 }
  ];

  const busyTimesData = [
    { hour: '10:00', bookings: 23 },
    { hour: '12:00', bookings: 45 },
    { hour: '14:00', bookings: 67 },
    { hour: '16:00', bookings: 89 },
    { hour: '18:00', bookings: 156 },
    { hour: '20:00', bookings: 234 },
    { hour: '22:00', bookings: 123 }
  ];

  const customReports = [
    {
      id: '1',
      name: 'Monthly Revenue Report',
      description: 'Comprehensive monthly revenue breakdown by movie, screen, and time',
      lastGenerated: '2024-01-20',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Customer Retention Analysis',
      description: 'Analysis of customer return rates and loyalty patterns',
      lastGenerated: '2024-01-18',
      format: 'Excel'
    },
    {
      id: '3',
      name: 'Peak Hours Optimization',
      description: 'Detailed analysis of booking patterns by time and day',
      lastGenerated: '2024-01-15',
      format: 'CSV'
    }
  ];

  const HeatmapVisualization = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    
    const heatmapData = days.map(day => 
      hours.map(hour => ({
        day,
        hour,
        bookings: Math.floor(Math.random() * 100) + 10
      }))
    ).flat();

    const getIntensityColor = (bookings: number) => {
      if (bookings < 30) return 'bg-blue-100';
      if (bookings < 60) return 'bg-blue-300';
      if (bookings < 90) return 'bg-blue-500';
      return 'bg-blue-700';
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium">Booking Intensity Heatmap</h4>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-1 min-w-[600px]">
            <div></div>
            {hours.map(hour => (
              <div key={hour} className="text-center text-sm font-medium p-2">
                {hour}
              </div>
            ))}
            
            {days.map(day => (
              <>
                <div key={day} className="text-sm font-medium p-2 flex items-center">
                  {day}
                </div>
                {hours.map(hour => {
                  const data = heatmapData.find(d => d.day === day && d.hour === hour);
                  return (
                    <div 
                      key={`${day}-${hour}`}
                      className={`p-2 text-center text-sm rounded ${getIntensityColor(data?.bookings || 0)}`}
                      title={`${day} ${hour}: ${data?.bookings} bookings`}
                    >
                      {data?.bookings}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <div className="w-4 h-4 bg-blue-700 rounded"></div>
          </div>
          <span>High</span>
        </div>
      </div>
    );
  };

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
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
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
              <Button>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">$127,456</p>
                      <p className="text-sm text-green-600">+12.3% vs last month</p>
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
                      <p className="text-2xl font-bold">8,432</p>
                      <p className="text-sm text-blue-600">+8.7% vs last month</p>
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
                      <p className="text-2xl font-bold">72.4%</p>
                      <p className="text-sm text-purple-600">+5.2% vs last month</p>
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
                      <p className="text-2xl font-bold">3,247</p>
                      <p className="text-sm text-orange-600">+15.1% vs last month</p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Genre Popularity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genre Popularity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genrePopularityData}>
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

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
                    <LineChart data={busyTimesData}>
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

            <Card>
              <CardHeader>
                <CardTitle>Booking Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapVisualization />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demographicData.map((demo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="font-medium w-16">{demo.ageGroup}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${demo.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium">{demo.percentage}%</div>
                          <div className="text-sm text-muted-foreground">{demo.count.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">67.8%</div>
                        <div className="text-sm text-muted-foreground">Repeat Customers</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">2.3</div>
                        <div className="text-sm text-muted-foreground">Avg Visits/Month</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Gender Distribution</h4>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-blue-500 h-4 rounded-l-full"></div>
                        <div className="flex-1 bg-pink-500 h-4 rounded-r-full"></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Male (52%)</span>
                        <span>Female (48%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={seasonalTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="tickets" stroke="#8884d8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Quarter</span>
                      <Badge className="bg-green-500">+15.3%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month</span>
                      <Badge className="bg-blue-500">+8.7%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Week</span>
                      <Badge className="bg-purple-500">+3.2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Seasons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="font-bold text-red-600">Summer</div>
                      <div className="text-sm text-muted-foreground">Highest Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600">Winter</div>
                      <div className="text-sm text-muted-foreground">Highest Attendance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600">Next Month</div>
                      <div className="text-sm text-muted-foreground">+12% projected</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="font-bold text-yellow-600">Next Quarter</div>
                      <div className="text-sm text-muted-foreground">+8% projected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Type</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option>Revenue Analysis</option>
                      <option>Customer Analysis</option>
                      <option>Movie Performance</option>
                      <option>Theater Utilization</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option>One-time</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last generated: {report.lastGenerated}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.format}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
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