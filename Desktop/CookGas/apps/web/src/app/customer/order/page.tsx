'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService, Product } from '@/services/product.service';
import { customerService } from '@/services/customer.service';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import Link from 'next/link';
import { showAlert } from '@/lib/alert';

export default function OrderGasPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(12.5);
  const [addressId, setAddressId] = useState<string>('');
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, profileData] = await Promise.all([
        productService.getProducts({ search: 'Cooking Gas' }),
        customerService.getProfile()
      ]);

      const activeGasProducts = productsData.products.filter((p: Product) => p.isActive);
      setProducts(activeGasProducts);

      if (profileData.data.customer?.addresses?.length > 0) {
        setCustomerAddresses(profileData.data.customer.addresses);
        // Default to first address
        setAddressId(profileData.data.customer.addresses[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !addressId) {
        showAlert.warning('Please select a vendor and ensure you have a delivery address');
        return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        vendorId: selectedProduct.vendor.id,
        addressId: addressId,
        items: [{
          productId: selectedProduct.id,
          quantity: quantity
        }]
      });
      
      // Initiate Payment
      const payment = await paymentService.initiatePayment(order.id);
      
      // Redirect to Paystack
      window.location.href = payment.authorizationUrl;

    } catch (error) {
      console.error('Failed to place order:', error);
      showAlert.error('Failed to place order. Please try again.');
      setSubmitting(false); // Only stop submitting on error, otherwise we are redirecting
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Order Cooking Gas</h1>
            <Link href="/customer/dashboard" className="text-primary-600 hover:text-primary-700">
                Back to Dashboard
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendor Selection List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Available Vendors</h2>
            {products.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No vendors currently have gas in stock.
                </div>
            ) : (
                products.map((product) => (
                <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                        selectedProduct?.id === product.id 
                        ? 'border-primary-500 ring-2 ring-primary-100' 
                        : 'border-gray-100'
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{product.vendor.businessName}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {product.vendor.rating.toFixed(1)}
                                </span>
                                <span className="mx-2">•</span>
                                <span>₦{product.price.toLocaleString()} per kg</span>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                             selectedProduct?.id === product.id ? 'border-primary-600' : 'border-gray-300'
                        }`}>
                            {selectedProduct?.id === product.id && (
                                <div className="w-3 h-3 bg-primary-600 rounded-full" />
                            )}
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>

          {/* Order Summary / Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                
                {!selectedProduct ? (
                    <p className="text-gray-500 text-sm">Select a vendor to proceed.</p>
                ) : (
                    <form onSubmit={handleOrder} className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Selected Vendor</p>
                            <p className="font-medium text-gray-900">{selectedProduct.vendor.businessName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity (kg)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.5"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="input-field"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Price per kg</span>
                                <span className="font-medium">₦{selectedProduct.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-2">
                                <span>Total</span>
                                <span>₦{(selectedProduct.price * quantity).toLocaleString()}</span>
                            </div>
                        </div>

                         {/* Address Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Address
                            </label>
                            {customerAddresses.length > 0 ? (
                                <select
                                    value={addressId}
                                    onChange={(e) => setAddressId(e.target.value)}
                                    className="input-field"
                                >
                                    {customerAddresses.map((addr) => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.label} - {addr.street}, {addr.city}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    You have no saved addresses. Please add one in your profile.
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !addressId || quantity <= 0}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
