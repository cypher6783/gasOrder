'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showAlert } from '@/lib/alert';
import { useRouter } from 'next/navigation';
import { orderService, Order } from '@/services/order.service';
import { useAuthStore } from '@/store/auth';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data.orders); // Assuming response structure { orders: [], total: ... } based on typical pagination
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = await showAlert.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order'
    );
    if (!confirmed) return;
    
    try {
      await orderService.cancelOrder(orderId);
      // Refresh orders list locally or refetch
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      showAlert.success('Order cancelled successfully.');
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showAlert.error(`Error: ${msg}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
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
            <div className="flex items-center gap-4">
                <Link href="/customer/dashboard" className="text-gray-500 hover:text-primary-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start by placing your first gas order.</p>
            <Link href="/customer/order" className="btn-primary">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-primary-600">₦{(order.totalAmount || (order.items.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) + (order.deliveryFee || 0))).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{order.vendor.businessName}</p>
                        {order.vendor.phone && <p className="text-sm text-gray-500">{order.vendor.phone}</p>}
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 rounded px-3 py-1 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <Link href={`/customer/orders/${order.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium border border-primary-200 rounded px-3 py-1 hover:bg-primary-50 transition-colors">
                            View Details
                        </Link>
                      </div>
                   </div>
                   
                   <div className="mt-2 space-y-1">
                      {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-gray-600">
                              <span>{item.quantity}x {item.product.name} ({item.product.unit})</span>
                              <span>₦{(item.subtotal || 0).toLocaleString()}</span>
                          </div>
                      ))}
                      <div className="flex justify-between text-sm text-gray-500 mt-1 pt-1 border-t border-dashed border-gray-100">
                          <span>Delivery Fee</span>
                          <span>{order.deliveryFee ? `₦${order.deliveryFee.toLocaleString()}` : "Free"}</span>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
