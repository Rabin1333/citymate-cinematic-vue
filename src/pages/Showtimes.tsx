import { useState, useMemo, useEffect } from 'react';
import { Search, Clock, Users, TrendingUp, Zap, MapPin } from 'lucide-react';
import { getMovies, type UiMovie } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShowtimeCard from '@/components/showtimes/ShowtimeCard';
import QuickActions from '@/components/showtimes/QuickActions';
import ShowtimeFilters from '@/components/showtimes/ShowtimeFilters';

const Showtimes = () => {
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([10, 30]);
  const [viewMode, setViewMode] = useState<'theater' | 'time'>('theater');
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Load movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const allMovies = await getMovies(false);
        const nowShowingMovies = allMovies.filter(m => m.status === 'now-showing');
        setMovies(nowShowingMovies);
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  const sydneyLocations = [
    { id: 'all', name: 'All Sydney Areas' },
    { id: 'cbd', name: 'Sydney CBD' },
    { id: 'bondi', name: 'Bondi & Eastern Suburbs' },
    { id: 'parramatta', name: 'Parramatta & West' },
    { id: 'north-shore', name: 'North Shore' },
    { id: 'south', name: 'Southern Sydney' },
    { id: 'inner-west', name: 'Inner West' }
  ];

  const theaters = [
    { id: 'downtown', name: 'Downtown Cinema', location: 'cbd', amenities: ['IMAX', 'Parking', 'Dining'] },
    { id: 'mall', name: 'Mall Cinema', location: 'parramatta', amenities: ['Standard', 'Food Court'] },
    { id: 'luxury', name: 'Luxury Theater', location: 'bondi', amenities: ['VIP', 'Recliner', 'Bar'] },
    { id: 'imax', name: 'IMAX Theater', location: 'cbd', amenities: ['IMAX', 'Dolby Atmos'] },
    { id: 'bondi-junction', name: 'Bondi Junction Cinema', location: 'bondi', amenities: ['Standard', 'Parking'] },
    { id: 'north-sydney', name: 'North Sydney Cinema', location: 'north-shore', amenities: ['Premium', 'Dining'] }
  ];

  // Filtering
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Price range
    filtered = filtered.filter(movie => {
      const { regular, premium } = movie.pricing;
      return (regular >= priceRange[0] && regular <= priceRange[1]) ||
             (premium >= priceRange[0] && premium <= priceRange[1]);
    });

    // Quick filters
    if (quickFilter === 'imax') {
      filtered = filtered.filter(m =>
        m.genre.some(g => ['Action', 'Adventure', 'Sci-Fi', 'Fantasy', 'Thriller'].includes(g))
      );
    }

    return filtered;
  }, [movies, searchTerm, quickFilter, selectedTimeBlock, priceRange]);

  // Helpers
  const getFilteredTheaters = () => {
    let filtered = selectedTheaters.length === 0 ? theaters : theaters.filter(t => selectedTheaters.includes(t.id));
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(t => t.location === selectedLocation);
    }
    return filtered;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setQuickFilter('');
    setSelectedTimeBlock('');
    setSelectedTheaters([]);
    setPriceRange([10, 30]);
    setSelectedLocation('all');
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    quickFilter ? 1 : 0,
    selectedTimeBlock ? 1 : 0,
    selectedTheaters.length > 0 ? 1 : 0,
    (priceRange[0] > 10 || priceRange[1] < 30) ? 1 : 0,
    selectedLocation !== 'all' ? 1 : 0
  ].reduce((sum, n) => sum + n, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading showtimes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Movie Showtimes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Find the perfect showtime for your movie experience • {selectedDate}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Updated 2 minutes ago</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cinema-red" />
              <span className="text-foreground">Current occupancy: 67%</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-foreground">1,247 tickets booked today</span>
            </div>
          </div>
        </div>

        {/* Search + Location + Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search movies, directors, or cast..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-64">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {sydneyLocations.find(loc => loc.id === selectedLocation)?.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sydneyLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {location.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'theater' | 'time')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theater">Theater View</SelectItem>
              <SelectItem value="time">Time Block View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main column (filters + theaters) */}
          <div className="lg:col-span-3">
            
            {/* Filters ABOVE theater list */}
            <div className="mb-8">
              <ShowtimeFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTimeBlock={selectedTimeBlock}
                onTimeBlockChange={setSelectedTimeBlock}
                selectedTheaters={selectedTheaters}
                onTheaterChange={setSelectedTheaters}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>

            {/* Theater / Time view */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  {viewMode === 'theater' ? 'By Theater' : 'By Time'} • {filteredMovies.length} movies
                </h2>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {(quickFilter || activeFiltersCount > 0) && (
                    <Button variant="outline" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Movie listings */}
            {filteredMovies.length > 0 ? (
              viewMode === 'theater'
                ? (
                  <div className="space-y-6">
                    {getFilteredTheaters().map(theater => (
                      <div key={theater.id} className="space-y-4">
                        <h3 className="text-xl font-semibold">{theater.name}</h3>
                        <div className="grid gap-4">
                          {filteredMovies.map(movie => (
                            <ShowtimeCard
                              key={`${theater.id}-${movie.id}`}
                              movie={movie}
                              theater={theater.name}
                              theaterAmenities={theater.amenities}
                              selectedDate={selectedDate}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <p className="text-muted-foreground">Time-based view coming here…</p>
                )
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No showtimes match your filters</p>
                <Button onClick={clearAllFilters} className="btn-cinema mt-4">
                  <Zap className="h-4 w-4 mr-2" /> Show All
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - QuickActions */}
          <div className="lg:col-span-1">
            <QuickActions
              onQuickFilter={setQuickFilter}
              activeFilter={quickFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showtimes;
