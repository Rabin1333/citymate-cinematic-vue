import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Eye, Star, Monitor, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsCard {
  title: string;
  today: string | number;
  week: string | number;
  month: string | number;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

interface TheaterStatus {
  screen: string;
  movie: string;
  occupancy: number;
  status: 'active' | 'maintenance' | 'cleaning';
  nextShow: string;
}

export const DashboardOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const analyticsData: AnalyticsCard[] = [
    {
      title: 'Total Tickets Sold',
      today: 247,
      week: '1,832',
      month: '7,456',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+12%'
    },
    {
      title: 'Revenue Generated',
      today: '$3,241',
      week: '$22,847',
      month: '$94,332',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+8%'
    },
    {
      title: 'Theater Occupancy',
      today: '68%',
      week: '72%',
      month: '65%',
      icon: Users,
      trend: 'up',
      trendValue: '+5%'
    }
  ];

  const topMovies = [
    { title: 'Dune', tickets: 1234, revenue: '$18,510', rating: 4.8 },
    { title: 'The Dark Knight', tickets: 987, revenue: '$14,805', rating: 4.9 },
    { title: 'Inception', tickets: 876, revenue: '$13,140', rating: 4.7 }
  ];

  const theaterStatus: TheaterStatus[] = [
    { screen: 'Screen 1', movie: 'Dune', occupancy: 85, status: 'active', nextShow: '7:30 PM' },
    { screen: 'Screen 2', movie: 'The Dark Knight', occupancy: 92, status: 'active', nextShow: '8:00 PM' },
    { screen: 'Screen 3', movie: 'Inception', occupancy: 67, status: 'active', nextShow: '7:45 PM' },
    { screen: 'IMAX', movie: 'Spider-Man', occupancy: 0, status: 'cleaning', nextShow: '9:00 PM' },
    { screen: 'Screen 5', movie: '-', occupancy: 0, status: 'maintenance', nextShow: 'TBA' }
  ];

  const overallRating = 4.2;
  const currentOccupancy = 68;

  return (
    <div className="space-y-6">
      {/* Top Row Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analyticsData.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{card.today}</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{card.week}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{card.month}</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Badge variant={card.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    {card.trendValue} vs last period
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second Row Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Performing Movies */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performing Movies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMovies.map((movie, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">{movie.tickets} tickets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{movie.revenue}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{movie.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Movie Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Movie Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-4xl font-bold text-primary">{overallRating}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(overallRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : star <= overallRating
                          ? 'fill-yellow-400/50 text-yellow-400/50'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Out of 5 stars</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Based on 2,847 reviews</p>
                <Badge variant="secondary" className="mt-2">+0.2 vs last month</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Theater Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Live Theater Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-primary">{currentOccupancy}%</div>
                <p className="text-sm text-muted-foreground">Current Occupancy</p>
              </div>
              
              <div className="space-y-2">
                {theaterStatus.map((theater, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        theater.status === 'active' ? 'bg-green-500' :
                        theater.status === 'cleaning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">{theater.screen}</span>
                    </div>
                    <div className="text-right">
                      {theater.status === 'active' && (
                        <p className="text-xs text-muted-foreground">{theater.occupancy}% full</p>
                      )}
                      {theater.status === 'maintenance' && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">Maintenance</span>
                        </div>
                      )}
                      {theater.status === 'cleaning' && (
                        <span className="text-xs text-yellow-600">Cleaning</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};