'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { productService } from '@/services/product.service'
import Link from 'next/link'

export default function CreateProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    imageUrl: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await productService.createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      })
      router.push('/vendor/products')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/vendor/products" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
          ← Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 12.5kg Gas Cylinder"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input w-full h-32"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product..."
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
                placeholder="0.00"
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
                placeholder="0"
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
              placeholder="https://..."
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
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
