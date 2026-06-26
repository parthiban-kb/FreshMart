'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { initializeCart, removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import { initializeProducts } from '@/store/slices/productsSlice';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { items: cartItems, isLoading: cartLoading } = useAppSelector((state) => state.cart);
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
    dispatch(initializeProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [authLoading, isAuthenticated, router]);

  const isLoading = authLoading || cartLoading || productsLoading;

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
    0
  );
  const totalItems = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
      toast.success('Item removed from cart');
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
    toast.success('Item removed from cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-80 rounded-lg" />
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
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">
            {"Looks like you haven't added any items yet"}
          </p>
          <Link href="/products">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartWithProducts.map((item) => (
              <Card key={item.productId} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.productId}`} className="shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{item.product.weight}</p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-gray-900">
                          ₹{item.discountedPrice.toFixed(2)}
                        </span>
                        {item.product.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{item.product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Line Total (Desktop) */}
                    <div className="hidden sm:block text-right">
                      <span className="font-bold text-gray-900">
                        ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({totalItems})</span>
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
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over ₹50
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <Link href="/checkout" className="block mt-6">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link
                  href="/products"
                  className="block text-center text-sm text-emerald-600 hover:text-emerald-700 mt-4"
                >
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
