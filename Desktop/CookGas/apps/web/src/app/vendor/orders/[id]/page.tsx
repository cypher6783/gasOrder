'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showAlert } from '@/lib/alert';
import { useParams } from 'next/navigation';
import { orderService } from '@/services/order.service';

export default function VendorOrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder(params.id as string);
    }
  }, [params.id]);

  const loadOrder = async (id: string) => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const confirmed = await showAlert.confirm(
      `Are you sure you want to update status to ${newStatus}?`,
      'Update Order Status'
    );
    if (!confirmed) return;
    
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(order.id, newStatus);
      await loadOrder(order.id); // Reload to show updates
      showAlert.success('Order status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      showAlert.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/vendor/orders" className="text-primary-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/vendor/orders" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          </div>
          <div className="flex gap-2">
            {order.status === 'PENDING' && (
                <button 
                    onClick={() => handleStatusUpdate('CONFIRMED')}
                    disabled={updating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    Confirm Order
                </button>
            )}
            {order.status === 'CONFIRMED' && (
                <button 
                    onClick={() => handleStatusUpdate('IN_TRANSIT')}
                    disabled={updating}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    Start Delivery
                </button>
            )}
            {order.status === 'IN_TRANSIT' && (
                <button 
                    onClick={() => handleStatusUpdate('DELIVERED')}
                    disabled={updating}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    Mark Delivered
                </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} {item.product.unit} x ₦{item.price}</p>
                    </div>
                    <p className="font-bold text-gray-900">₦{item.subtotal.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-primary-600">₦{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status Timeline (Simple) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
                <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                    </span>
                    <span className="ml-4 text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                    </span>
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-500 uppercase">Name</label>
                    <p className="font-medium">{order.customer?.user?.firstName} {order.customer?.user?.lastName}</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 uppercase">Phone</label>
                    <p className="font-medium">{order.customer?.user?.phone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Location</h2>
              <div className="space-y-1">
                <p className="font-medium">{order.address?.street}</p>
                <p className="text-gray-600">{order.address?.city}, {order.address?.state}</p>
                <p className="text-sm text-gray-400 mt-2">{order.address?.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
