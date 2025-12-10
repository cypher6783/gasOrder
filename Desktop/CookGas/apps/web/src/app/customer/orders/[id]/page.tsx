'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderService, Order } from '@/services/order.service';
import { useAuthStore } from '@/store/auth';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<any | null>(null); // TODO: Update Order interface to include full address
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [isAuthenticated, params.id, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(params.id);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load order details.';
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = await showAlert.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order'
    );
    if (!confirmed) return;
    
    try {
      setCancelling(true);
      await orderService.cancelOrder(params.id); // Assuming cancelOrder takes just ID, customer checked on backend
      showAlert.success('Order cancelled successfully.');
      fetchOrder(); // Refresh data
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showAlert.error(`Error: ${msg}`);
    } finally {
      setCancelling(false);
    }
  };

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);
    try {
      // Dynamically import vendorService to avoid circular deps if any, or just import it normally at top
      const { vendorService } = await import('@/services/vendor.service');
      await vendorService.createReview(order.vendorId, { rating, comment });
      showAlert.success('Review submitted successfully!');
      setShowRatingModal(false);
    } catch (err: any) {
        console.error('Failed to submit review:', err);
         const msg = err.response?.data?.message || err.message || 'Failed to submit review';
         showAlert.error(`Error: ${msg}`);
    } finally {
        setIsSubmittingReview(false);
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
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

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
        <Link href="/customer/orders" className="btn-secondary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow mb-8">
        <div className="container-custom py-4">
           <Link href="/customer/orders" className="text-gray-500 hover:text-primary-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Orders
            </Link>
        </div>
      </header>

      <main className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h1>
            <p className="text-gray-500">#{order.id}</p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(order.status)}
            {order.status === 'PENDING' && (
              <button 
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                   <div key={item.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            {item.product.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-lg"/>
                            ) : 'No Img'}
                         </div>
                         <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                             <p className="text-sm text-gray-500">{item.product.unit}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm text-gray-500">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                         <p className="font-medium">₦{item.subtotal.toLocaleString()}</p>
                      </div>
                   </div>
                ))}
              </div>
            </div>

            {/* Vendor & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Vendor</h3>
                    <p className="font-semibold text-gray-900">{order.vendor.businessName}</p>
                    <p className="text-gray-600">{order.vendor.businessAddress}</p>
                    {order.vendor.user?.phone && (
                        <p className="text-primary-600 mt-2">{order.vendor.user.phone}</p>
                    )}
                </div>
                
                 <div className="card">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Delivery Address</h3>
                    {order.address ? (
                         <>
                            <p className="text-gray-900">{order.address.address}</p>
                            {order.address.city && <p className="text-gray-600">{order.address.city}, {order.address.state}</p>}
                         </>
                    ) : (
                        <p className="text-gray-500 italic">No delivery address recorded.</p>
                    )}
                </div>
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="space-y-6">
             <div className="card bg-gray-50">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{(order.subtotal || order.items.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee</span>
                        <span>{order.deliveryFee ? `₦${order.deliveryFee.toLocaleString()}` : "Free"}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                        <span>Total</span>
                        <span>₦{(order.totalAmount || (order.items.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) + (order.deliveryFee || 0))).toLocaleString()}</span>
                    </div>
                </div>
             </div>

             <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
                <p className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
             </div>
             
             {order.status === 'DELIVERED' && (
                 <button 
                    onClick={() => setShowRatingModal(true)}
                    className="w-full btn-primary bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white"
                 >
                    Rate Vendor
                 </button>
             )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Rate this Order</h3>
                    <button onClick={() => setShowRatingModal(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            rows={3}
                            placeholder="Share your experience..."
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowRatingModal(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
