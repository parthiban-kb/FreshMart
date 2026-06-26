'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { initializeWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { initializeProducts } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { items: wishlistItems, isLoading: wishlistLoading } = useAppSelector((state) => state.wishlist);
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeWishlist());
    dispatch(initializeProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/wishlist');
    }
  }, [authLoading, isAuthenticated, router]);

  const isLoading = authLoading || wishlistLoading || productsLoading;

  // Get wishlist items with product details
  const wishlistWithProducts = wishlistItems
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
    addedAt: string;
    product: (typeof products)[0];
    discountedPrice: number;
  }>;

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  const handleMoveToCart = (productId: string) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    dispatch(removeFromWishlist(productId));
    toast.success('Moved to cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (wishlistWithProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
          <p className="text-gray-500 mb-6">
            Save items you love by clicking the heart icon
          </p>
          <Link href="/products">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{wishlistWithProducts.length} items saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistWithProducts.map((item) => (
            <Card key={item.productId} className="overflow-hidden group">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link href={`/products/${item.productId}`}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {item.product.discount > 0 && (
                  <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
                    -{item.product.discount}%
                  </Badge>
                )}

                {!item.product.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-white text-gray-900">
                      Out of Stock
                    </Badge>
                  </div>
                )}

                <button
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-4">
                <Link href={`/products/${item.productId}`}>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">
                    {item.product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mt-1">{item.product.weight}</p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-gray-900">
                    ${item.discountedPrice.toFixed(2)}
                  </span>
                  {item.product.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      ${item.product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleMoveToCart(item.productId)}
                  disabled={!item.product.isAvailable}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
