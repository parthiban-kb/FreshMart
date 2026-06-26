'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockBanners } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mockBanners.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mockBanners.length) % mockBanners.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
        {mockBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-out",
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            )}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover"
              />
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r",
                banner.bgColor,
                "opacity-80"
              )} />
            </div>

            {/* Content */}
            <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-full flex-col justify-center max-w-xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
                  {banner.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8">
                  {banner.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="/products?category=vegetables">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/20 bg-transparent"
                    >
                      View Offers
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {mockBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
