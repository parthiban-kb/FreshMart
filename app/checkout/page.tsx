"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscountedPrice } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addAddress, initializeAddresses } from "@/store/slices/addressesSlice";
import { initializeAuth } from "@/store/slices/authSlice";
import { clearCart, initializeCart } from "@/store/slices/cartSlice";
import { createOrder } from "@/store/slices/ordersSlice";
import { initializeProducts } from "@/store/slices/productsSlice";
import { Check, CreditCard, Loader2, MapPin, Plus, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAppSelector((state) => state.auth);
  const { items: cartItems, isLoading: cartLoading } = useAppSelector(
    (state) => state.cart,
  );
  const { items: products, isLoading: productsLoading } = useAppSelector(
    (state) => state.products,
  );
  const { items: addresses, isLoading: addressesLoading } = useAppSelector(
    (state) => state.addresses,
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
    dispatch(initializeProducts());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(initializeAddresses(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const isLoading =
    authLoading || cartLoading || productsLoading || addressesLoading;

  // Get cart items with product details
  const cartWithProducts = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        discountedPrice: getDiscountedPrice(product.price, product.discount),
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    product: (typeof products)[0];
    discountedPrice: number;
  }>;

  const subtotal = cartWithProducts.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  );
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleAddAddress = () => {
    if (!user?.id) return;

    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode
    ) {
      toast.error("Please fill in all address fields");
      return;
    }

    dispatch(
      addAddress({
        ...newAddress,
        userId: user.id,
        isDefault: addresses.length === 0,
      }),
    );

    setNewAddress({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setShowAddressDialog(false);
    toast.success("Address added successfully");
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) return;

    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cartWithProducts.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderItems = cartWithProducts.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      discount: item.product.discount,
    }));

    dispatch(
      createOrder({
        userId: user.id,
        items: orderItems,
        addressId: selectedAddressId,
        totalAmount: total,
        status: "pending",
        paymentMethod: "cod",
      }),
    );

    dispatch(clearCart());
    toast.success("Order placed successfully!");
    router.push("/profile?tab=orders");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cartWithProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No items to checkout
          </h1>
          <p className="text-gray-500 mb-6">
            Add items to your cart to proceed
          </p>
          <Button
            onClick={() => router.push("/products")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Delivery Address
                </CardTitle>
                <Dialog
                  open={showAddressDialog}
                  onOpenChange={setShowAddressDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              street: e.target.value,
                            })
                          }
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            placeholder="New York"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            placeholder="NY"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input
                            id="zipCode"
                            value={newAddress.zipCode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                zipCode: e.target.value,
                              })
                            }
                            placeholder="10001"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddAddress}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        Add Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No addresses saved. Add a delivery address to continue.
                  </p>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                          selectedAddressId === address.id
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={address.id}
                          className="mt-1"
                        />
                        <label
                          htmlFor={address.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.name}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {address.phone}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.zipCode}
                          </p>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-emerald-600 bg-emerald-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({cartWithProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartWithProducts.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.discountedPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span>₹{shipping.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span>${shipping.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
