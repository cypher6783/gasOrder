import apiClient from '@/lib/api-client';

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    description: string;
    imageUrl?: string;
    unit: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  vendor: {
    businessName: string;
    phone?: string;
  };
  items: OrderItem[];
  deliveryFee: number;
}

export interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
  }[];
  addressId: string;
  vendorId: string;
}

export const orderService = {
  async createOrder(data: CreateOrderData) {
    const response = await apiClient.post('/orders', data);
    return response.data.data;
  },

  async getMyOrders() {
    try {
      const response = await apiClient.get(`/orders?t=${new Date().getTime()}`);
      return response.data.data;
    } catch (error) {
       console.error('getMyOrders error:', error);
       throw error;
    }
  },

  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },
  async cancelOrder(id: string) {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data.data;
  },
};
