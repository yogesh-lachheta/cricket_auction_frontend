import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { auctionService } from '@api/services';
import type { CreateAuctionRequest } from '@api/types';
import { Input, Button, PageHeader } from '@shared/components';
import toast from 'react-hot-toast';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Auction name is required')
    .min(3, 'Auction name must be at least 3 characters')
    .max(100, 'Auction name must be less than 100 characters'),
  start_time: Yup.string()
    .required('Start time is required'),
  end_time: Yup.string()
    .nullable()
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { start_time } = this.parent;
      if (!value || !start_time) return true;
      return new Date(value) > new Date(start_time);
    }),
});

export const CreateAuction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  // Get current date-time in local format for datetime-local input
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const currentDateTime = now.toISOString().slice(0, 16);

  const initialValues: CreateAuctionRequest = {
    name: '',
    start_time: currentDateTime,
    end_time: undefined,
  };

  const handleSubmit = async (values: CreateAuctionRequest) => {
    try {
      setLoading(true);

      // Convert local datetime to ISO string
      const payload = {
        ...values,
        start_time: new Date(values.start_time).toISOString(),
        end_time: values.end_time ? new Date(values.end_time).toISOString() : undefined,
      };

      await auctionService.createAuction(payload);
      toast.success('Auction created successfully!');
      navigate('/auctions');
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Create New Auction" breadcrumbs={breadcrumbs} />

      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values }) => (
            <Form id="auction-form" className="space-y-4">
              <Field name="name">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Auction Name"
                    placeholder="Enter auction name (e.g., IPL 2026 Auction)"
                    error={touched.name && errors.name}
                  />
                )}
              </Field>

              <Field name="start_time">
                {({ field }: any) => (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Start Date & Time
                    </label>
                    <input
                      {...field}
                      type="datetime-local"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {touched.start_time && errors.start_time && (
                      <p className="text-sm text-destructive mt-1">{errors.start_time}</p>
                    )}
                  </div>
                )}
              </Field>

              <Field name="end_time">
                {({ field }: any) => (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      End Date & Time (Optional)
                    </label>
                    <input
                      {...field}
                      type="datetime-local"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {touched.end_time && errors.end_time && (
                      <p className="text-sm text-destructive mt-1">{errors.end_time}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty if you want to manually end the auction
                    </p>
                  </div>
                )}
              </Field>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Auction Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">{values.name || '-'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Start:</span>{' '}
                    <span className="font-medium">
                      {values.start_time
                        ? new Date(values.start_time).toLocaleString('en-IN')
                        : '-'}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">End:</span>{' '}
                    <span className="font-medium">
                      {values.end_time
                        ? new Date(values.end_time).toLocaleString('en-IN')
                        : 'Manual'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: After creating, you can configure players and start the auction
                    from the auction management page.
                  </p>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/auctions')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="auction-form"
          loading={loading}
          disabled={loading}
        >
          Create Auction
        </Button>
      </div>
    </AppLayout>
  );
};
