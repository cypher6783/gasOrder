'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { productService } from '@/services/product.service'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    imageUrl: '',
    isActive: true
  })

  useEffect(() => {
    if (id) {
      loadProduct(id as string)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const product = await productService.getProductById(productId)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        unit: product.unit,
        imageUrl: product.imageUrl || '',
        isActive: product.isActive
      })
    } catch (err: any) {
      setError('Failed to load product details')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await productService.updateProduct(id as string, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      })
      router.push('/vendor/products')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/vendor/products" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Product Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>

          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input w-full h-32"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                className="input w-full"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                className="input w-full"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Unit</label>
            <select
              className="input w-full"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="kg">kg (Kilogram)</option>
              <option value="pcs">pcs (Pieces)</option>
              <option value="set">set</option>
              <option value="liter">liter</option>
            </select>
          </div>

          <div>
            <label className="label">Image URL (Optional)</label>
            <input
              type="url"
              className="input w-full"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <Link href="/vendor/products" className="btn-outline mr-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[120px]"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
