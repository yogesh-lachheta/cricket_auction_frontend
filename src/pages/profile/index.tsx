import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAppSelector } from '@shared/hooks/redux';
import { Input, Button, PageHeader, Badge } from '@shared/components';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';

const validationSchema = Yup.object({
  full_name: Yup.string()
    .required('Full name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .max(255, 'Email must be less than 255 characters'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .nullable(),
});

export const Profile = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (!user) {
    return null;
  }

  const initialValues = {
    full_name: user.full_name,
    email: user.email,
    username: user.username,
    mobile: user.mobile || '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      setLoading(true);
      // TODO: Add API call to update user profile
      console.log('Update profile:', values);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'auctioneer':
        return 'default';
      case 'team_owner':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account settings"
        breadcrumbs={breadcrumbs}
        actions={
          !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft sticky top-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>

              <h2 className="text-2xl font-bold text-text-main mb-1">
                {user.full_name}
              </h2>
              <p className="text-text-muted mb-3">@{user.username}</p>

              <Badge variant={getRoleBadgeVariant(user.role)} className="mb-4">
                {user.role}
              </Badge>

              {/* Account Status */}
              <div className="w-full space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Account Status</span>
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Email Verified</span>
                  <Badge variant={user.email_verified ? 'default' : 'outline'}>
                    {user.email_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                {user.mobile && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Mobile Verified</span>
                    <Badge variant={user.mobile_verified ? 'default' : 'outline'}>
                      {user.mobile_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="w-full mt-6 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-bold text-text-main mb-6">
              Profile Information
            </h3>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ errors, touched, isValid, dirty }) => (
                <Form className="space-y-6">
                  <Field name="full_name">
                    {({ field }: any) => (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                          <User className="w-4 h-4" />
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                          error={touched.full_name ? errors.full_name : undefined}
                        />
                      </div>
                    )}
                  </Field>

                  <Field name="username">
                    {({ field }: any) => (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                          <User className="w-4 h-4" />
                          Username
                        </label>
                        <Input
                          {...field}
                          disabled
                          placeholder="Username (cannot be changed)"
                          className="bg-background-light cursor-not-allowed"
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Username cannot be changed
                        </p>
                      </div>
                    )}
                  </Field>

                  <Field name="email">
                    {({ field }: any) => (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                          <Mail className="w-4 h-4" />
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          {...field}
                          type="email"
                          disabled={!isEditing}
                          placeholder="Enter your email"
                          error={touched.email ? errors.email : undefined}
                        />
                      </div>
                    )}
                  </Field>

                  <Field name="mobile">
                    {({ field }: any) => (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                          <Phone className="w-4 h-4" />
                          Mobile Number
                        </label>
                        <Input
                          {...field}
                          type="tel"
                          disabled={!isEditing}
                          placeholder="Enter 10-digit mobile number"
                          error={touched.mobile ? errors.mobile : undefined}
                          maxLength={10}
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Enter 10-digit mobile number (optional)
                        </p>
                      </div>
                    )}
                  </Field>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                      <Shield className="w-4 h-4" />
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                      <span className="text-sm text-text-muted">
                        (Assigned by administrator)
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={loading || !isValid || !dirty}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>

          {/* Security Section */}
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft mt-6">
            <h3 className="text-xl font-bold text-text-main mb-4">
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background-light rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Password</p>
                  <p className="text-sm text-text-muted">
                    Last changed 30 days ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background-light rounded-lg">
                <div>
                  <p className="font-medium text-text-main">Two-Factor Authentication</p>
                  <p className="text-sm text-text-muted">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
