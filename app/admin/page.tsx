'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Clock,
  CheckCircle,
  Truck,
  Box,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeProducts } from '@/store/slices/productsSlice';
import { initializeOrders } from '@/store/slices/ordersSlice';
import { getDiscountedPrice } from '@/data/mock-data';
import { getUsers, getProductById } from '@/lib/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { items: orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(initializeProducts());
    dispatch(initializeOrders());
  }, [dispatch]);

  const users = useMemo(() => getUsers(), []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // This month's revenue and orders
    const now = new Date();
    const thisMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Last month's data for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === lastMonth.getMonth() && orderDate.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate growth
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : thisMonthRevenue > 0 ? 100 : 0;

    const orderStatusCounts = {
      pending: orders.filter((o) => o.status === 'pending').length,
      packed: orders.filter((o) => o.status === 'packed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      thisMonthRevenue,
      thisMonthOrders: thisMonthOrders.length,
      revenueGrowth,
      totalUsers: users.filter(u => u.role === 'user').length,
      orderStatusCounts,
      lowStockProducts: products.filter((p) => p.stock > 0 && p.stock < 20).length,
      outOfStockProducts: products.filter((p) => p.stock === 0).length,
    };
  }, [products, orders, users]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };

  const topProducts = useMemo(() => {
    const productSales: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { count: 0, revenue: 0 };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].revenue += getDiscountedPrice(item.price, item.discount) * item.quantity;
      });
    });

    return Object.entries(productSales)
      .map(([productId, data]) => ({
        product: getProductById(productId),
        ...data,
      }))
      .filter((item) => item.product)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const ordersPerMonth = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = monthNames.map((name) => ({ name, orders: 0, revenue: 0 }));

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthIndex = date.getMonth();
      data[monthIndex].orders += 1;
      data[monthIndex].revenue += order.totalAmount;
    });

    // Show last 6 months
    const currentMonth = new Date().getMonth();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const index = (currentMonth - i + 12) % 12;
      result.push(data[index]);
    }
    return result;
  }, [orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'packed':
        return <Box className="h-3 w-3" />;
      case 'shipped':
        return <Truck className="h-3 w-3" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'packed':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const orderStatusData = useMemo(() => {
    const statusCounts = {
      pending: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
    };

    orders.forEach((order) => {
      statusCounts[order.status]++;
    });

    return [
      { name: 'Pending', value: statusCounts.pending },
      { name: 'Packed', value: statusCounts.packed },
      { name: 'Shipped', value: statusCounts.shipped },
      { name: 'Delivered', value: statusCounts.delivered },
    ].filter((item) => item.value > 0);
  }, [orders]);

  const categoryData = useMemo(() => {
    const categories = {
      vegetables: 0,
      fruits: 0,
    };

    products.forEach((product) => {
      categories[product.category]++;
    });

    return [
      { name: 'Vegetables', value: categories.vegetables },
      { name: 'Fruits', value: categories.fruits },
    ];
  }, [products]);

  const isLoading = productsLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                <div className="flex items-center gap-2 mt-2">
                  {stats.lowStockProducts > 0 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      {stats.lowStockProducts} low stock
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-gray-500">{stats.thisMonthOrders} this month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.thisMonthRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  {stats.revenueGrowth >= 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />
                      {stats.revenueGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <ArrowDownRight className="h-4 w-4" />
                      {Math.abs(stats.revenueGrowth).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Orders Per Month */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>Monthly order statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersPerMonth}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status and Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status Distribution */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No orders yet
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {orderStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      <Badge className={cn('capitalize flex items-center gap-1', getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Category Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </div>
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Package className="h-12 w-12 mb-3 text-gray-300" />
                <p>No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div
                    key={item.product?.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-gray-400 w-6">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">{item.count} sold</p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600">${item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Inventory distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">
                  Vegetables ({categoryData[0]?.value || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">
                  Fruits ({categoryData[1]?.value || 0})
                </span>
              </div>
            </div>
            {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
              <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Inventory Alerts</h4>
                <div className="space-y-1 text-sm">
                  {stats.lowStockProducts > 0 && (
                    <p className="text-amber-700">{stats.lowStockProducts} products running low on stock</p>
                  )}
                  {stats.outOfStockProducts > 0 && (
                    <p className="text-red-700">{stats.outOfStockProducts} products out of stock</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
