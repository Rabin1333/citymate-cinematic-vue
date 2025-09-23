import { useState } from 'react';
import { CalendarIcon, Filter, Download } from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnalyticsFilters as IAnalyticsFilters } from '@/services/analytics';

interface AnalyticsFiltersProps {
  filters: IAnalyticsFilters;
  onFiltersChange: (filters: IAnalyticsFilters) => void;
  onExport: (type: 'bookings' | 'revenue' | 'utilization') => void;
  isExporting?: boolean;
}

const movieOptions = [
  { id: 1, title: 'Dune' },
  { id: 2, title: 'The Dark Knight' },
  { id: 3, title: 'Inception' },
  { id: 4, title: 'Parasite' },
  { id: 5, title: 'Spider-Man: No Way Home' },
  { id: 6, title: 'The Grand Budapest Hotel' },
];

const datePresets = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

export function AnalyticsFilters({ filters, onFiltersChange, onExport, isExporting = false }: AnalyticsFiltersProps) {
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [showMovieSelect, setShowMovieSelect] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handlePresetChange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    onFiltersChange({
      ...filters,
      dateRange: { from, to }
    });
    setShowCustomDate(false);
  };

  const handleMovieToggle = (movieId: number) => {
    const currentMovies = filters.movieIds || [];
    const newMovies = currentMovies.includes(movieId)
      ? currentMovies.filter(id => id !== movieId)
      : [...currentMovies, movieId];
    
    onFiltersChange({
      ...filters,
      movieIds: newMovies
    });
  };

  const getSelectedMoviesTitles = () => {
    if (!filters.movieIds || filters.movieIds.length === 0) return 'All Movies';
    return movieOptions
      .filter(movie => filters.movieIds?.includes(movie.id))
      .map(movie => movie.title)
      .join(', ');
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left side - Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">Date Range</label>
              <div className="flex gap-2">
                {datePresets.map(preset => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetChange(preset.value)}
                    className={cn(
                      "text-xs",
                      subDays(new Date(), preset.value).toDateString() === filters.dateRange.from.toDateString() &&
                      "bg-primary text-primary-foreground"
                    )}
                  >
                    {preset.label}
                  </Button>
                ))}
                
                <Popover open={showCustomDate} onOpenChange={setShowCustomDate}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium">From</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => date && onFiltersChange({
                            ...filters,
                            dateRange: { ...filters.dateRange, from: date }
                          })}
                          className="pointer-events-auto"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">To</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => date && onFiltersChange({
                            ...filters,
                            dateRange: { ...filters.dateRange, to: date }
                          })}
                          className="pointer-events-auto"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {format(filters.dateRange.from, 'MMM dd, yyyy')} - {format(filters.dateRange.to, 'MMM dd, yyyy')}
              </div>
            </div>

            {/* Granularity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">Granularity</label>
              <Select 
                value={filters.granularity} 
                onValueChange={(value: 'day' | 'week' | 'month') => 
                  onFiltersChange({ ...filters, granularity: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Movie Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground-secondary">Movies</label>
              <Popover open={showMovieSelect} onOpenChange={setShowMovieSelect}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between w-48">
                    <span className="truncate">{getSelectedMoviesTitles()}</span>
                    <Filter className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                  <div className="space-y-3">
                    <div className="font-medium text-sm">Select Movies</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {movieOptions.map(movie => (
                        <div key={movie.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`movie-${movie.id}`}
                            checked={filters.movieIds?.includes(movie.id) || false}
                            onCheckedChange={() => handleMovieToggle(movie.id)}
                          />
                          <label 
                            htmlFor={`movie-${movie.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {movie.title}
                          </label>
                        </div>
                      ))}
                    </div>
                    {filters.movieIds && filters.movieIds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, movieIds: [] })}
                        className="w-full"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              {filters.movieIds && filters.movieIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.movieIds.slice(0, 2).map(movieId => {
                    const movie = movieOptions.find(m => m.id === movieId);
                    return movie ? (
                      <Badge key={movieId} variant="secondary" className="text-xs">
                        {movie.title}
                      </Badge>
                    ) : null;
                  })}
                  {filters.movieIds.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{filters.movieIds.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Export */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-secondary">Export</label>
            <Popover open={showExportMenu} onOpenChange={setShowExportMenu}>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <div className="font-medium text-sm">Export Data</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onExport('bookings');
                      setShowExportMenu(false);
                    }}
                    className="w-full justify-start"
                  >
                    Bookings Data
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onExport('revenue');
                      setShowExportMenu(false);
                    }}
                    className="w-full justify-start"
                  >
                    Revenue Data
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onExport('utilization');
                      setShowExportMenu(false);
                    }}
                    className="w-full justify-start"
                  >
                    Utilization Data
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
