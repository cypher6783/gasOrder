'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { adminApi, Vendor } from '@/services/admin.service'

type VendorStatus = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'

export default function VendorManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: authUser, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [activeTab, setActiveTab] = useState<VendorStatus>('PENDING')
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!isAuthenticated || !authUser) {
      router.push('/login')
      return
    }

    if (authUser.role !== 'ADMIN') {
      router.push('/customer/dashboard')
      return
    }

    // Get status from URL params
    const statusParam = searchParams.get('status') as VendorStatus
    if (statusParam && ['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(statusParam)) {
      setActiveTab(statusParam)
    }

    loadVendors(statusParam || activeTab)
  }, [mounted, isAuthenticated, authUser, router, searchParams])

  useEffect(() => {
    if (mounted && isAuthenticated && authUser?.role === 'ADMIN') {
      loadVendors(activeTab)
    }
  }, [activeTab])

  const loadVendors = async (status: VendorStatus) => {
    try {
      setLoading(true)
      setError('')
      
      const params = status === 'ALL' ? {} : { status }
      const data = await adminApi.getVendors(params)
      setVendors(data.vendors)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors')
      setLoading(false)
    }
  }

  const handleApprove = async (vendorId: string) => {
    try {
      setActionLoading(vendorId)
      await adminApi.approveVendor(vendorId)
      // Reload vendors
      await loadVendors(activeTab)
      setActionLoading(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve vendor')
      setActionLoading(null)
    }
  }

  const handleReject = async (vendorId: string) => {
    try {
      setActionLoading(vendorId)
      await adminApi.rejectVendor(vendorId)
      // Reload vendors
      await loadVendors(activeTab)
      setActionLoading(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject vendor')
      setActionLoading(null)
    }
  }

  const handleSuspend = async (vendorId: string) => {
    try {
      setActionLoading(vendorId)
      await adminApi.suspendVendor(vendorId)
      // Reload vendors
      await loadVendors(activeTab)
      setActionLoading(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to suspend vendor')
      setActionLoading(null)
    }
  }

  if (loading && !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 transition-colors">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 transition-colors">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {(['PENDING', 'VERIFIED', 'ALL', 'REJECTED', 'SUSPENDED'] as VendorStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  {tab === 'PENDING' && vendors.length > 0 && activeTab === 'PENDING' && (
                    <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-2 py-1 rounded-full">
                      {vendors.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Vendor List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>No vendors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{vendor.businessName}</h3>
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            vendor.status === 'VERIFIED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            vendor.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {vendor.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Contact Person</p>
                            <p className="break-words">{vendor.user.firstName} {vendor.user.lastName}</p>
                            <p className="break-words">{vendor.user.email}</p>
                            <p className="break-words">{vendor.user.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Business Address</p>
                            <p className="break-words">{vendor.businessAddress}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 break-words">
                              Lat: {vendor.latitude.toFixed(4)}, Lng: {vendor.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Products:</span> {vendor._count.products}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Orders:</span> {vendor._count.orders}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Rating:</span> {vendor.rating.toFixed(1)} ({vendor.totalReviews} reviews)
                          </div>
                        </div>

                        {(vendor.cacDocument || vendor.idDocument || vendor.proofOfAddress) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KYC Documents:</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              {vendor.cacDocument && (
                                <a href={vendor.cacDocument} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                                  CAC Document
                                </a>
                              )}
                              {vendor.idDocument && (
                                <a href={vendor.idDocument} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                                  ID Document
                                </a>
                              )}
                              {vendor.proofOfAddress && (
                                <a href={vendor.proofOfAddress} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                                  Proof of Address
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 md:ml-6">
                        {vendor.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              disabled={actionLoading === vendor.id}
                              className="btn-primary px-4 py-2 text-sm whitespace-nowrap flex-1 md:flex-none"
                            >
                              {actionLoading === vendor.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              disabled={actionLoading === vendor.id}
                              className="btn bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm whitespace-nowrap flex-1 md:flex-none"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {vendor.status === 'VERIFIED' && (
                          <button
                            onClick={() => handleSuspend(vendor.id)}
                            disabled={actionLoading === vendor.id}
                            className="btn bg-yellow-600 text-white hover:bg-yellow-700 px-4 py-2 text-sm whitespace-nowrap w-full md:w-auto"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
