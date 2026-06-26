'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Don't show footer on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FreshMart</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your one-stop shop for fresh, organic vegetables and fruits delivered straight to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=vegetables" className="text-sm hover:text-emerald-400 transition-colors">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/products?category=fruits" className="text-sm hover:text-emerald-400 transition-colors">
                  Fruits
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-sm hover:text-emerald-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/profile?tab=orders" className="text-sm hover:text-emerald-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm hover:text-emerald-400 transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                <span className="text-sm">123 Fresh Street, Green City, FC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm">support@freshmart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {new Date().getFullYear()} FreshMart. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
