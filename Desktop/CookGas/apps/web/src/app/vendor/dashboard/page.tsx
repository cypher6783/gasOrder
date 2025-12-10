'use client'

import { useEffect, useState } from 'react'
import { productService, Product } from '@/services/product.service'
import Link from 'next/link'
import { showAlert } from '@/lib/alert'

export default function VendorDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [gasSettings, setGasSettings] = useState<{ price: number; isActive: boolean; deliveryFee?: number } | null>(null)
  const [gasLoading, setGasLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  useEffect(() => {
    loadDashboardData()
    
    // Reload stats when page becomes visible (e.g., after updating an order)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadDashboardData = async () => {
    try {
      const { vendorService } = await import('@/services/vendor.service');
      const [productsData, gasData, statsData] = await Promise.all([
        productService.getMyProducts({ limit: 5 }),
        productService.getGasSettings(),
        vendorService.getStats()
      ])
      
      setProducts(productsData.products)
      setGasSettings(gasData)
      setStats(statsData)
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      const msg = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      // Only alert if it's not a "Vendor not found" error which might happen for new vendors
      if (!msg.includes('Vendor profile not found')) {
         showAlert.error(`Load Error: ${msg}`);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGasUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGasLoading(true)
    try {
      if (!gasSettings) return;
      const updated = await productService.updateGasSettings({
        price: gasSettings.price,
        inStock: gasSettings.isActive,
        deliveryFee: gasSettings.deliveryFee
      })
      setGasSettings(updated)
      setGasSettings(updated)
      alert('Gas settings updated successfully!')
    } catch (error: any) {
      console.error('Failed to update gas settings:', error)
      const msg = error.response?.data?.message || error.message || 'Failed to update settings';
      showAlert.error(`Error: ${msg}`);
    } finally {
      setGasLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Gas Settings Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Cooking Gas Settings</h2>
          <span className="text-sm text-gray-500">Manage your standardized gas product</span>
        </div>
        
        <form onSubmit={handleGasUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Kg (₦)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={gasSettings?.price || ''}
              onChange={(e) => setGasSettings(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) }) : { price: parseFloat(e.target.value), isActive: true, deliveryFee: 1000 })}
              className="input-field"
              placeholder="e.g. 1000"
              required
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Fee (₦)
             </label>
             <input
              type="number"
              min="0"
              step="0.01"
              value={gasSettings?.deliveryFee || ''}
              onChange={(e) => setGasSettings(prev => prev ? ({ ...prev, deliveryFee: parseFloat(e.target.value) }) : { price: 0, isActive: true, deliveryFee: parseFloat(e.target.value) })}
              className="input-field"
              placeholder="Default: 1000"
            />
          </div>

          <div className="flex items-center space-x-3 mb-2">
            <button
              type="button"
              onClick={() => setGasSettings(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : { price: 0, isActive: true, deliveryFee: 1000 })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                gasSettings?.isActive ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  gasSettings?.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {gasSettings?.isActive ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <button
            type="submit"
            disabled={gasLoading}
            className="btn-primary"
          >
            {gasLoading ? 'Saving...' : 'Update Settings'}
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Updated</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦{(stats?.totalSales || 0).toLocaleString()}</p>
        </div>
        <Link href="/vendor/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 block hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">All Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
        </Link>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">In Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Rating</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(stats?.rating || 0).toFixed(1)}</p>
        </div>
      </div>

      {/* Recent Activity / Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
          <Link href="/vendor/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">You haven't added any products yet.</p>
            <Link href="/vendor/products/new" className="btn-primary inline-block">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock} {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
