'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container-custom py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-2xl font-bold text-gradient">Jupitra</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              Login
            </Link>
            <Link href="/register" className="btn-primary px-6 py-2">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container-custom py-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            <span className="text-gradient">Gas Delivery</span>
            <br />
            Made Simple
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Order cooking gas from verified vendors near you. Fast delivery, secure payments, and real-time tracking.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register" className="btn-primary px-8 py-4 text-lg">
              Order Now
            </Link>
            <Link href="/vendor/register" className="btn-outline px-8 py-4 text-lg">
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="card text-center animate-slide-up">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Find Vendors Nearby</h3>
            <p className="text-gray-600 dark:text-gray-300">Discover verified gas vendors in your area with real-time availability</p>
          </div>

          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-300">Pay safely with escrow protection and multiple payment options</p>
          </div>

          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-300">Track your order in real-time and get gas delivered within hours</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-custom py-12 mt-24 border-t dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Jupitra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
