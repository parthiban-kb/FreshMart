'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Package,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Box,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeOrders, changeOrderStatus } from '@/store/slices/ordersSlice';
import { initializeProducts } from '@/store/slices/productsSlice';
import { getAddresses, getUsers, getProductById } from '@/lib/storage';
import { Order, Address, User as UserType, OrderStatus } from '@/types';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusOptions: { value: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { value: 'packed', label: 'Packed', icon: Box, color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
];

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { items: orders, isLoading } = useAppSelector((state) => state.orders);
  const { items: products } = useAppSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    dispatch(initializeOrders());
    dispatch(initializeProducts());
    setAddresses(getAddresses());
    setUsers(getUsers());
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === 'pending').length,
      packed: orders.filter((o) => o.status === 'packed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
  }, [orders]);

  const getUser = (userId: string) => users.find((u) => u.id === userId);
  const getAddress = (addressId: string) => addresses.find((a) => a.id === addressId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    return option?.color || 'bg-gray-100 text-gray-700';
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleOpenStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus !== selectedOrder.status) {
      dispatch(changeOrderStatus({ orderId: selectedOrder.id, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
      setIsStatusDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statusOptions.map((status) => {
          const Icon = status.icon;
          return (
            <Card
              key={status.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                statusFilter === status.value && 'ring-2 ring-emerald-500'
              )}
              onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', status.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{status.label}</p>
                  <p className="text-2xl font-bold">{stats[status.value]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden md:table-cell">Customer</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden lg:table-cell">Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Items</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Total</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const user = getUser(order.userId);
                    return (
                      <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-sm text-gray-900">{order.id}</p>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <p className="text-gray-900 truncate max-w-[150px]">{user?.name || 'Unknown'}</p>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell text-gray-500 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline">{order.items.length}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={cn('capitalize', getStatusColor(order.status))}>{order.status}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(order)}
                              className="hidden sm:flex"
                            >
                              Update
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Order Info */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{selectedOrder.id}</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <Badge className={cn('capitalize text-sm px-3 py-1', getStatusColor(selectedOrder.status))}>
                    {selectedOrder.status}
                  </Badge>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  {(() => {
                    const user = getUser(selectedOrder.userId);
                    return user ? (
                      <Card>
                        <CardContent className="p-4">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-gray-500">Customer not found</p>
                    );
                  })()}
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h3>
                  {(() => {
                    const address = getAddress(selectedOrder.addressId);
                    return address ? (
                      <Card>
                        <CardContent className="p-4">
                          <p className="font-medium">{address.name}</p>
                          <p className="text-sm text-gray-600">{address.street}</p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-gray-500">Address not found</p>
                    );
                  })()}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {selectedOrder.items.map((item, idx) => {
                          const product = getProductById(item.productId);
                          const itemTotal = getDiscountedPrice(item.price, item.discount) * item.quantity;
                          return (
                            <div key={idx} className="flex items-center gap-4 p-4">
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {product?.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {product?.name || 'Unknown Product'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ${getDiscountedPrice(item.price, item.discount).toFixed(2)} x {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Order Summary
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">Total Amount</span>
                        <span className="font-bold text-xl text-emerald-600">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {selectedOrder && (
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  handleOpenStatusDialog(selectedOrder);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setNewStatus(option.value)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      newStatus === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', option.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={selectedOrder?.status === newStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
