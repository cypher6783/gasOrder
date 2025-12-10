'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth'

export default function VendorRegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessAddress: '',
    latitude: '',
    longitude: '',
    cacDocument: '',
    idDocument: '',
    proofOfAddress: '',
    role: 'VENDOR' as const,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!formData.businessName || !formData.businessAddress) {
      setError('Business name and address are required')
      return
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Business location (latitude and longitude) is required')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      
      // Convert latitude and longitude to numbers
      const dataToSend = {
        ...registerData,
        latitude: parseFloat(registerData.latitude),
        longitude: parseFloat(registerData.longitude),
        // Only include KYC documents if they're not empty
        cacDocument: registerData.cacDocument || undefined,
        idDocument: registerData.idDocument || undefined,
        proofOfAddress: registerData.proofOfAddress || undefined,
      }

      const response = await authApi.register(dataToSend)
      setAuth(response.user, response.accessToken, response.refreshToken)
      
      // Delay redirect slightly to allow state to settle
      setTimeout(() => {
        // Redirect to vendor onboarding
        window.location.href = '/vendor/onboarding'
      }, 100)
      
      // Don't set loading to false - we're navigating away
      return
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
            <span className="text-3xl font-bold text-gradient">Jupitra</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Become a Vendor</h1>
          <p className="text-gray-600 mt-2">Join our platform and start selling gas</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="input"
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., ABC Gas Supplies"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <textarea
                  id="businessAddress"
                  required
                  rows={3}
                  className="input"
                  placeholder="Full business address"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    required
                    className="input"
                    placeholder="e.g., 6.5244"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    required
                    className="input"
                    placeholder="e.g., 3.3792"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* KYC Documents (Optional) */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">KYC Documents (Optional)</h2>
              <p className="text-sm text-gray-600 mb-4">
                You can upload these documents later. Providing them now speeds up verification.
              </p>
              
              <div>
                <label htmlFor="cacDocument" className="block text-sm font-medium text-gray-700 mb-2">
                  CAC Document URL
                </label>
                <input
                  id="cacDocument"
                  type="url"
                  className="input"
                  placeholder="https://example.com/cac-document.pdf"
                  value={formData.cacDocument}
                  onChange={(e) => setFormData({ ...formData, cacDocument: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="idDocument" className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document URL
                </label>
                <input
                  id="idDocument"
                  type="url"
                  className="input"
                  placeholder="https://example.com/id-document.pdf"
                  value={formData.idDocument}
                  onChange={(e) => setFormData({ ...formData, idDocument: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="proofOfAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Proof of Address URL
                </label>
                <input
                  id="proofOfAddress"
                  type="url"
                  className="input"
                  placeholder="https://example.com/proof-of-address.pdf"
                  value={formData.proofOfAddress}
                  onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? 'Creating account...' : 'Create Vendor Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
