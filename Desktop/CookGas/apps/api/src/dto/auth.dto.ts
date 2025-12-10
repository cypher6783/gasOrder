import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['CUSTOMER', 'VENDOR']).optional().default('CUSTOMER'),
  
  // Vendor-specific fields (required when role is VENDOR)
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cacDocument: z.string().url().optional().or(z.literal('')),
  idDocument: z.string().url().optional().or(z.literal('')),
  proofOfAddress: z.string().url().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
