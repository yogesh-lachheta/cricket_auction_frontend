import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components';
import { authService } from '../services/authService';
import { registerSchema } from '../schemas/authSchemas';

interface SignupFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  mobile: string;
  role: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues: SignupFormValues = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    mobile: '',
    role: 'viewer',
  };

  const handleSignup = async (values: SignupFormValues) => {
    try {
      setLoading(true);
      
      // Remove confirmPassword before sending
      const { confirmPassword, ...registerData } = values;
      
      const response = await authService.register(registerData);
      
      toast.success(response.message || 'Registration successful!');
      
      // Navigate to OTP verification with user data
      navigate('/verify-otp', {
        state: {
          userId: response.user_id,
          email: response.email,
          mobile: response.mobile,
          requiresVerification: response.requires_verification,
        },
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast('Google OAuth integration - Coming soon!', {
      icon: 'ℹ️',
    });
    // TODO: Implement Google OAuth flow
  };

  const handleMicrosoftSignup = () => {
    toast('Microsoft OAuth integration - Coming soon!', {
      icon: 'ℹ️',
    });
    // TODO: Implement Microsoft OAuth flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🏏 Cricket Auction
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M13 1h10v10H13z" />
              <path fill="#7fba00" d="M1 13h10v10H1z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            Sign up with Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or sign up with email</span>
          </div>
        </div>

        {/* Signup Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleSignup}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field name="full_name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      label="Full Name"
                      placeholder="John Doe"
                      error={touched.full_name && errors.full_name ? errors.full_name : undefined}
                    />
                  )}
                </Field>

                <Field name="username">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      label="Username"
                      placeholder="johndoe"
                      error={touched.username && errors.username ? errors.username : undefined}
                    />
                  )}
                </Field>
              </div>

              <Field name="email">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="john@example.com"
                    error={touched.email && errors.email ? errors.email : undefined}
                  />
                )}
              </Field>

              <Field name="mobile">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Mobile (Optional)"
                    placeholder="+919876543210"
                    error={touched.mobile && errors.mobile ? errors.mobile : undefined}
                  />
                )}
              </Field>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Role</label>
                <Select
                  value={values.role}
                  onValueChange={(value) => setFieldValue('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer (View auctions only)</SelectItem>
                    <SelectItem value="team_owner">Team Owner (Participate in bidding)</SelectItem>
                    <SelectItem value="auctioneer">Auctioneer (Manage auctions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field name="password">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="password"
                      label="Password"
                      placeholder="••••••••"
                      error={touched.password && errors.password ? errors.password : undefined}
                    />
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="password"
                      label="Confirm Password"
                      placeholder="••••••••"
                      error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                    />
                  )}
                </Field>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Password must contain:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter, one lowercase letter</li>
                  <li>One number and one special character (@$!%*?&#)</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
