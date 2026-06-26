'use client';

import { Truck, Shield, Leaf, Clock } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free shipping on orders over ₹50',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Safe and secure payment methods',
  },
  {
    icon: Leaf,
    title: '100% Organic',
    description: 'Certified organic produce',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Delivery within 24 hours',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
