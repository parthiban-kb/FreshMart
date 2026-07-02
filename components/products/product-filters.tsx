'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductFilters } from '@/types';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  maxPrice: number;
}

function FilterContent({ filters, onFiltersChange, maxPrice }: ProductFiltersProps) {
  const handleCategoryChange = (category: ProductFilters['category']) => {
    onFiltersChange({ ...filters, category });
  };

  const handleAvailabilityChange = (availability: ProductFilters['availability']) => {
    onFiltersChange({ ...filters, availability });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleDiscountChange = (discount: number) => {
    onFiltersChange({ ...filters, discount: filters.discount === discount ? 0 : discount });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      priceRange: [0, maxPrice],
      discount: 0,
      availability: 'all',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.discount > 0 ||
    filters.availability !== 'all' ||
    filters.search !== '';

  return (
    <div className="space-y-6 space-x-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'discount', 'availability']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {(['all', 'vegetables', 'fruits'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    filters.category === category
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={[filters.priceRange[0], filters.priceRange[1]]}
                max={maxPrice}
                step={0.5}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>₹{filters.priceRange[0].toFixed(2)}</span>
                <span>₹{filters.priceRange[1].toFixed(2)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Discount Filter */}
        <AccordionItem value="discount">
          <AccordionTrigger className="text-sm font-medium">Discount</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[10, 15, 20, 25].map((discount) => (
                <div key={discount} className="flex items-center space-x-2">
                  <Checkbox
                    id={`discount-${discount}`}
                    checked={filters.discount === discount}
                    onCheckedChange={() => handleDiscountChange(discount)}
                  />
                  <label
                    htmlFor={`discount-${discount}`}
                    className="text-sm cursor-pointer"
                  >
                    {discount}% or more
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-medium">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {(['all', 'available', 'unavailable'] as const).map((availability) => (
                <button
                  key={availability}
                  onClick={() => handleAvailabilityChange(availability)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    filters.availability === availability
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
                  )}
                >
                  {availability === 'all'
                    ? 'All Products'
                    : availability === 'available'
                    ? 'In Stock'
                    : 'Out of Stock'}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

export function ProductFiltersComponent({ filters, onFiltersChange, maxPrice }: ProductFiltersProps) {
  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} maxPrice={maxPrice} />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent filters={filters} onFiltersChange={onFiltersChange} maxPrice={maxPrice} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
