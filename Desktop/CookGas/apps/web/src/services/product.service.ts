import apiClient from '@/lib/api-client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  vendor: {
    id: string;
    businessName: string;
    rating: number;
    deliveryFee: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ProductFilters {
  vendorId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data.data;
  },

  async getMyProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/products/my-products?${params.toString()}`);
    return response.data.data;
  },

  async getProductById(id: string) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    unit: string;
    imageUrl?: string;
  }) {
    const response = await apiClient.post('/products', data);
    return response.data.data;
  },

  async updateProduct(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    unit: string;
    imageUrl: string;
    isActive: boolean;
  }>) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data.data;
  },

  async getGasSettings() {
    try {
        const response = await apiClient.get(`/products/gas/settings?t=${new Date().getTime()}`);
        return response.data.data;
    } catch (error) {
        console.error('getGasSettings error:', error);
        throw error; // Let the caller handle/alert it
    }
  },

  async updateGasSettings(data: { price: number; inStock: boolean; deliveryFee?: number }) {
    try {
      const response = await apiClient.post('/products/gas/settings', data);
      return response.data.data;
    } catch (error) {
      console.error('updateGasSettings error:', error);
      throw error;
    }
  },
};
