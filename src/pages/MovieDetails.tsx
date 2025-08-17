import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Clock, MapPin, Star, Play } from 'lucide-react';
import { movies } from '../data/movies';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('Downtown Cinema');

  const movie = movies.find(m => m.id === parseInt(id || '0'));
  
  if (!movie) {
    return <div>Movie not found</div>;
  }

  const dates = ['Today', 'Tomorrow', 'Dec 20'];
  const cinemas = ['Downtown Cinema', 'Mall Cinema', 'IMAX Theater'];

  const handleBooking = () => {
    if (selectedTime) {
      navigate(`/seats/${movie.id}?date=${selectedDate}&time=${selectedTime}&cinema=${selectedCinema}`);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full rounded-2xl shadow-cinematic"
              />
              <button className="w-full mt-4 btn-cinema flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Watch Trailer
              </button>
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="bg-cinema-red text-white px-3 py-1 rounded-full text-sm font-medium">
                  {movie.rating}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-cinema-accent fill-current" />
                  <span className="text-foreground-secondary">8.9</span>
                </div>
                <span className="text-foreground-secondary">{movie.duration}</span>
                <span className="text-foreground-secondary">{movie.releaseYear}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((genre) => (
                  <span key={genre} className="bg-card text-foreground-secondary px-3 py-1 rounded-full text-sm border border-border">
                    {genre}
                  </span>
                ))}
              </div>

              <p className="text-foreground-secondary text-lg leading-relaxed mb-6">
                {movie.synopsis}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Director</h3>
                  <p className="text-foreground-secondary">{movie.director}</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Cast</h3>
                  <p className="text-foreground-secondary">{movie.cast.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Book Tickets</h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                  <Calendar className="w-5 h-5" />
                  Select Date
                </label>
                <div className="flex gap-2">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === date
                          ? 'bg-cinema-red text-white'
                          : 'bg-background text-foreground-secondary hover:bg-cinema-red/20'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                  <MapPin className="w-5 h-5" />
                  Select Cinema
                </label>
                <select 
                  value={selectedCinema}
                  onChange={(e) => setSelectedCinema(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  {cinemas.map((cinema) => (
                    <option key={cinema} value={cinema}>{cinema}</option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                  <Clock className="w-5 h-5" />
                  Select Showtime
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {movie.showtimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-cinema-red text-white'
                          : 'bg-background text-foreground-secondary hover:bg-cinema-red/20 border border-border'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-foreground font-medium mb-3">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-foreground-secondary text-sm">Regular</div>
                    <div className="text-foreground font-semibold">${movie.pricing.regular}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground-secondary text-sm">Premium</div>
                    <div className="text-foreground font-semibold">${movie.pricing.premium}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground-secondary text-sm">VIP</div>
                    <div className="text-foreground font-semibold">${movie.pricing.vip}</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={!selectedTime}
                className="w-full btn-cinema disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Seats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;