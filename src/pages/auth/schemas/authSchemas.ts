import * as Yup from 'yup';

export const loginSchema = Yup.object({
  username: Yup.string()
    .required('Email or username is required')
    .min(3, 'Must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  full_name: Yup.string()
    .required('Full name is required')
    .max(200, 'Full name must not exceed 200 characters'),
  mobile: Yup.string()
    .matches(/^\+[1-9]\d{9,14}$/, 'Mobile must start with + and country code (e.g., +919876543210)')
    .optional(),
  role: Yup.string()
    .oneOf(['viewer', 'team_owner', 'auctioneer'], 'Invalid role')
    .default('viewer'),
});

export const otpSchema = Yup.object({
  code: Yup.string()
    .required('OTP code is required')
    .matches(/^\d{6}$/, 'OTP must be 6 digits'),
});
