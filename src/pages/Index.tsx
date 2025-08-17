import HeroSection from '../components/HeroSection';
import MovieSection from '../components/MovieSection';
import { nowShowingMovies, comingSoonMovies } from '../data/movies';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <MovieSection
        title="Now Showing"
        movies={nowShowingMovies}
        viewAllLink="/movies"
      />
      
      <MovieSection
        title="Coming Soon"
        movies={comingSoonMovies}
        viewAllLink="/movies"
      />
    </div>
  );
};

export default Index;
