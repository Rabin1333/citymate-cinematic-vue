// src/pages/UserManagement.tsx - FUNCTIONAL VERSION
import { useState, useEffect } from 'react';
import { Search, Filter, User, Mail, Phone, Calendar, Eye, Edit, Trash2, Ban, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getToken, getCurrentUser } from '@/services/api';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  totalBookings: number;
  totalSpent: number;
  memberSince: string;
  blocked?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { toast } = useToast();
  const token = getToken();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need admin access to view this page.",
        variant: "destructive",
      });
      return;
    }
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:4000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked }),
      });
      
      if (!response.ok) throw new Error('Failed to block/unblock user');
      
      toast({
        title: "Success",
        description: blocked ? "User blocked" : "User unblocked",
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'blocked' && user.blocked) ||
                         (selectedFilter === 'active' && !user.blocked);
    return matchesSearch && matchesFilter;
  });

  const activeUsers = users.filter(u => !u.blocked).length;
  const blockedUsers = users.filter(u => u.blocked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage customers and permissions</p>
          </div>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="customers">User Database</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
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
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{users.length}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{blockedUsers}</div>
                  <div className="text-sm text-muted-foreground">Blocked</div>
                </CardContent>
              </Card>
            </div>

            {/* User Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Database ({filteredUsers.length} users)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined {new Date(user.memberSince).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.email}</div>
                            <div className="text-muted-foreground">{user.phone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.totalBookings}</TableCell>
                        <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.blocked ? 'secondary' : 'default'}
                            className={user.blocked ? 'bg-red-500' : 'bg-green-500'}
                          >
                            {user.blocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleBlockUser(user._id, !user.blocked)}
                            >
                              {user.blocked ? 
                                <CheckCircle className="h-3 w-3" /> : 
                                <Ban className="h-3 w-3" />
                              }
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                            >
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