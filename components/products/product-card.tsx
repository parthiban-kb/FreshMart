'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { getDiscountedPrice } from '@/data/mock-data';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const isInWishlist = wishlistItems.some(item => item.productId === product.id);
  const discountedPrice = getDiscountedPrice(product.price, product.discount);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    setIsAddingToCart(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    toast.success(`${product.name} added to cart`);
    setIsAddingToCart(false);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.id}`);
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
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-sm">No image</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
              -{product.discount}%
            </Badge>
          )}

          {/* Out of Stock Badge */}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-gray-900">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
              "bg-white/90 hover:bg-white shadow-sm hover:shadow-md",
              isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
          </button>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || isAddingToCart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              size="sm"
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
              {product.category}
            </p>
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500">{product.weight}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
