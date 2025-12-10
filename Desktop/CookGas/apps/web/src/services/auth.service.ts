import apiClient from '@/lib/api-client'

export interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  role?: 'CUSTOMER' | 'VENDOR'
}

export interface LoginData {
  email: string
  password: string
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data.data
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data)
    return response.data.data
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', { refreshToken })
    return response.data.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data.data
  },
}
