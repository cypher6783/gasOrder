'use client';

import { useEffect, useState } from 'react';
import { vendorService, Vendor } from '@/services/vendor.service';
import { useRouter } from 'next/navigation';

export default function VendorSettingsPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    deliveryFee: '0',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getMyProfile();
      setVendor(data);
      setFormData({
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        deliveryFee: data.deliveryFee.toString(),
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
      });
    } catch (err: any) {
        console.error('Failed to load profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile information.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await vendorService.updateProfile({
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        deliveryFee: parseFloat(formData.deliveryFee),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      
      // Refresh profile data in background
      const updated = await vendorService.getMyProfile();
      setVendor(updated);

    } catch (err: any) {
      console.error('Failed to update settings:', err);
      const msg = err.response?.data?.message || 'Failed to update settings';
      setMessage({ type: 'error', text: msg });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vendor Settings</h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            
            {/* General Info */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Business Information
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Address</label>
                        <textarea
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Delivery Settings */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Delivery Settings
                </h2>
                
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Delivery Fee (₦)</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">₦</span>
                            <input
                                type="number"
                                name="deliveryFee"
                                value={formData.deliveryFee}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This fee applies to all local orders.</p>
                    </div>

                     {/* Location Coords (Hidden or Advanced?) - Let's keep them editable for now or hide? 
                        Ideally user sets address and we geocode. But existing impl seems to store lat/long directly.
                        For simplicity, I will allow editing but maybe warn? Or just keep them as is.
                     */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                             <input
                                type="number"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                step="any"
                                required
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                             <input
                                type="number"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                step="any"
                                required
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Location coordinates are used for customer distance calculation.</p>
                </div>
            </div>

            {/* Read Only Info */}
             <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Account Status
                </h2>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${vendor?.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                              vendor?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {vendor?.status}
                        </span>
                    </div>
                    <div>
                         <span className="block text-gray-500 dark:text-gray-400">Rating</span>
                         <span className="font-medium text-yellow-600">★ {vendor?.rating.toFixed(1)}</span>
                         <span className="text-gray-400 text-xs ml-1">({vendor?.totalReviews} reviews)</span>
                    </div>
                 </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                >
                    {saving ? 'Saving Changes...' : 'Save Settings'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
