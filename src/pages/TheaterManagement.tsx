import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Users, Monitor, Wrench, Search, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getTheaters, createTheater, updateTheater, deleteTheater, getToken, getCurrentUser, type Theater, getAdminTheaters } from '@/services/api';

interface SeatType {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface Screen {
  id: string;
  name: string;
  capacity: number;
  seatLayout: string[][];
  seatTypes: SeatType[];
  status: 'active' | 'maintenance' | 'cleaning';
  currentMovie?: string;
}

const TheaterManagement = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 0,
    amenities: [] as string[]
  });
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
    
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const data = await getAdminTheaters();
      setTheaters(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch theaters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    
    try {
      if (editingTheater) {
        await updateTheater(token, editingTheater._id, formData);
        toast({
          title: "Success",
          description: "Theater updated successfully",
        });
      } else {
        await createTheater(token, formData);
        toast({
          title: "Success",
          description: "Theater created successfully",
        });
      }
      
      fetchTheaters();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theater",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this theater?')) return;
    
    try {
      await deleteTheater(token, id);
      toast({
        title: "Success",
        description: "Theater deleted successfully",
      });
      fetchTheaters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete theater",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', capacity: 0, amenities: [] });
    setEditingTheater(null);
    setShowAddDialog(false);
  };

  const handleEdit = (theater: Theater) => {
    setEditingTheater(theater);
    setFormData({
      name: theater.name,
      location: theater.location,
      capacity: theater.capacity,
      amenities: theater.amenities
    });
    setShowAddDialog(true);
  };

  const filteredTheaters = theaters.filter(theater =>
    theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theater.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading theaters...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Theater Management</h1>
            <p className="text-muted-foreground">Manage theaters and screens</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Theater
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTheater ? 'Edit Theater' : 'Add New Theater'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Theater Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter theater name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="Enter capacity"
                  />
                </div>
                <div>
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    value={formData.amenities.join(', ')}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(',').map(a => a.trim()) })}
                    placeholder="IMAX, Dolby Atmos, Reclining Seats"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSave}>
                    {editingTheater ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search theaters by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="theaters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theaters">Theater Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="theaters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheaters.map((theater) => (
                <Card key={theater._id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        {theater.name}
                      </CardTitle>
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{theater.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{theater.capacity} seats</span>
                      </div>
                      {theater.totalBookings && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Bookings:</span>
                          <span className="font-medium">{theater.totalBookings}</span>
                        </div>
                      )}
                      {theater.occupancyRate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Occupancy Rate:</span>
                          <span className="font-medium">{theater.occupancyRate}%</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Amenities:</span>
                        <div className="flex gap-1 flex-wrap">
                          {theater.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(theater)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(theater._id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Theaters</p>
                      <p className="text-2xl font-bold">{theaters.length}</p>
                    </div>
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Capacity</p>
                      <p className="text-2xl font-bold">{theaters.reduce((sum, t) => sum + t.capacity, 0)}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                      <p className="text-2xl font-bold">
                        {theaters.length > 0 
                          ? Math.round(theaters.reduce((sum, t) => sum + (t.occupancyRate || 0), 0) / theaters.length)
                          : 0
                        }%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
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

export default TheaterManagement;