import { useState } from 'react';
import { Plus, Edit, Trash2, Settings, Users, Monitor, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [screens, setScreens] = useState<Screen[]>([
    {
      id: '1',
      name: 'Screen 1',
      capacity: 120,
      seatLayout: [],
      seatTypes: [
        { id: 'regular', name: 'Regular', price: 12, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', price: 18, color: 'bg-purple-500' },
        { id: 'vip', name: 'VIP', price: 25, color: 'bg-gold-500' }
      ],
      status: 'active',
      currentMovie: 'Dune'
    },
    {
      id: '2',
      name: 'Screen 2',
      capacity: 150,
      seatLayout: [],
      seatTypes: [
        { id: 'regular', name: 'Regular', price: 12, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', price: 18, color: 'bg-purple-500' }
      ],
      status: 'active',
      currentMovie: 'The Dark Knight'
    },
    {
      id: '3',
      name: 'IMAX',
      capacity: 200,
      seatLayout: [],
      seatTypes: [
        { id: 'regular', name: 'Regular', price: 15, color: 'bg-blue-500' },
        { id: 'premium', name: 'Premium', price: 22, color: 'bg-purple-500' },
        { id: 'vip', name: 'VIP', price: 30, color: 'bg-gold-500' }
      ],
      status: 'maintenance'
    }
  ]);

  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [showSeatEditor, setShowSeatEditor] = useState(false);

  const seatTypes: SeatType[] = [
    { id: 'regular', name: 'Regular', price: 12, color: 'bg-blue-500' },
    { id: 'premium', name: 'Premium', price: 18, color: 'bg-purple-500' },
    { id: 'vip', name: 'VIP', price: 25, color: 'bg-gold-500' },
    { id: 'disabled', name: 'Accessible', price: 12, color: 'bg-green-500' }
  ];

  const SeatMapEditor = ({ screen }: { screen: Screen }) => {
    const rows = 10;
    const seatsPerRow = 12;
    
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Screen</h4>
          <div className="w-full h-2 bg-primary/20 rounded mb-4"></div>
          
          <div className="space-y-2">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center items-center gap-1">
                <span className="w-6 text-center text-sm font-medium">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                {Array.from({ length: seatsPerRow }, (_, seatIndex) => (
                  <button
                    key={seatIndex}
                    className="w-6 h-6 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs"
                    title={`${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`}
                  >
                    {seatIndex + 1}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Seat Types</h4>
            {seatTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${type.color}`}></div>
                <span className="text-sm">{type.name} - ${type.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Theater Management</h1>
            <p className="text-muted-foreground">Manage screens, seats, and pricing</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Screen
          </Button>
        </div>

        <Tabs defaultValue="screens" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="screens">Screen Management</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="screens" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screens.map((screen) => (
                <Card key={screen.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        {screen.name}
                      </CardTitle>
                      <Badge 
                        variant={screen.status === 'active' ? 'default' : 'secondary'}
                        className={
                          screen.status === 'active' ? 'bg-green-500' :
                          screen.status === 'maintenance' ? 'bg-red-500' : 'bg-yellow-500'
                        }
                      >
                        {screen.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{screen.capacity} seats</span>
                      </div>
                      {screen.currentMovie && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Movie:</span>
                          <span className="font-medium">{screen.currentMovie}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Seat Types:</span>
                        <div className="flex gap-1 flex-wrap">
                          {screen.seatTypes.map((type) => (
                            <Badge key={type.id} variant="outline" className="text-xs">
                              {type.name} - ${type.price}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedScreen(screen);
                            setShowSeatEditor(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Layout
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showSeatEditor && selectedScreen && (
              <Card>
                <CardHeader>
                  <CardTitle>Seat Layout Editor - {selectedScreen.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeatMapEditor screen={selectedScreen} />
                  <div className="flex gap-2 mt-4">
                    <Button>Save Layout</Button>
                    <Button variant="outline" onClick={() => setShowSeatEditor(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Tier Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seatTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded ${type.color}`}></div>
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">Standard pricing tier</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${type.price}</p>
                          <p className="text-sm text-muted-foreground">per ticket</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {screens.map((screen) => (
                    <div key={screen.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{screen.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {screen.status === 'maintenance' ? 'Under maintenance' : 'Operational'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={screen.status === 'active' ? 'default' : 'secondary'}
                          className={
                            screen.status === 'active' ? 'bg-green-500' :
                            screen.status === 'maintenance' ? 'bg-red-500' : 'bg-yellow-500'
                          }
                        >
                          {screen.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {screen.status === 'maintenance' ? 'Mark Active' : 'Schedule Maintenance'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TheaterManagement;