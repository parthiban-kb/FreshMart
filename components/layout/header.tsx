'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Heart, User, Menu, X, Search, Leaf, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, logout } from '@/store/slices/authSlice';
import { initializeCart } from '@/store/slices/cartSlice';
import { initializeWishlist } from '@/store/slices/wishlistSlice';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { items: cartItems, isLoading: cartLoading } = useAppSelector((state) => state.cart);
  const { items: wishlistItems, isLoading: wishlistLoading } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
    dispatch(initializeWishlist());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/products?category=vegetables', label: 'Vegetables' },
    { href: '/products?category=fruits', label: 'Fruits' },
  ];

  const isAdmin = user?.role === 'admin';
  const isAdminPage = pathname?.startsWith('/admin');

  // Don't show main header on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">FreshMart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.href
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link href={isAuthenticated ? '/wishlist' : '/login?redirect=/wishlist'}>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {!wishlistLoading && wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-emerald-600">
                    {wishlistCount}
                  </Badge>
                )}
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href={isAuthenticated ? '/cart' : '/login?redirect=/cart'}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {!cartLoading && cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-emerald-600">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {/* User Menu */}
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=orders" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                    FreshMart
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === link.href
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth */}
                  {!authLoading && !isAuthenticated && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                      >
                        My Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="justify-start text-red-600"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
