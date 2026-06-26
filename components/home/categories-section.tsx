'use client';

import Link from 'next/link';
import { Carrot, Apple } from 'lucide-react';

const categories = [
  {
    name: 'Vegetables',
    slug: 'vegetables',
    icon: Carrot,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
    description: 'Fresh, organic vegetables picked at peak ripeness',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    icon: Apple,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop',
    description: 'Sweet, juicy fruits bursting with natural flavor',
    color: 'from-orange-500 to-red-600',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shop by Category
          </h2>
          <p className="mt-2 text-gray-500">
            Browse our fresh selection of vegetables and fruits
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[16/9] sm:aspect-[2/1]"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-75`} />
                <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-white/90 max-w-xs">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-white font-medium">
                    Shop Now
                    <svg
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
