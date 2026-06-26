'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  Eye,
  UserCircle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUsers, getAddresses, getOrders, getProductById } from '@/lib/storage';
import { User, Address, Order, Product } from '@/types';
import { getDiscountedPrice } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface UserDetails extends User {
  addresses: Address[];
  orders: Order[];
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadUsers = () => {
      const allUsers = getUsers();
      const allAddresses = getAddresses();
      const allOrders = getOrders();

      const usersWithDetails = allUsers
        .filter((u) => u.role === 'user')
        .map((user) => ({
          ...user,
          addresses: allAddresses.filter((a) => a.userId === user.id),
          orders: allOrders.filter((o) => o.userId === user.id),
        }));

      setUsers(usersWithDetails);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleViewUser = (user: UserDetails) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'packed':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage and view user information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Addresses</p>
              <p className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.addresses.length, 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.orders.length, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search query' : 'No users have registered yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">User</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden md:table-cell">Contact</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden lg:table-cell">Joined</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Addresses</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Orders</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 bg-emerald-100 text-emerald-700">
                            <AvatarFallback>
                              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate md:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell text-gray-500 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">{user.addresses.length}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">{user.orders.length}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="addresses">
                  Addresses ({selectedUser.addresses.length})
                </TabsTrigger>
                <TabsTrigger value="orders">
                  Orders ({selectedUser.orders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-20 w-20 bg-emerald-100 text-emerald-700 text-2xl mb-4">
                    <AvatarFallback>
                      {selectedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedUser.addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MapPin className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No addresses added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedUser.addresses.map((address) => (
                        <Card key={address.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium">{address.name}</p>
                                  {address.isDefault && (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.street}</p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} {address.zipCode}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <ScrollArea className="h-[400px] pr-4">
                  {selectedUser.orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No orders placed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedUser.orders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-mono text-sm text-gray-500">{order.id}</p>
                                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                              </div>
                              <Badge className={cn('capitalize', getStatusColor(order.status))}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 mb-3">
                              {order.items.slice(0, 2).map((item, idx) => {
                                const product = getProductById(item.productId);
                                return (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {product?.name || 'Unknown Product'} x{item.quantity}
                                    </span>
                                    <span>${(getDiscountedPrice(item.price, item.discount) * item.quantity).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                              {order.items.length > 2 && (
                                <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                              )}
                            </div>
                            <div className="pt-3 border-t flex items-center justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold text-emerald-600">${order.totalAmount.toFixed(2)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
