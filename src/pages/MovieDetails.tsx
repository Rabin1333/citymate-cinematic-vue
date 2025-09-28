import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { Calendar, Clock, MapPin, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMovieById, getShowtimes, type UiMovie } from "../services/api";
import { MovieReviewsSection } from "@/components/MovieReviewsSection";
import PredictThePlotSection from "@/components/PredictThePlotSection";
import { useTriggerEffect } from "../hooks/useCinematicEffects";
import { findEffectByTitle } from "../utils/cinematicEffects";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const triggerEffect = useTriggerEffect();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasTriggeredEffect = useRef(false);

  const [movie, setMovie] = useState<UiMovie | null>(null);
  const [times, setTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("Downtown Cinema");

  // simple static UI choices (unchanged)
  const dates = useMemo(() => ["Today", "Tomorrow", "Dec 20"], []);
  const cinemas = useMemo(
    () => ["Downtown Cinema", "Mall Cinema", "IMAX Theater"],
    []
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Use getMovieById for better performance (single API call instead of fetching all movies)
        const movie = await getMovieById(id);
        setMovie(movie);

        // Fetch showtimes from API (fallback to movie's local showtimes if needed)
        try {
          const st = await getShowtimes(id);
          const arr = Array.isArray(st?.showtimes) ? st.showtimes : [];
          setTimes(arr.length > 0 ? arr : movie?.showtimes || []);
        } catch {
          setTimes(movie?.showtimes || []);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Trigger cinematic effect when title becomes visible
  useEffect(() => {
    if (movie && titleRef.current && !hasTriggeredEffect.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const effectKey = findEffectByTitle(movie.title);
              if (effectKey) {
                triggerEffect(effectKey, 'detailsView', entry.target as HTMLElement);
                hasTriggeredEffect.current = true;
              }
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(titleRef.current);
      
      return () => observer.disconnect();
    }
  }, [movie, triggerEffect]);

  const handleBooking = () => {
    if (movie && selectedTime) {
      navigate(
        `/seats/${movie.id}?date=${encodeURIComponent(
          selectedDate
        )}&time=${encodeURIComponent(
          selectedTime
        )}&cinema=${encodeURIComponent(selectedCinema)}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 text-center">
        Loading movie…
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen py-16 text-center text-red-500">
        {error || "Movie not found"}
      </div>
    );
  }

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

              <h1 ref={titleRef} className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {(movie.genre || []).map((genre) => (
                  <span
                    key={genre}
                    className="bg-card text-foreground-secondary px-3 py-1 rounded-full text-sm border border-border"
                  >
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
                  <p className="text-foreground-secondary">
                    {(movie.cast || []).join(", ")}
                  </p>
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
                          ? "bg-cinema-red text-white"
                          : "bg-background text-foreground-secondary hover:bg-cinema-red/20"
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
                    <option key={cinema} value={cinema}>
                      {cinema}
                    </option>
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
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-cinema-red text-white"
                          : "bg-background text-foreground-secondary hover:bg-cinema-red/20 border border-border"
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
                    <div className="text-foreground font-semibold">
                      ${movie.pricing.regular}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground-secondary text-sm">Premium</div>
                    <div className="text-foreground font-semibold">
                      ${movie.pricing.premium}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground-secondary text-sm">VIP</div>
                    <div className="text-foreground font-semibold">
                      ${movie.pricing.vip}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={!selectedTime}
                variant="cta"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:animate-none"
              >
                Select Seats
              </Button>
            </div>
          </div>
        </div>
        
        {/* Conditional Predict-the-Plot Section */}
        {(() => {
          const now = new Date();
          const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
          const isPredictionsOpen = movie.status === 'coming-soon' && (!releaseDate || now < releaseDate);
          
          if (isPredictionsOpen) {
            return (
              <div className="mt-8">
                <PredictThePlotSection
                  movieId={movie.id}
                  movieTitle={movie.title}
                  isReleased={false}
                  releaseDate={movie.releaseDate}
                />
              </div>
            );
          } else if (movie.status === 'coming-soon') {
            return (
              <div className="mt-8">
                <div className="bg-card rounded-2xl p-6 border border-border text-center">
                  <h3 className="text-xl font-semibold mb-2">Predict-the-Plot</h3>
                  <p className="text-muted-foreground">Predictions are closed for this movie</p>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Conditional Reviews Section */}
        {(() => {
          const now = new Date();
          const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
          const isReviewsOpen = movie.status === 'now-showing' || (releaseDate && now >= releaseDate);
          
          if (isReviewsOpen) {
            return (
              <div className="mt-8">
                <MovieReviewsSection 
                  movieId={movie.id} 
                  avgRating={(movie as any).avgRating || 0}
                  reviewCount={(movie as any).reviewCount || 0}
                />
              </div>
            );
          } else {
            return (
              <div className="mt-8">
                <div className="bg-card rounded-2xl p-6 border border-border text-center">
                  <h3 className="text-xl font-semibold mb-2">Reviews</h3>
                  <p className="text-muted-foreground">Reviews will open once the movie is released.</p>
                </div>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default MovieDetails;