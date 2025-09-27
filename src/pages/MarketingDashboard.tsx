import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Percent, Gift, Users, Send, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  code: string;
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUsage: number;
  status: 'active' | 'expired' | 'scheduled';
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject: string;
  audience: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'draft' | 'scheduled';
  scheduledDate?: string;
}

const MarketingDashboard = () => {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'bogo',
    value: 0,
    code: '',
    startDate: '',
    endDate: '',
    maxUsage: 100
  });
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    subject: '',
    audience: 'all',
    content: ''
  });

  // Load initial data
  useEffect(() => {
    loadPromotions();
    loadCampaigns();
  }, []);

  const loadPromotions = async () => {
    // Mock data for now - in production this would fetch from API
    const mockPromotions: Promotion[] = [
      {
        id: '1',
        name: 'Student Discount',
        type: 'percentage',
        value: 15,
        code: 'STUDENT15',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageCount: 234,
        maxUsage: 1000,
        status: 'active'
      },
      {
        id: '2',
        name: 'Weekend Special',
        type: 'fixed',
        value: 5,
        code: 'WEEKEND5',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        usageCount: 156,
        maxUsage: 500,
        status: 'active'
      },
      {
        id: '3',
        name: 'Buy One Get One',
        type: 'bogo',
        value: 50,
        code: 'BOGO50',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        usageCount: 89,
        maxUsage: 200,
        status: 'expired'
      }
    ];
    setPromotions(mockPromotions);
  };

  const loadCampaigns = async () => {
    // Mock data for now - in production this would fetch from API
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'New Movie Releases',
        type: 'email',
        subject: 'Exciting New Movies This Week!',
        audience: 'All Active Users',
        sentCount: 2847,
        openRate: 24.5,
        clickRate: 8.2,
        status: 'sent'
      },
      {
        id: '2',
        name: 'Weekend Promotions',
        type: 'sms',
        subject: 'Weekend movie deals await you!',
        audience: 'Frequent Visitors',
        sentCount: 1234,
        openRate: 89.2,
        clickRate: 15.6,
        status: 'sent'
      },
      {
        id: '3',
        name: 'Birthday Offers',
        type: 'email',
        subject: 'Happy Birthday! Enjoy Special Discounts',
        audience: 'Birthday Users',
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        status: 'draft'
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const loyaltyProgram = {
    totalMembers: 1456,
    pointsPerDollar: 10,
    rewardThresholds: [
      { points: 100, reward: 'Free Popcorn' },
      { points: 250, reward: '10% Discount' },
      { points: 500, reward: 'Free Movie Ticket' },
      { points: 1000, reward: 'VIP Experience' }
    ]
  };

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewPromotion({ ...newPromotion, code });
  };

  const createPromotion = async () => {
    if (!newPromotion.name || !newPromotion.code || !newPromotion.startDate || !newPromotion.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // In production, this would be an API call
      const promotion: Promotion = {
        id: Date.now().toString(),
        ...newPromotion,
        usageCount: 0,
        status: new Date(newPromotion.startDate) > new Date() ? 'scheduled' : 'active'
      };
      
      setPromotions([...promotions, promotion]);
      setNewPromotion({
        name: '',
        type: 'percentage',
        value: 0,
        code: '',
        startDate: '',
        endDate: '',
        maxUsage: 100
      });
      toast.success('Promotion created successfully!');
    } catch (error) {
      toast.error('Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // In production, this would be an API call
      const campaign: Campaign = {
        id: Date.now().toString(),
        ...newCampaign,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        status: 'draft'
      };
      
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        name: '',
        type: 'email',
        subject: '',
        audience: 'all',
        content: ''
      });
      toast.success('Campaign created successfully!');
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      // Mock API call - in production this would send the campaign
      const updatedCampaigns = campaigns.map(c => 
        c.id === campaignId 
          ? { ...c, status: 'sent' as const, sentCount: Math.floor(Math.random() * 3000) + 1000 }
          : c
      );
      setCampaigns(updatedCampaigns);
      toast.success('Campaign sent successfully!');
    } catch (error) {
      toast.error('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const togglePromotion = async (promoId: string) => {
    const updatedPromotions = promotions.map(p => 
      p.id === promoId 
        ? { ...p, status: (p.status === 'active' ? 'expired' : 'active') as 'active' | 'expired' | 'scheduled' }
        : p
    );
    setPromotions(updatedPromotions);
    toast.success('Promotion status updated');
  };

  const CampaignBuilder = () => (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <Input 
              placeholder="Enter campaign name" 
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Type</label>
            <select 
              className="w-full px-3 py-2 border rounded-md bg-background"
              value={newCampaign.type}
              onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as 'email' | 'sms' })}
            >
              <option value="email">Email Campaign</option>
              <option value="sms">SMS Campaign</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <select 
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={newCampaign.audience}
            onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
          >
            <option value="all">All Active Users (2,847)</option>
            <option value="frequent">Frequent Visitors (456)</option>
            <option value="inactive">Inactive Users (234)</option>
            <option value="vip">VIP Members (89)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Subject Line</label>
          <Input 
            placeholder="Enter email subject or SMS preview" 
            value={newCampaign.subject}
            onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Message Content</label>
          <Textarea 
            placeholder="Write your message content here..."
            className="min-h-[100px]"
            value={newCampaign.content}
            onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={createCampaign} disabled={loading}>
            {loading ? 'Creating...' : 'Save as Draft'}
          </Button>
          <Button variant="outline">Schedule</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketing Dashboard</h1>
            <p className="text-muted-foreground">Manage promotions, campaigns, and customer engagement</p>
          </div>
          <Button className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <Tabs defaultValue="promotions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="space-y-6">
            {/* Promotion Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Active Promotions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">489</div>
                  <div className="text-sm text-muted-foreground">Uses This Month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">$7,234</div>
                  <div className="text-sm text-muted-foreground">Revenue Impact</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">18.3%</div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Create New Promotion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Create New Promotion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Promotion Name</label>
                    <Input
                      value={newPromotion.name}
                      onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                      placeholder="e.g., Summer Special"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={newPromotion.type}
                      onChange={(e) => setNewPromotion({ ...newPromotion, type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Off</option>
                      <option value="bogo">Buy One Get One</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {newPromotion.type === 'percentage' ? 'Percentage (%)' : 
                       newPromotion.type === 'fixed' ? 'Amount ($)' : 'Discount (%)'}
                    </label>
                    <Input
                      type="number"
                      value={newPromotion.value}
                      onChange={(e) => setNewPromotion({ ...newPromotion, value: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        value={newPromotion.code}
                        onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
                        placeholder="CODE"
                      />
                      <Button variant="outline" onClick={generatePromoCode}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={newPromotion.startDate}
                      onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <Input
                      type="date"
                      value={newPromotion.endDate}
                      onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Uses</label>
                    <Input
                      type="number"
                      value={newPromotion.maxUsage}
                      onChange={(e) => setNewPromotion({ ...newPromotion, maxUsage: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <Button className="flex items-center gap-2" onClick={createPromotion} disabled={loading}>
                  <Gift className="h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Promotion'}
                </Button>
              </CardContent>
            </Card>

            {/* Active Promotions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Promotions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div className="font-medium">{promo.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {promo.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promo.type === 'percentage' ? `${promo.value}%` :
                           promo.type === 'fixed' ? `$${promo.value}` :
                           `${promo.value}% off 2nd item`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(promo.usageCount / promo.maxUsage) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {promo.usageCount}/{promo.maxUsage}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{promo.endDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={promo.status === 'active' ? 'default' : 'secondary'}
                            className={
                              promo.status === 'active' ? 'bg-green-500' :
                              promo.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                            }
                          >
                            {promo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePromotion(promo.id)}
                            >
                              {promo.status === 'active' ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">8</div>
                  <div className="text-sm text-muted-foreground">Active Campaigns</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">4,081</div>
                  <div className="text-sm text-muted-foreground">Messages Sent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">32.4%</div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">12.1%</div>
                  <div className="text-sm text-muted-foreground">Click Rate</div>
                </CardContent>
              </Card>
            </div>

            <CampaignBuilder />

            {/* Campaign History */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground">{campaign.subject}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {campaign.type === 'email' ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                            {campaign.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.audience}</TableCell>
                        <TableCell>{campaign.sentCount.toLocaleString()}</TableCell>
                        <TableCell>{campaign.openRate}%</TableCell>
                        <TableCell>{campaign.clickRate}%</TableCell>
                        <TableCell>
                          <Badge 
                            variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                            className={
                              campaign.status === 'sent' ? 'bg-green-500' :
                              campaign.status === 'draft' ? 'bg-gray-500' : 'bg-yellow-500'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {campaign.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => sendCampaign(campaign.id)}
                                disabled={loading}
                              >
                                Send Now
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loyalty Program Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Loyalty Program Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{loyaltyProgram.totalMembers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Members</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{loyaltyProgram.pointsPerDollar}</div>
                      <div className="text-sm text-muted-foreground">Points per $1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reward Thresholds */}
              <Card>
                <CardHeader>
                  <CardTitle>Reward Thresholds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loyaltyProgram.rewardThresholds.map((threshold, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{threshold.reward}</div>
                            <div className="text-sm text-muted-foreground">{threshold.points} points</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Campaigns</span>
                      <span className="font-medium">28.5% open rate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SMS Campaigns</span>
                      <span className="font-medium">89.2% open rate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Conversions</span>
                      <span className="font-medium">542 bookings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Redemptions</span>
                      <span className="font-medium">489 uses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue Impact</span>
                      <span className="font-medium">$7,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Order Value</span>
                      <span className="font-medium">$28.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Loyalty Members</span>
                      <span className="font-medium">1,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Repeat Customers</span>
                      <span className="font-medium">67.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Visit Frequency</span>
                      <span className="font-medium">2.3x/month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketingDashboard;