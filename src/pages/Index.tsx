import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import MovieSection from "../components/MovieSection";
import FeaturesCTA from "../components/FeaturesCTA";
import Footer from "../components/Footer";
import { getMovies, type UiMovie } from "../services/api";

const Index = () => {
  const [nowShowing, setNowShowing] = useState<UiMovie[]>([]);
  const [comingSoon, setComingSoon] = useState<UiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // all movies → filter now-showing
        const all = await getMovies(false);
        setNowShowing(all.filter(m => m.status === "now-showing"));

        // upcoming only
        const upcoming = await getMovies(true);
        setComingSoon(upcoming);
      } catch (e: any) {
        setError(e?.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="min-h-screen py-16 text-center">Loading…</div>;
  }

  if (error) {
    return <div className="min-h-screen py-16 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* NOTE: HeroSection still uses mock featuredMovie right now.
          We'll update HeroSection next to fetch the featured movie from the API. */}
      <HeroSection />

      {/* Features CTA Section */}
      <FeaturesCTA />

      <MovieSection
        title="Now Showing"
        // If MovieSection's prop type still expects the mock Movie type,
        // this cast keeps TS happy until we update MovieSection next.
        movies={nowShowing as any}
        viewAllLink="/movies"
      />

      <MovieSection
        title="Coming Soon"
        movies={comingSoon as any}
        viewAllLink="/movies"
        onReminderSet={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
