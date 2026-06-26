'use client';

import Link from 'next/link';
import { ChevronRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Animated 404 heading */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="text-9xl sm:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500 animate-bounce" style={{ animationDuration: '3s' }}>
              404
            </div>
            {/* Floating accent elements */}
            <div className="absolute -top-8 -right-12 w-20 h-20 border-2 border-emerald-300 rounded-full animate-float opacity-30" />
            <div className="absolute -bottom-4 -left-8 w-16 h-16 border-2 border-emerald-200 rounded-lg animate-float opacity-20" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Heading text */}
        <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Description */}
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-500 mb-6">
            Don&apos;t worry, let&apos;s get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/">
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full sm:w-auto border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Helpful suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          {[
            { title: 'Browse Products', href: '/products', icon: '🛍️' },
            { title: 'View Cart', href: '/cart', icon: '🛒' },
            { title: 'Your Account', href: '/profile', icon: '👤' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer text */}
        <div className="text-center mt-12 text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <p>
            Need help? Contact us or visit our{' '}
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              home page
            </Link>
          </p>
        </div>
      </div>

      {/* Floating particles effect */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
