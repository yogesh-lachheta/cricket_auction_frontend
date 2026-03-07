import axiosInstance from '@api/config/axiosInstance';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  OTPVerifyRequest,
  User,
} from '@api/types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await axiosInstance.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: OTPVerifyRequest): Promise<any> => {
    const response = await axiosInstance.post('/auth/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (userId: number, otpType: 'EMAIL' | 'MOBILE'): Promise<any> => {
    const response = await axiosInstance.post('/auth/resend-otp', {
      user_id: userId,
      otp_type: otpType,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  // Google OAuth
  googleAuth: async (authData: any): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/google/callback', authData);
    return response.data;
  },

  // Microsoft OAuth
  microsoftAuth: async (authData: any): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/microsoft/callback', authData);
    return response.data;
  },
};
