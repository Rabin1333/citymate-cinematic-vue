import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import heroImage from "../assets/hero-bg.jpg";
import { getMovies, type UiMovie } from "../services/api";

const HeroSection = () => {
  const [featuredMovie, setFeaturedMovie] = useState<UiMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const all = await getMovies(false);
        // Pick first now-showing or fallback
        const candidate = all.find((m) => m.status === "now-showing") || all[0];
        setFeaturedMovie(candidate || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load featured movie");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="h-[100vh] flex items-center justify-center bg-black text-white">
        Loading featured movie…
      </section>
    );
  }

  if (error || !featuredMovie) {
    return (
      <section className="h-[100vh] flex items-center justify-center bg-black text-red-500">
        {error || "No featured movie available"}
      </section>
    );
  }

  return (
    <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-fade-in-up">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Featured Movie
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 font-medium">
            Experience cinema like never before with our premium booking platform
          </p>

          {/* Featured Movie Info */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={featuredMovie.poster}
                alt={featuredMovie.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-2xl font-bold text-white">{featuredMovie.title}</h3>
                <p className="text-white/80">{featuredMovie.genre?.join(" • ")}</p>
                <p className="text-cinema-red font-medium">
                  {featuredMovie.rating} • {featuredMovie.duration}
                </p>
              </div>
            </div>
            <p className="text-white/90 mb-4">{featuredMovie.synopsis}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/movie/${featuredMovie.id}`}
                className="btn-cinema flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                Book Now
              </Link>
              <Link
                to="/movies"
                className="btn-cinema-outline flex items-center justify-center gap-2"
              >
                View All Movies
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
