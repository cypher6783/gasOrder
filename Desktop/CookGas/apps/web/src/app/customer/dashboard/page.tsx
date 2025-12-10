'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { orderService, Order } from '@/services/order.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Wait for component to mount and hydration to complete
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only check auth after component is mounted and hydration is complete
    if (!mounted) return;

    // Check if user is logged in using Zustand store
    if (!isAuthenticated || !authUser) {
      router.push('/login');
      return;
    }

    // Fetch recent orders
    const fetchRecentOrders = async () => {
        try {
            const data = await orderService.getMyOrders();
            // Assuming data.orders exists and is the array
             if (data && data.orders) {
                setRecentOrders(data.orders.slice(0, 3)); // Take top 3
            } else if (Array.isArray(data)) {
                 setRecentOrders(data.slice(0, 3));
            }
        } catch (error) {
            console.error('Failed to fetch recent orders', error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchRecentOrders();
  }, [mounted, isAuthenticated, authUser, router]);

  const handleLogout = () => {
    const { clearAuth } = useAuthStore.getState();
    clearAuth();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container-custom py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="btn-outline text-sm px-4 py-2"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Welcome Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Welcome back, {authUser?.firstName} {authUser?.lastName}!
          </h2>
          <p className="text-gray-600">
            Manage your gas orders and deliveries from your dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/customer/order" className="card hover:shadow-2xl transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold">New Order</h3>
            </div>
            <p className="text-gray-600">Order gas for delivery</p>
          </Link>

          <Link href="/customer/orders" className="card hover:shadow-2xl transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold">My Orders</h3>
            </div>
            <p className="text-gray-600">View order history</p>
          </Link>

          <Link href="/customer/profile" className="card hover:shadow-2xl transition-all text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold">Profile</h3>
            </div>
            <p className="text-gray-600">Manage your account</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{(order.totalAmount || (order.items.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) + (order.deliveryFee || 0))).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/customer/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                 <Link href="/customer/orders" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all orders &rarr;
                 </Link>
              </div>
            </div>
          ) : (
             <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No orders yet</p>
                <p className="text-sm mt-2">Start by placing your first gas order!</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
