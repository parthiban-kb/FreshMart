'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Minus, Plus, ChevronRight, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeProducts } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const productId = params.id as string;

  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { items: cartItems } = useAppSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    dispatch(initializeProducts());
  }, [dispatch]);

  const product = products.find((p) => p.id === productId);
  const isInWishlist = wishlistItems.some((item) => item.productId === productId);
  const cartItem = cartItems.find((item) => item.productId === productId);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you are looking for does not exist.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product.price, product.discount);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.stock)));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    dispatch(addToCart({ productId: product.id, quantity }));
    toast.success(`${product.name} added to cart`);
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity }));
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    dispatch(toggleWishlist(product.id));
    if (isInWishlist) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-emerald-600">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-emerald-600 capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {!imageError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Discount Badge */}
            {product.discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white text-sm px-3 py-1">
                -{product.discount}% OFF
              </Badge>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'absolute top-4 right-4 p-3 rounded-full transition-all duration-200',
                'bg-white shadow-md hover:shadow-lg',
                isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
            </button>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex-1">
              <p className="text-emerald-600 font-medium uppercase tracking-wide text-sm mb-2">
                {product.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{discountedPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
                {product.discount > 0 && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Save ₹{(product.price - discountedPrice).toFixed(2)}
                  </Badge>
                )}
              </div>

              <Separator className="my-6" />

              {/* Product Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 w-24">Weight:</span>
                  <span className="font-medium">{product.weight}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 w-24">Availability:</span>
                  {product.isAvailable ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      In Stock ({product.stock} available)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

              {/* Quantity Selector */}
              {product.isAvailable && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-500">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {cartItem && (
                    <span className="text-sm text-gray-500">
                      ({cartItem.quantity} in cart)
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || isAddingToCart}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.isAvailable}
                  variant="outline"
                  className="flex-1 h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 pt-8 border-t grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3">
                <Truck className="h-6 w-6 text-emerald-600 mb-2" />
                <span className="text-xs text-gray-500">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <Shield className="h-6 w-6 text-emerald-600 mb-2" />
                <span className="text-xs text-gray-500">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <RotateCcw className="h-6 w-6 text-emerald-600 mb-2" />
                <span className="text-xs text-gray-500">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
