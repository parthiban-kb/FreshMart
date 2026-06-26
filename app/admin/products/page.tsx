'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Filter,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  initializeProducts,
  addNewProduct,
  updateExistingProduct,
  removeProduct,
} from '@/store/slices/productsSlice';
import { Product } from '@/types';
import { getDiscountedPrice } from '@/data/mock-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  category: 'vegetables',
  price: 0,
  discount: 0,
  image: '',
  stock: 0,
  description: '',
  weight: '',
  isAvailable: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, isLoading } = useAppSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetables' | 'fruits'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);

  useEffect(() => {
    dispatch(initializeProducts());
  }, [dispatch]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'inStock' && product.stock > 0) ||
      (stockFilter === 'outOfStock' && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        discount: product.discount,
        image: product.image,
        stock: product.stock,
        description: product.description,
        weight: product.weight,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyProduct);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.image || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingProduct) {
      dispatch(
        updateExistingProduct({
          productId: editingProduct.id,
          updates: formData,
        })
      );
      toast.success('Product updated successfully');
    } else {
      dispatch(addNewProduct(formData));
      toast.success('Product added successfully');
    }
    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingProduct) {
      dispatch(removeProduct(deletingProduct.id));
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="inStock">In Stock</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first product to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Product</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden md:table-cell">Category</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Price</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden lg:table-cell">Stock</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 hidden sm:table-cell">Status</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            ₹{getDiscountedPrice(product.price, product.discount).toFixed(2)}
                          </p>
                          {product.discount > 0 && (
                            <p className="text-sm text-gray-500 line-through">₹{product.price.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <span
                          className={cn(
                            'font-medium',
                            product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-amber-600' : 'text-gray-900'
                          )}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <Badge
                          className={cn(
                            product.isAvailable
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-100 text-red-700 hover:bg-red-100'
                          )}
                        >
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                            className="hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(product)}
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Organic Tomatoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as Product['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight/Quantity</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 500g, 1kg, 3 pieces"
                  />
                </div>
              </div>

                <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount || ''}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-gray-100 mt-2">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(v) => setFormData({ ...formData, isAvailable: v })}
                  />
                  <Label htmlFor="isAvailable" className="cursor-pointer">
                    Available for sale
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(v) => setFormData({ ...formData, isFeatured: v })}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured product
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
