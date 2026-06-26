'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, MapPin, Package, Edit2, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, updateProfile } from '@/store/slices/authSlice';
import { initializeAddresses, addAddress, updateAddress, deleteAddress } from '@/store/slices/addressesSlice';
import { initializeOrders } from '@/store/slices/ordersSlice';
import { initializeProducts } from '@/store/slices/productsSlice';
import { Address, OrderStatus } from '@/types';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  packed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
};

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { items: addresses, isLoading: addressesLoading } = useAppSelector((state) => state.addresses);
  const { items: orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(initializeAddresses(user.id));
      dispatch(initializeOrders(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, phone: user.phone });
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'addresses') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  const isLoading = authLoading || addressesLoading || ordersLoading || productsLoading;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    dispatch(updateProfile(profileForm));
    setIsEditingProfile(false);
    setIsSaving(false);
    toast.success('Profile updated successfully');
  };

  const handleSaveAddress = () => {
    if (!user?.id) return;

    if (!addressForm.name || !addressForm.phone || !addressForm.street ||
        !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingAddress) {
      dispatch(updateAddress({ id: editingAddress.id, updates: addressForm }));
      toast.success('Address updated successfully');
    } else {
      dispatch(addAddress({ ...addressForm, userId: user.id }));
      toast.success('Address added successfully');
    }

    setShowAddressDialog(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    dispatch(deleteAddress(addressId));
    toast.success('Address deleted successfully');
  };

  const getProductDetails = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} disabled className="bg-gray-50" />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{user.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Delivery Addresses</CardTitle>
                <Dialog open={showAddressDialog} onOpenChange={(open) => {
                  setShowAddressDialog(open);
                  if (!open) {
                    setEditingAddress(null);
                    setAddressForm({
                      name: '',
                      phone: '',
                      street: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      isDefault: false,
                    });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                      <DialogDescription>
                        {editingAddress ? 'Update your delivery address details.' : 'Add a new delivery address to your account.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addr-name">Full Name</Label>
                          <Input
                            id="addr-name"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addr-phone">Phone</Label>
                          <Input
                            id="addr-phone"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addr-street">Street Address</Label>
                        <Input
                          id="addr-street"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addr-city">City</Label>
                          <Input
                            id="addr-city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder="New York"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addr-state">State</Label>
                          <Input
                            id="addr-state"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            placeholder="NY"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addr-zip">Zip Code</Label>
                          <Input
                            id="addr-zip"
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveAddress} className="bg-emerald-600 hover:bg-emerald-700">
                        {editingAddress ? 'Update Address' : 'Add Address'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{address.name}</span>
                            {address.isDefault && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.street}, {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this address? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-mono text-sm">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="text-sm">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <Badge className={cn('capitalize', orderStatusColors[order.status])}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium mb-2">Items</p>
                            <div className="space-y-2">
                              {order.items.map((item, index) => {
                                const product = getProductDetails(item.productId);
                                return (
                                  <div key={index} className="flex items-center gap-3">
                                    {product && (
                                      <>
                                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm truncate">{product.name}</p>
                                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium">
                                          ${(getDiscountedPrice(item.price, item.discount) * item.quantity).toFixed(2)}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
