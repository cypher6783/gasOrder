'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { vendorDashboardService } from '@/services/vendor-dashboard.service'
import { useAuthStore } from '@/store/auth'

export default function VendorOnboarding() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    latitude: '6.5244', // Default Lagos coords for now
    longitude: '3.3792',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await vendorDashboardService.createProfile({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      })
      router.push('/vendor/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Vendor Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us about your gas business to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="mt-1">
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  className="input w-full"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Lagos Gas Depot"
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                Business Address
              </label>
              <div className="mt-1">
                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  required
                  rows={3}
                  className="input w-full"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Street address, City, State"
                />
              </div>
            </div>

            {/* Hidden coordinates for now - in real app would use a map picker */}
            <input type="hidden" name="latitude" value={formData.latitude} />
            <input type="hidden" name="longitude" value={formData.longitude} />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2"
              >
                {loading ? 'Setting up...' : 'Start Selling'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
