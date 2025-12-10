import apiClient from '../lib/api-client';

export interface DashboardStats {
  vendors: {
    total: number;
    pending: number;
    verified: number;
  };
  customers: number;
  orders: number;
  products: number;
}

export interface Vendor {
  id: string;
  businessName: string;
  businessAddress: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalReviews: number;
  cacDocument: string | null;
  idDocument: string | null;
  proofOfAddress: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  _count: {
    products: number;
    reviews: number;
    orders: number;
  };
}

export interface VendorsResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Customer {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: Date;
  };
  _count: {
    orders: number;
    addresses: number;
    reviews: number;
  };
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminApi = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  // Get all vendors with optional filters
  async getVendors(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<VendorsResponse> {
    const response = await apiClient.get('/admin/vendors', { params });
    return response.data.data;
  },

  // Get pending vendors
  async getPendingVendors(page = 1, limit = 20): Promise<VendorsResponse> {
    const response = await apiClient.get('/admin/vendors/pending', {
      params: { page, limit },
    });
    return response.data.data;
  },

  // Approve vendor
  async approveVendor(vendorId: string): Promise<Vendor> {
    const response = await apiClient.patch(`/admin/vendors/${vendorId}/approve`);
    return response.data.data;
  },

  // Reject vendor
  async rejectVendor(vendorId: string, reason?: string): Promise<Vendor> {
    const response = await apiClient.patch(`/admin/vendors/${vendorId}/reject`, {
      reason,
    });
    return response.data.data;
  },

  // Suspend vendor
  async suspendVendor(vendorId: string, reason?: string): Promise<Vendor> {
    const response = await apiClient.patch(`/admin/vendors/${vendorId}/suspend`, {
      reason,
    });
    return response.data.data;
  },
  
  // Get all customers
  async getCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CustomersResponse> {
    const response = await apiClient.get('/admin/customers', { params });
    return response.data.data;
  },

  // Get customer by ID
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await apiClient.get(`/admin/customers/${customerId}`);
    return response.data.data;
  },
};
