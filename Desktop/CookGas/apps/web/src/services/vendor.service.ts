import apiClient from '@/lib/api-client';

export interface Vendor {
  id: string;
  businessName: string;
  businessAddress: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalReviews: number;
  deliveryFee: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  _count?: {
    products: number;
    reviews: number;
    orders: number;
  };
}


export interface VendorFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'createdAt' | 'businessName';
  sortOrder?: 'asc' | 'desc';
}

export const vendorService = {
  async getVendors(filters: VendorFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/vendors?${params.toString()}`);
    return response.data.data;
  },

  async getVendorById(id: string) {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data.data;
  },

  async getVendorProducts(id: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/vendors/${id}/products?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async checkAvailability(id: string, latitude: number, longitude: number) {
    const response = await apiClient.post(`/vendors/${id}/check-availability`, {
      latitude,
      longitude,
    });
    return response.data.data;
  },

  async getMyProfile() {
    const response = await apiClient.get('/vendors/me/profile');
    return response.data.data;
  },

  async updateProfile(data: Partial<{
    businessName: string;
    businessAddress: string;
    latitude: number;
    longitude: number;
    deliveryFee: number;
  }>) {
    const response = await apiClient.put('/vendors/me/profile', data);
    return response.data.data;
  },

  async getStats() {
    const response = await apiClient.get('/vendors/me/stats');
    return response.data.data;
  },

  async createReview(vendorId: string, data: { rating: number; comment?: string }) {
    const response = await apiClient.post(`/vendors/${vendorId}/reviews`, data);
    return response.data.data;
  },
};
