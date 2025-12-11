'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerService } from '@/services/customer.service';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { showAlert } from '@/lib/alert';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  
  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: 'Lagos',
    state: 'Lagos',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await customerService.getProfile();
      const userData = response.data;
      
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
      });

      if (userData.customer?.addresses) {
        setAddresses(userData.customer.addresses);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerService.updateProfile(formData);
      showAlert.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showAlert.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await customerService.updateProfile({
        ...formData,
        address: {
            ...newAddress,
            country: 'Nigeria',
            isDefault: addresses.length === 0 // Make default if it's the first one
        }
      });
      
      const userData = response.data;
      if (userData.customer?.addresses) {
        setAddresses(userData.customer.addresses);
      }
      
      setShowAddressForm(false);
      setNewAddress({ street: '', city: 'Lagos', state: 'Lagos' });
      showAlert.success('Address added successfully');
    } catch (error) {
      console.error('Failed to add address:', error);
      showAlert.error('Failed to add address');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="container-custom">
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <Link href="/customer/dashboard" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Back to Dashboard
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="+234..."
                />
              </div>
              <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary w-full disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Addresses */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Addresses</h2>
                <button 
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                    {showAddressForm ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Add New Address</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Street Address</label>
                            <input
                                type="text"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                                className="input-field text-sm"
                                placeholder="e.g. 123 Main St"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                                <input
                                    type="text"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                    className="input-field text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">State</label>
                                <input
                                    type="text"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                    className="input-field text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="btn-primary w-full text-sm py-2 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {addresses.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No addresses saved yet.</p>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{addr.street}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{addr.city}, {addr.state}</p>
                            </div>
                            {addr.isDefault && (
                                <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">Default</span>
                            )}
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
