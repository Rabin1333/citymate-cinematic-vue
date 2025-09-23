import React, { useState, useEffect } from "react";
import { Star, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMovieReviews, Review } from "@/services/api";
import { format } from "date-fns";

interface MovieReviewsSectionProps {
  movieId: string;
  avgRating: number;
  reviewCount: number;
}

export const MovieReviewsSection: React.FC<MovieReviewsSectionProps> = ({
  movieId,
  avgRating,
  reviewCount
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchReviews();
  }, [movieId, currentPage, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getMovieReviews(movieId, currentPage, 5, sortBy);
      setReviews(response.reviews);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
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

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Reviews</h3>
          {reviewCount > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(avgRating))}
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          )}
        </div>
        
        {reviews.length > 0 && (
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this movie!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.userId.name}</span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Shield className="h-3 w-3" />
                        Verified Viewer
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {renderStars(review.rating)}
                    <span>{format(new Date(review.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{review.comment}</p>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};