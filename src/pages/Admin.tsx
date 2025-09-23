import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Save, X, BarChart3, Users, Monitor, TrendingUp, MessageSquare, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { useToast } from '@/hooks/use-toast';
import { getMovies, createMovie, updateMovie, deleteMovie, getToken, getCurrentUser, toUiMovie, type UiMovie, type ApiMovie } from '@/services/api';

const Admin = () => {
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMovie, setEditingMovie] = useState<UiMovie | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const token = getToken();
  const user = getCurrentUser();

  const [formData, setFormData] = useState<{
    title: string;
    genre: string[] | string;
    rating: string;
    duration: string;
    releaseYear: string;
    poster: string;
    synopsis: string;
    director: string;
    cast: string[] | string;
    showtimes: string[] | string;
    pricing: { regular: number; premium: number; vip: number };
    status: 'now-showing' | 'coming-soon';
    featured: boolean;
  }>({
    title: '',
    genre: [],
    rating: '',
    duration: '',
    releaseYear: '',
    poster: '',
    synopsis: '',
    director: '',
    cast: [],
    showtimes: [],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: 'now-showing',
    featured: false
  });

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
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie: UiMovie) => {
    setEditingMovie(movie);
    setFormData({
      ...movie,
      featured: movie.featured || false
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this movie?')) return;
    
    try {
      await deleteMovie(token, id);
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
      fetchMovies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title || !token) return;

    const movieData: Omit<ApiMovie, '_id'> = {
      title: formData.title || '',
      genre: Array.isArray(formData.genre) ? formData.genre : (typeof formData.genre === 'string' ? formData.genre.split(',').map(g => g.trim()) : []),
      rating: formData.rating || '',
      duration: formData.duration || '',
      releaseYear: formData.releaseYear || '',
      poster: formData.poster || '',
      synopsis: formData.synopsis || '',
      director: formData.director || '',
      cast: Array.isArray(formData.cast) ? formData.cast : (typeof formData.cast === 'string' ? formData.cast.split(',').map(c => c.trim()) : []),
      showtimes: Array.isArray(formData.showtimes) ? formData.showtimes : (typeof formData.showtimes === 'string' ? formData.showtimes.split(',').map(s => s.trim()) : []),
      pricing: formData.pricing || { regular: 12, premium: 18, vip: 25 },
      status: formData.status || 'now-showing',
      featured: formData.featured || false
    };

    try {
      if (isEditing && editingMovie) {
        await updateMovie(token, editingMovie.id, movieData);
        toast({
          title: "Success",
          description: "Movie updated successfully",
        });
      } else {
        await createMovie(token, movieData);
        toast({
          title: "Success",
          description: "Movie created successfully",
        });
      }
      
      fetchMovies();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save movie",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      genre: [],
      rating: '',
      duration: '',
      releaseYear: '',
      poster: '',
      synopsis: '',
      director: '',
      cast: [],
      showtimes: [],
      pricing: { regular: 12, premium: 18, vip: 25 },
      status: 'now-showing',
      featured: false
    });
    setIsEditing(false);
    setEditingMovie(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your cinema operations and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-cinema flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Movie</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/theater-management">
              <CardContent className="p-6 text-center">
                <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Theater Management</h3>
                <p className="text-sm text-muted-foreground">Screens & Seats</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/user-management">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground">Customers & Staff</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/analytics">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Sales Analytics</h3>
                <p className="text-sm text-muted-foreground">Reports & Insights</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/marketing">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Marketing</h3>
                <p className="text-sm text-muted-foreground">Promotions & Campaigns</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/reports">
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Reports</h3>
                <p className="text-sm text-muted-foreground">Custom Analytics</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Dashboard Overview */}
        <DashboardOverview />

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-card rounded-xl p-6 mb-8 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {isEditing ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <button
                onClick={resetForm}
                className="text-foreground-secondary hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-foreground-secondary mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-cinema w-full"
                  placeholder="Movie title"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Genre</label>
                <input
                  type="text"
                  value={Array.isArray(formData.genre) ? formData.genre.join(', ') : formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value.split(',').map(g => g.trim()) })}
                  className="input-cinema w-full"
                  placeholder="Action, Drama, Comedy"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Rating</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="input-cinema w-full"
                >
                  <option value="">Select Rating</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-cinema w-full"
                  placeholder="120 min"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Release Year</label>
                <input
                  type="text"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                  className="input-cinema w-full"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  className="input-cinema w-full"
                  placeholder="Director name"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Cast</label>
                <input
                  type="text"
                  value={Array.isArray(formData.cast) ? formData.cast.join(', ') : formData.cast}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value.split(',').map(c => c.trim()) })}
                  className="input-cinema w-full"
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Showtimes</label>
                <input
                  type="text"
                  value={Array.isArray(formData.showtimes) ? formData.showtimes.join(', ') : formData.showtimes}
                  onChange={(e) => setFormData({ ...formData, showtimes: e.target.value.split(',').map(s => s.trim()) })}
                  className="input-cinema w-full"
                  placeholder="2:30 PM, 5:45 PM, 8:30 PM"
                />
              </div>

              <div>
                <label className="block text-foreground-secondary mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'now-showing' | 'coming-soon' })}
                  className="input-cinema w-full"
                >
                  <option value="now-showing">Now Showing</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border text-cinema-red focus:ring-cinema-red"
                />
                <label htmlFor="featured" className="text-foreground-secondary">Featured Movie</label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-foreground-secondary mb-2">Synopsis</label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                className="input-cinema w-full h-24 resize-none"
                placeholder="Movie synopsis..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-foreground-secondary mb-2">Poster URL</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  className="input-cinema flex-1"
                  placeholder="Poster image URL"
                />
                <button className="btn-cinema-outline flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={resetForm}
                className="btn-cinema-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-cinema flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Update' : 'Save'} Movie</span>
              </button>
            </div>
          </div>
        )}

        {/* Movies List */}
        <div className="bg-card rounded-xl overflow-hidden border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Movies ({movies.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left p-4 text-foreground-secondary font-medium">Movie</th>
                  <th className="text-left p-4 text-foreground-secondary font-medium">Genre</th>
                  <th className="text-left p-4 text-foreground-secondary font-medium">Rating</th>
                  <th className="text-left p-4 text-foreground-secondary font-medium">Status</th>
                  <th className="text-left p-4 text-foreground-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id} className="border-t border-border hover:bg-background/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-foreground">{movie.title}</h3>
                          <p className="text-sm text-foreground-secondary">{movie.releaseYear} • {movie.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      {movie.genre.join(', ')}
                    </td>
                    <td className="p-4">
                      <span className="bg-cinema-red/20 text-cinema-red px-2 py-1 rounded text-sm">
                        {movie.rating}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        movie.status === 'now-showing' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(movie)}
                          className="p-2 text-foreground-secondary hover:text-foreground hover:bg-background rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id)}
                          className="p-2 text-foreground-secondary hover:text-red-400 hover:bg-background rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;