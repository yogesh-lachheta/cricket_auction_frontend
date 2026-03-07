import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Button } from '@shared/components';
import { Input } from '@shared/components';
import { useAppDispatch } from '@shared/hooks/redux';
import { setCredentials } from '@store/slices/authSlice';
import { authService } from '../services/authService';
import { loginSchema } from '../schemas/authSchemas';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.login(values);
      
      // Store token
      localStorage.setItem('access_token', response.access_token);
      
      // Fetch user details
      const user = await authService.getCurrentUser();
      
      // Update Redux store
      dispatch(setCredentials({ user, token: response.access_token }));
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast('Google OAuth integration - Coming soon!', {
      icon: 'ℹ️',
    });
    // TODO: Implement Google OAuth flow
  };

  const handleMicrosoftLogin = () => {
    toast('Microsoft OAuth integration - Coming soon!', {
      icon: 'ℹ️',
    });
    // TODO: Implement Microsoft OAuth flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🏏 Cricket Auction
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
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
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M13 1h10v10H13z" />
              <path fill="#7fba00" d="M1 13h10v10H1z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Login Form */}
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6">
              <Field name="username">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Email or Username"
                    placeholder="Enter your email or username"
                    error={touched.username && errors.username ? errors.username : undefined}
                  />
                )}
              </Field>

              <Field name="password">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    error={touched.password && errors.password ? errors.password : undefined}
                  />
                )}
              </Field>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Sign in
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
          </span>
          <Link
            to="/signup"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
