import { apiClient } from '@/lib/api-client'

export interface CreateVendorProfileData {
  businessName: string;
  businessAddress: string;
  latitude: number;
  longitude: number;
  cacDocument?: string;
  idDocument?: string;
  proofOfAddress?: string;
}

export const vendorDashboardService = {
  // Create vendor profile
  async createProfile(data: CreateVendorProfileData) {
    const response = await apiClient.post('/vendors/me/profile', data);
    return response.data.data;
  },

  // Get vendor profile
  async getProfile() {
    const response = await apiClient.get('/vendors/me/profile');
    return response.data.data;
  },

  // Update vendor profile
  async updateProfile(data: Partial<CreateVendorProfileData>) {
    const response = await apiClient.put('/vendors/me/profile', data);
    return response.data.data;
  },
};
