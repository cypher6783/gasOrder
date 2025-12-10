import apiClient from '@/lib/api-client';

export const customerService = {
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: {
    firstName: string;
    lastName: string;
    phone: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country?: string;
        isDefault?: boolean;
    };
  }) {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
};
