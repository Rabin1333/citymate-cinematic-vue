// src/components/PredictThePlotSection.tsx
import { useState, useEffect } from "react";
import { Lightbulb, Trophy, Lock, Edit3, Trash2, Calendar } from "lucide-react";
import { createPrediction, deletePrediction, getCurrentUser, type Prediction } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PredictThePlotSectionProps {
  movieId: string;
  movieTitle: string;
  isReleased: boolean;
  releaseDate?: string;
}

const PredictThePlotSection = ({ movieId, movieTitle, isReleased, releaseDate }: PredictThePlotSectionProps) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predictionText, setPredictionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { toast } = useToast();
  
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;

  // Check if user already has a prediction for this movie
  useEffect(() => {
    const checkExistingPrediction = async () => {
      if (!isLoggedIn || !movieId) return;
      
      try {
        const response = await import('@/services/api').then(api => api.getMyPredictions(1, 100));
        const existingPrediction = response.predictions.find(p => 
          p.movieId && p.movieId._id === movieId
        );
        
        if (existingPrediction) {
          setPrediction(existingPrediction);
          setPredictionText(existingPrediction.predictionText);
        }
      } catch (error) {
        console.error('Failed to check existing prediction:', error);
      }
    };

    checkExistingPrediction();
  }, [isLoggedIn, movieId]);

  const handleSubmitPrediction = async () => {
    if (!predictionText.trim()) {
      toast({
        title: "Prediction Required",
        description: "Please enter your prediction before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await createPrediction(movieId, predictionText.trim());
      setPrediction(response.prediction);
      setEditing(false);
      setEditModalOpen(false);
      
      toast({
        title: "Prediction Saved!",
        description: "Your prediction has been recorded. Good luck!",
      });
    } catch (error) {
      toast({
        title: "Failed to Save",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrediction = async () => {
    if (!prediction) return;

    setLoading(true);
    try {
      await deletePrediction(prediction._id);
      setPrediction(null);
      setPredictionText("");
      setEditing(false);
      
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
      setLoading(false);
    }
  };

  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return "Release date TBA";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isLoggedIn) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cinema-red" />
            Predict-the-Plot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-4">
            Sign in to make your predictions and compete for rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cinema-red" />
            Predict-the-Plot
            {prediction?.isWinner && (
              <Trophy className="w-4 h-4 text-yellow-500" aria-label="Winner!" />
            )}
          </CardTitle>
          <p className="text-sm text-foreground-secondary">
            Guess what happens in {movieTitle} and earn rewards if you're right!
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isReleased && (
            <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-foreground-secondary" />
              <span className="text-sm text-foreground-secondary">
                Predictions are locked after movie release
              </span>
            </div>
          )}

          {!isReleased && releaseDate && (
            <div className="bg-cinema-red/10 border border-cinema-red/20 p-3 rounded-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cinema-red" />
              <span className="text-sm text-foreground">
                Predictions close on {formatReleaseDate(releaseDate)}
              </span>
            </div>
          )}

          {prediction ? (
            <div className="space-y-3">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-foreground-secondary mb-1">Your prediction:</p>
                <p className="text-foreground">{prediction.predictionText}</p>
                <p className="text-xs text-foreground-secondary mt-2">
                  Submitted on {new Date(prediction.createdAt).toLocaleDateString()}
                  {prediction.updatedAt !== prediction.createdAt && ' (edited)'}
                </p>
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

              {!isReleased && !prediction.isWinner && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditModalOpen(true);
                      setEditing(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeletePrediction}
                    disabled={loading}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : !isReleased ? (
            <div className="space-y-3">
              <Textarea
                placeholder="What do you think will happen in this movie? Share your prediction..."
                value={predictionText}
                onChange={(e) => setPredictionText(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-secondary">
                  {predictionText.length}/500 characters
                </span>
                <Button 
                  onClick={handleSubmitPrediction}
                  disabled={loading || !predictionText.trim()}
                  className="flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" />
                  {loading ? "Saving..." : "Submit Prediction"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-foreground-secondary py-4">
              Predictions were closed for this movie
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Prediction Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Prediction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What do you think will happen in this movie?"
              value={predictionText}
              onChange={(e) => setPredictionText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-secondary">
                {predictionText.length}/500 characters
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditModalOpen(false);
                  setEditing(false);
                  if (prediction) {
                    setPredictionText(prediction.predictionText);
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPrediction}
                disabled={loading || !predictionText.trim()}
              >
                {loading ? "Saving..." : "Update Prediction"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PredictThePlotSection;