import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Button, Input, Badge } from '@shared/components';
import { useAppDispatch } from '@shared/hooks/redux';
import { setCredentials } from '@store/slices/authSlice';
import { authService } from '../services/authService';
import { otpSchema } from '../schemas/authSchemas';
import { CheckCircle, Mail, Phone } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { userId, email, mobile, requiresVerification } = location.state || {};
  
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingMobile, setLoadingMobile] = useState(false);
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [mobileResendTimer, setMobileResendTimer] = useState(0);

  // Redirect if no user data
  useEffect(() => {
    if (!userId) {
      navigate('/signup');
    }
  }, [userId, navigate]);

  // Countdown timers
  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(() => setMobileResendTimer(mobileResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

  const handleEmailOTP = async (values: { code: string }, { resetForm }: any) => {
    try {
      setLoadingEmail(true);
      await authService.verifyOTP({
        user_id: userId,
        otp_type: 'EMAIL',
        code: values.code,
      });
      
      setEmailVerified(true);
      toast.success('Email verified successfully!');
      resetForm();
      
      // If both verified or only email required, auto-login
      if (!mobile || mobileVerified) {
        await autoLogin();
      }
    } catch (error) {
      console.error('Email OTP verification error:', error);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleMobileOTP = async (values: { code: string }, { resetForm }: any) => {
    try {
      setLoadingMobile(true);
      await authService.verifyOTP({
        user_id: userId,
        otp_type: 'MOBILE',
        code: values.code,
      });
      
      setMobileVerified(true);
      toast.success('Mobile verified successfully!');
      resetForm();
      
      // If both verified, auto-login
      if (emailVerified) {
        await autoLogin();
      }
    } catch (error) {
      console.error('Mobile OTP verification error:', error);
    } finally {
      setLoadingMobile(false);
    }
  };

  const handleResendEmailOTP = async () => {
    try {
      await authService.resendOTP(userId, 'EMAIL');
      toast.success('OTP sent to your email!');
      setEmailResendTimer(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Resend email OTP error:', error);
    }
  };

  const handleResendMobileOTP = async () => {
    try {
      await authService.resendOTP(userId, 'MOBILE');
      toast.success('OTP sent to your mobile!');
      setMobileResendTimer(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Resend mobile OTP error:', error);
    }
  };

  const autoLogin = async () => {
    try {
      // For now, redirect to login page
      // In production, you might want to auto-login here
      toast.success('Verification complete! Please login to continue.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Auto-login error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent verification codes to your email{mobile ? ' and mobile' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email OTP */}
          <div className="space-y-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Email Verification</h3>
              </div>
              {emailVerified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>

            {!emailVerified && (
              <Formik
                initialValues={{ code: '' }}
                validationSchema={otpSchema}
                onSubmit={handleEmailOTP}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4">
                    <Field name="code">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          label="Enter 6-digit OTP"
                          placeholder="123456"
                          maxLength={6}
                          error={touched.code && errors.code ? errors.code : undefined}
                        />
                      )}
                    </Field>

                    <Button type="submit" className="w-full" loading={loadingEmail}>
                      Verify Email
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleResendEmailOTP}
                      disabled={emailResendTimer > 0}
                    >
                      {emailResendTimer > 0 ? `Resend in ${emailResendTimer}s` : 'Resend OTP'}
                    </Button>
                  </Form>
                )}
              </Formik>
            )}
          </div>

          {/* Mobile OTP */}
          {mobile && (
            <div className="space-y-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Mobile Verification</h3>
                </div>
                {mobileVerified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">{mobile}</p>

              {!mobileVerified && (
                <Formik
                  initialValues={{ code: '' }}
                  validationSchema={otpSchema}
                  onSubmit={handleMobileOTP}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-4">
                      <Field name="code">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            label="Enter 6-digit OTP"
                            placeholder="123456"
                            maxLength={6}
                            error={touched.code && errors.code ? errors.code : undefined}
                          />
                        )}
                      </Field>

                      <Button type="submit" className="w-full" loading={loadingMobile}>
                        Verify Mobile
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={handleResendMobileOTP}
                        disabled={mobileResendTimer > 0}
                      >
                        {mobileResendTimer > 0 ? `Resend in ${mobileResendTimer}s` : 'Resend OTP'}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          )}
        </div>

        {/* Skip for now */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/login')}
          >
            Skip for now (Verify later)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
