// src/components/profile/PredictionsSection.tsx
import { useState, useEffect } from "react";
import { Lightbulb, Trophy, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { getMyPredictions, deletePrediction, type Prediction } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const PredictionsSection = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPredictions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getMyPredictions(page, 10);
      setPredictions(response.predictions);
      setTotalPages(response.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      toast({
        title: "Error",
        description: "Failed to load your predictions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const handleDeletePrediction = async (predictionId: string) => {
    setDeleting(predictionId);
    try {
      await deletePrediction(predictionId);
      setPredictions(prev => prev.filter(p => p._id !== predictionId));
      toast({
        title: "Prediction Deleted",
        description: "Your prediction has been removed",
      });
    } catch (error) {
      toast({
        title: "Failed to Delete",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const canDeletePrediction = (prediction: Prediction) => {
    if (prediction.isWinner) return false;
    if (!prediction.movieId) return true;
    
    // Check if movie is released
    const isReleased = prediction.movieId.status === 'now-showing' || 
      (prediction.movieId.releaseDate && new Date(prediction.movieId.releaseDate) <= new Date());
    
    return !isReleased;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (prediction: Prediction) => {
    if (prediction.isWinner) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
          <Trophy className="w-3 h-3" />
          Winner
        </div>
      );
    }

    if (!prediction.movieId) return null;

    const isReleased = prediction.movieId.status === 'now-showing' || 
      (prediction.movieId.releaseDate && new Date(prediction.movieId.releaseDate) <= new Date());

    if (isReleased) {
      return (
        <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          Results Pending
        </div>
      );
    }

    return (
      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
        Active
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Predictions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start making predictions on upcoming movies to earn rewards!
          </p>
          <Button onClick={() => window.location.href = '/movies'}>
            Browse Movies
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {predictions.map((prediction) => (
          <Card key={prediction._id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {prediction.movieId && (
                    <img
                      src={prediction.movieId.poster}
                      alt={prediction.movieId.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {prediction.movieId?.title || 'Unknown Movie'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Predicted on {formatDate(prediction.createdAt)}
                        {prediction.updatedAt !== prediction.createdAt && ' (edited)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(prediction)}
                  {prediction.movieId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/movie/${prediction.movieId!._id}`}
                      className="p-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Your prediction:</p>
                  <p className="text-foreground">{prediction.predictionText}</p>
                </div>

                {prediction.isWinner && prediction.rewardId && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Congratulations! You won!</span>
                    </div>
                    <p className="text-sm text-yellow-700">{prediction.rewardId.rewardDetails}</p>
                  </div>
                )}

                {canDeletePrediction(prediction) && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrediction(prediction._id)}
                      disabled={deleting === prediction._id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {deleting === prediction._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && loadPredictions(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => loadPredictions(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && loadPredictions(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PredictionsSection;