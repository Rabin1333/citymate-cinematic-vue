import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';
import { movies } from '../data/movies';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'regular' | 'premium' | 'vip';
  status: 'available' | 'selected' | 'booked';
  price: number;
}

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const movie = movies.find(m => m.id === parseInt(id || '0'));
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const cinema = searchParams.get('cinema');

  // Generate seat map
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    rows.forEach((row, rowIndex) => {
      const seatsPerRow = 12;
      for (let i = 1; i <= seatsPerRow; i++) {
        let type: 'regular' | 'premium' | 'vip' = 'regular';
        let price = movie?.pricing.regular || 12;
        
        // VIP seats (front rows)
        if (rowIndex <= 1) {
          type = 'vip';
          price = movie?.pricing.vip || 25;
        }
        // Premium seats (middle rows)
        else if (rowIndex <= 4) {
          type = 'premium';
          price = movie?.pricing.premium || 18;
        }

        // Randomly book some seats for demo
        const isBooked = Math.random() < 0.15;
        
        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status: isBooked ? 'booked' : 'available',
          price
        });
      }
    });
    
    return seats;
  };

  const [seats] = useState<Seat[]>(generateSeats());

  const handleSeatClick = (clickedSeat: Seat) => {
    if (clickedSeat.status === 'booked') return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.some(seat => seat.id === clickedSeat.id);
      if (isSelected) {
        return prev.filter(seat => seat.id !== clickedSeat.id);
      } else {
        return [...prev, clickedSeat];
      }
    });
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const baseClass = "w-8 h-8 rounded-t-lg border-2 cursor-pointer transition-all duration-200 text-xs font-medium flex items-center justify-center";
    
    if (seat.status === 'booked') {
      return `${baseClass} bg-red-500 border-red-600 cursor-not-allowed text-white`;
    }
    
    if (isSelected) {
      return `${baseClass} bg-cinema-red border-cinema-red text-white scale-110`;
    }
    
    // Type-based styling
    switch (seat.type) {
      case 'vip':
        return `${baseClass} bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800`;
      case 'premium':
        return `${baseClass} bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800`;
      default:
        return `${baseClass} bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800`;
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleProceedToPayment = () => {
    if (selectedSeats.length > 0) {
      const seatIds = selectedSeats.map(s => s.id).join(',');
      navigate(`/payment/${id}?seats=${seatIds}&date=${date}&time=${time}&cinema=${cinema}&total=${totalPrice}`);
    }
  };

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Select Seats</h1>
            <p className="text-foreground-secondary">
              {movie.title} • {cinema} • {date} • {time}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl p-6 border border-border">
              {/* Screen */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2 bg-gradient-to-r from-cinema-red/20 to-cinema-accent/20 px-6 py-3 rounded-2xl">
                  <Monitor className="w-6 h-6 text-cinema-red" />
                  <span className="text-foreground font-medium">SCREEN</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-t"></div>
                  <span className="text-foreground-secondary">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cinema-red border border-cinema-red rounded-t"></div>
                  <span className="text-foreground-secondary">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 border border-red-600 rounded-t"></div>
                  <span className="text-foreground-secondary">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-t"></div>
                  <span className="text-foreground-secondary">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded-t"></div>
                  <span className="text-foreground-secondary">VIP</span>
                </div>
              </div>

              {/* Seats */}
              <div className="space-y-4">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row) => (
                  <div key={row} className="flex items-center justify-center gap-2">
                    <div className="w-8 text-center text-foreground-secondary font-medium">
                      {row}
                    </div>
                    <div className="flex gap-1">
                      {seats
                        .filter(seat => seat.row === row)
                        .slice(0, 6)
                        .map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatClassName(seat)}
                            title={`${seat.id} - $${seat.price} (${seat.type})`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                    <div className="w-8"></div>
                    <div className="flex gap-1">
                      {seats
                        .filter(seat => seat.row === row)
                        .slice(6, 12)
                        .map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatClassName(seat)}
                            title={`${seat.id} - $${seat.price} (${seat.type})`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                    <div className="w-8 text-center text-foreground-secondary font-medium">
                      {row}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Movie</span>
                    <span className="text-foreground">{movie.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Cinema</span>
                    <span className="text-foreground">{cinema}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Date</span>
                    <span className="text-foreground">{date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Time</span>
                    <span className="text-foreground">{time}</span>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <>
                    <div className="border-t border-border pt-4 mb-4">
                      <h4 className="font-medium text-foreground mb-2">Selected Seats</h4>
                      <div className="space-y-2">
                        {selectedSeats.map(seat => (
                          <div key={seat.id} className="flex justify-between text-sm">
                            <span className="text-foreground-secondary">
                              {seat.id} ({seat.type})
                            </span>
                            <span className="text-foreground">${seat.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-cinema-red">${totalPrice}</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length === 0}
                  className="w-full btn-cinema disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedSeats.length === 0 ? 'Select Seats' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;