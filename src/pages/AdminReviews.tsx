import { useState, useEffect } from 'react';
import { Star, Flag, Trash2, CheckCircle, XCircle, Filter, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMovies, UiMovie, Review, getCurrentUser, getToken, BASE } from '@/services/api';

const AdminReviews = () => {
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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
    fetchReviews();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [selectedMovie, selectedStatus, currentPage]);

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

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (selectedMovie !== 'all') {
        params.append('movieId', selectedMovie);
      }
      
      const response = await fetch(`${BASE}/api/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let filteredReviews = data.reviews || [];
        
        if (selectedStatus !== 'all') {
          filteredReviews = filteredReviews.filter((r: Review) => r.status === selectedStatus);
        }
        
        setReviews(filteredReviews);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'published' | 'flagged' | 'removed') => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BASE}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Review ${status === 'published' ? 'approved' : status === 'flagged' ? 'flagged' : 'removed'}`,
        });
        fetchReviews();
      } else {
        throw new Error('Failed to update review');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!token || !window.confirm('Are you sure you want to permanently delete this review?')) return;
    
    try {
      const response = await fetch(`${BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Review deleted permanently",
        });
        fetchReviews();
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>;
      case 'flagged':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Flagged</Badge>;
      case 'removed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Removed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reviews Management</h1>
            <p className="text-muted-foreground">Moderate and manage user reviews</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin" className="flex items-center gap-2">
              Back to Admin
            </Link>
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{review.userId?.name || 'Unknown User'}</span>
                        {getStatusBadge(review.status)}
                        {review.isVerified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating)}
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Movie:</p>
                      <p className="font-medium">{review.movieId?.title || 'Unknown Movie'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Review:</p>
                      <p className="text-sm leading-relaxed bg-muted p-3 rounded-lg">
                        {review.comment}
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      {review.status !== 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review._id, 'published')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                      )}
                      
                      {review.status !== 'flagged' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review._id, 'flagged')}
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                        >
                          <Flag className="h-3 w-3" />
                          Flag
                        </Button>
                      )}
                      
                      {review.status !== 'removed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review._id, 'removed')}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                        >
                          <XCircle className="h-3 w-3" />
                          Hide
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReview(review._id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
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

export default AdminReviews;