import { useEffect, useState } from "react";
import { getMyRewards, Reward } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Gift, Sparkles, Trophy, Calendar, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'issued' | 'claimed' | 'expired'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, [filter]);

  const fetchRewards = async () => {
    try {
      const data = await getMyRewards(filter === 'all' ? undefined : filter);
      setRewards(data);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "freeItem":
        return <Gift className="w-5 h-5 text-cinema-red" />;
      case "discount":
        return <Sparkles className="w-5 h-5 text-cinema-red" />;
      case "upgrade":
        return <Trophy className="w-5 h-5 text-cinema-red" />;
      default:
        return <Gift className="w-5 h-5 text-cinema-red" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'all') return true;
    return reward.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card rounded w-1/4"></div>
            <div className="h-24 bg-card rounded"></div>
            <div className="h-24 bg-card rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Rewards</h1>
          <p className="text-foreground-secondary">
            Track and manage your cinema rewards earned from premium bookings
          </p>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="issued">Active</TabsTrigger>
            <TabsTrigger value="claimed">Used</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {filter === 'all' ? 'No rewards yet' : `No ${filter} rewards`}
            </h3>
            <p className="text-foreground-secondary mb-6">
              {filter === 'all' 
                ? 'Book 3+ premium seats to earn your first reward!'
                : `You have no ${filter} rewards at the moment.`
              }
            </p>
            <Button 
              onClick={() => window.location.href = '/movies'}
              className="btn-cinema"
            >
              Browse Movies
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRewards.map((reward, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getRewardIcon(reward.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {reward.details}
                        </h3>
                        <Badge className={getStatusColor(reward.status)}>
                          {reward.status}
                        </Badge>
                      </div>
                      
                      {reward.bookingId && (
                        <div className="text-sm text-foreground-secondary space-y-1">
                          <div className="flex items-center gap-2">
                            <span>From booking:</span>
                            <span className="font-mono">{reward.bookingId.bookingReference}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>{reward.bookingId.movieId.title}</span>
                            <span>•</span>
                            <span>{reward.bookingId.cinema}</span>
                            <span>•</span>
                            <span>{reward.bookingId.showtime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-foreground-secondary">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Earned: {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {reward.expiryDate && reward.status === 'issued' && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRewards;