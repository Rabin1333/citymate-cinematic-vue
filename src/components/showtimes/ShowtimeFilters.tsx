import { useState } from 'react';
import { Calendar, Clock, MapPin, Settings, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface ShowtimeFiltersProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTimeBlock: string;
  onTimeBlockChange: (block: string) => void;
  selectedTheaters: string[];
  onTheaterChange: (theaters: string[]) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
}

const timeBlocks = [
  { id: 'morning', label: 'Morning', time: '9AM-12PM', count: 12, availability: 'high' },
  { id: 'afternoon', label: 'Afternoon', time: '12PM-5PM', count: 18, availability: 'medium' },
  { id: 'evening', label: 'Evening', time: '5PM-9PM', count: 24, availability: 'low' },
  { id: 'late', label: 'Late Night', time: '9PM+', count: 8, availability: 'high' }
];

const theaters = [
  { id: 'downtown', name: 'Downtown Cinema', amenities: ['IMAX', 'Parking', 'Dining'] },
  { id: 'mall', name: 'Mall Cinema', amenities: ['Standard', 'Food Court'] },
  { id: 'luxury', name: 'Luxury Theater', amenities: ['VIP', 'Recliner', 'Bar'] },
  { id: 'imax', name: 'IMAX Theater', amenities: ['IMAX', 'Dolby Atmos'] }
];

export default function ShowtimeFilters({
  selectedDate,
  onDateChange,
  selectedTimeBlock,
  onTimeBlockChange,
  selectedTheaters,
  onTheaterChange,
  priceRange,
  onPriceRangeChange
}: ShowtimeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const movieCount = Math.floor(Math.random() * 15) + 5; // Mock data
    const availability = movieCount > 15 ? 'busy' : movieCount > 10 ? 'moderate' : 'available';
    
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      movieCount,
      availability,
      isToday: i === 0,
      isTomorrow: i === 1
    };
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      case 'busy': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'available': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const handleTheaterToggle = (theaterId: string) => {
    const updated = selectedTheaters.includes(theaterId)
      ? selectedTheaters.filter(id => id !== theaterId)
      : [...selectedTheaters, theaterId];
    onTheaterChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
  <div className="flex items-center gap-2 mb-4">
    <Calendar className="h-5 w-5 text-cinema-red" />
    <h3 className="text-lg font-semibold text-foreground">Select Date</h3>
  </div>

  {/* Make scrollable on smaller screens, fixed max grid on large */}
  <div className="overflow-x-auto no-scrollbar">
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 min-w-max">
      {dates.map((date) => (
        <button
          key={date.value}
          onClick={() => onDateChange(date.value)}
          className={`min-w-[110px] p-3 rounded-lg text-center transition-all duration-200 border ${
            selectedDate === date.value
              ? 'bg-cinema-red text-white border-cinema-red shadow-[var(--shadow-button)]'
              : 'bg-card border-border hover:border-cinema-red/50 hover:bg-cinema-red/10'
          }`}
        >
          <div className="text-xs font-medium mb-1">
            {date.isToday
              ? 'Today'
              : date.isTomorrow
              ? 'Tomorrow'
              : date.label.split(' ')[0]}
          </div>
          <div className="text-sm">
            {date.label.split(' ')[1]} {date.label.split(' ')[2]}
          </div>
          <div
            className={`text-xs mt-1 ${getAvailabilityColor(date.availability)}`}
          >
            {date.movieCount} movies
          </div>
        </button>
      ))}
    </div>
  </div>
</div>

{/* Time Block Filters */}
<div>
  <div className="flex items-center gap-2 mb-4">
    <Clock className="h-5 w-5 text-cinema-red" />
    <h3 className="text-lg font-semibold text-foreground">Time Blocks</h3>
  </div>

  {/* Responsive grid with stable cards */}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {timeBlocks.map((block) => (
      <button
        key={block.id}
        onClick={() => onTimeBlockChange(block.id)}
        className={`p-4 rounded-lg border transition-all duration-200 ${
          selectedTimeBlock === block.id
            ? 'bg-cinema-red text-white border-cinema-red'
            : 'bg-card border-border hover:border-cinema-red/50 hover:bg-cinema-red/10'
        }`}
      >
        <div className="font-medium text-sm">{block.label}</div>
        <div className="text-xs opacity-80">{block.time}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs">{block.count} shows</span>
          <div
            className={`w-2 h-2 rounded-full ${getAvailabilityColor(
              block.availability
            )}`}
          />
        </div>
      </button>
    ))}
  </div>
</div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
        {(selectedTheaters.length > 0 || priceRange[0] > 10 || priceRange[1] < 30) && (
          <Badge variant="secondary">{selectedTheaters.length + (priceRange[0] > 10 || priceRange[1] < 30 ? 1 : 0)} filters</Badge>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Theater Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-cinema-red" />
              <h3 className="text-lg font-semibold text-foreground">Theaters</h3>
            </div>
            <div className="space-y-3">
              {theaters.map((theater) => (
                <div
                  key={theater.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTheaters.includes(theater.id)
                      ? 'bg-cinema-red/10 border-cinema-red'
                      : 'bg-card border-border hover:border-cinema-red/50'
                  }`}
                  onClick={() => handleTheaterToggle(theater.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">{theater.name}</div>
                    <input
                      type="checkbox"
                      checked={selectedTheaters.includes(theater.id)}
                      onChange={() => handleTheaterToggle(theater.id)}
                      className="accent-cinema-red"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {theater.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-cinema-red" />
              <h3 className="text-lg font-semibold text-foreground">Price Range</h3>
            </div>
            <div className="px-4">
              <Slider
                value={priceRange}
                onValueChange={onPriceRangeChange}
                max={30}
                min={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}