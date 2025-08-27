import { useState } from 'react';
import { Search, Filter, User, Mail, Phone, Calendar, Eye, Edit, Trash2, Ban, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'blocked' | 'inactive';
  lastBooking: string;
  favoriteGenre: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const customers: Customer[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2023-06-15',
      totalBookings: 24,
      totalSpent: 432.50,
      status: 'active',
      lastBooking: '2024-01-20',
      favoriteGenre: 'Action'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      joinDate: '2023-08-22',
      totalBookings: 18,
      totalSpent: 324.00,
      status: 'active',
      lastBooking: '2024-01-18',
      favoriteGenre: 'Drama'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 345-6789',
      joinDate: '2023-12-10',
      totalBookings: 5,
      totalSpent: 90.00,
      status: 'blocked',
      lastBooking: '2023-12-20',
      favoriteGenre: 'Comedy'
    }
  ];

  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@cinema.com',
      role: 'admin',
      joinDate: '2023-01-01',
      lastLogin: '2024-01-21 09:30:00',
      status: 'active',
      permissions: ['full_access', 'user_management', 'financial_reports', 'system_settings']
    },
    {
      id: '2',
      name: 'Jane Manager',
      email: 'jane.manager@cinema.com',
      role: 'manager',
      joinDate: '2023-03-15',
      lastLogin: '2024-01-21 08:45:00',
      status: 'active',
      permissions: ['user_management', 'booking_management', 'reports', 'theater_management']
    },
    {
      id: '3',
      name: 'Bob Staff',
      email: 'bob.staff@cinema.com',
      role: 'staff',
      joinDate: '2023-07-20',
      lastLogin: '2024-01-20 16:30:00',
      status: 'active',
      permissions: ['booking_management', 'customer_support']
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || customer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const CustomerProfile = ({ customer }: { customer: Customer }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Profile - {customer.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {customer.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Booking Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Total Bookings</p>
                  <p className="text-xl font-bold">{customer.totalBookings}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">${customer.totalSpent}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Favorite Genre</p>
                  <p className="font-medium">{customer.favoriteGenre}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Last Booking</p>
                  <p className="font-medium">{customer.lastBooking}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Recent Booking History</h4>
          <div className="space-y-2">
            {['Dune - Screen 1 - Jan 20, 2024', 'The Dark Knight - IMAX - Jan 15, 2024', 'Inception - Screen 2 - Jan 10, 2024'].map((booking, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="text-sm">{booking}</span>
                <Badge variant="outline">$18.00</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage customers and staff members</p>
          </div>
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">Customer Database</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">2,847</div>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">2,651</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">47</div>
                  <div className="text-sm text-muted-foreground">Blocked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">149</div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Database ({filteredCustomers.length} customers)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined {customer.joinDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.email}</div>
                            <div className="text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.totalBookings}</TableCell>
                        <TableCell>${customer.totalSpent}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={customer.status === 'active' ? 'default' : 'secondary'}
                            className={
                              customer.status === 'active' ? 'bg-green-500' :
                              customer.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              {customer.status === 'blocked' ? 
                                <CheckCircle className="h-3 w-3" /> : 
                                <Ban className="h-3 w-3" />
                              }
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

          <TabsContent value="staff" className="space-y-6">
            {/* Staff Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Total Staff</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">11</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </CardContent>
              </Card>
            </div>

            {/* Staff Table */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground">{staff.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              staff.role === 'admin' ? 'border-red-500 text-red-600' :
                              staff.role === 'manager' ? 'border-blue-500 text-blue-600' :
                              'border-green-500 text-green-600'
                            }
                          >
                            {staff.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(staff.lastLogin).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={staff.status === 'active' ? 'default' : 'secondary'}
                            className={staff.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                          >
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3 w-3" />
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
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagement;