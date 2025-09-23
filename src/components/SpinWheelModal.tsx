import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Trophy } from "lucide-react";
import { Reward } from "@/services/api";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpin: () => Promise<Reward>;
  onContinue: () => void;
}

const SpinWheelModal = ({ isOpen, onClose, onSpin, onContinue }: SpinWheelModalProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      const result = await onSpin();
      // Simulate wheel spin animation delay
      setTimeout(() => {
        setReward(result);
        setShowResult(true);
        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      setIsSpinning(false);
      console.error("Spin failed:", error);
    }
  };

  const handleContinue = () => {
    setShowResult(false);
    setReward(null);
    setIsSpinning(false);
    onClose();
    onContinue();
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "freeItem":
        return <Gift className="w-8 h-8 text-cinema-red" />;
      case "discount":
        return <Sparkles className="w-8 h-8 text-cinema-red" />;
      case "upgrade":
        return <Trophy className="w-8 h-8 text-cinema-red" />;
      default:
        return <Gift className="w-8 h-8 text-cinema-red" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6">
          {!showResult ? (
            <>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`w-32 h-32 rounded-full border-8 border-cinema-red flex items-center justify-center ${
                    isSpinning ? 'animate-spin' : ''
                  }`}>
                    <div className="w-24 h-24 bg-gradient-to-br from-cinema-red to-cinema-accent rounded-full flex items-center justify-center">
                      <Gift className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-foreground">
                  🎉 Congratulations! 🎉
                </h2>
                
                <p className="text-foreground-secondary">
                  You have 3+ premium seats! Spin the wheel to win exciting rewards!
                </p>
              </div>

              <Button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full btn-cinema"
              >
                {isSpinning ? "Spinning..." : "Spin the Wheel!"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {/* Confetti effect */}
                <div className="text-6xl animate-bounce">🎊</div>
                
                <h2 className="text-2xl font-bold text-foreground">
                  You Won!
                </h2>
                
                <div className="bg-gradient-to-br from-cinema-red/10 to-cinema-accent/10 rounded-lg p-6 space-y-4">
                  <div className="flex justify-center">
                    {reward && getRewardIcon(reward.type)}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {reward?.details}
                    </h3>
                    
                    {reward?.expiryDate && (
                      <p className="text-sm text-foreground-secondary">
                        Valid until: {new Date(reward.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-foreground-secondary">
                  Your reward has been added to your account and will appear on your confirmation page!
                </p>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full btn-cinema"
              >
                Continue to Your Ticket
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpinWheelModal;