import { useState, useEffect } from 'react';
import { Trophy, Download, Filter, Eye, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMovies, UiMovie, Prediction, getCurrentUser, getToken, BASE } from '@/services/api';

const AdminPredictions = () => {
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const token = getToken();
  const user = getCurrentUser();

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need admin access to view this page.",
        variant: "destructive",
      });
      return;
    }
    
    fetchMovies();
    fetchPredictions();
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [selectedMovie, currentPage]);

  const fetchMovies = async () => {
    try {
      const moviesData = await getMovies();
      setMovies(moviesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch movies",
        variant: "destructive",
      });
    }
  };

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      let url = `${BASE}/api/predictions`;
      if (selectedMovie !== 'all') {
        url += `/movie/${selectedMovie}`;
      }
      url += `?page=${currentPage}&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsWinner = async (predictionId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BASE}/api/predictions/${predictionId}/winner`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Prediction marked as winner!",
        });
        fetchPredictions();
      } else {
        throw new Error('Failed to mark as winner');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark prediction as winner",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['User', 'Movie', 'Prediction', 'Date', 'Winner'],
      ...predictions.map(p => [
        p.userId?.name || 'Unknown',
        p.movieId?.title || 'Unknown',
        p.predictionText,
        new Date(p.createdAt).toLocaleDateString(),
        p.isWinner ? 'Yes' : 'No'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions-${selectedMovie === 'all' ? 'all' : movies.find(m => m.id === selectedMovie)?.title || 'unknown'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && predictions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Predictions Management</h1>
            <p className="text-muted-foreground">Manage user predictions and mark winners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                Back to Admin
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <label className="block text-sm font-medium mb-2">Movie</label>
                <Select value={selectedMovie} onValueChange={setSelectedMovie}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select movie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Movies</SelectItem>
                    {movies.map(movie => (
                      <SelectItem key={movie.id} value={movie.id}>
                        {movie.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions List */}
        <Card>
          <CardHeader>
            <CardTitle>Predictions ({predictions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No predictions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div key={prediction._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{prediction.userId?.name || 'Unknown User'}</span>
                        {prediction.isWinner && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Movie:</p>
                      <p className="font-medium">{prediction.movieId?.title || 'Unknown Movie'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Prediction:</p>
                      <p className="text-sm leading-relaxed bg-muted p-3 rounded-lg">
                        {prediction.predictionText}
                      </p>
                    </div>
                    
                    {!prediction.isWinner && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => markAsWinner(prediction._id)}
                          className="flex items-center gap-1"
                        >
                          <Trophy className="h-3 w-3" />
                          Mark as Winner
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPredictions;