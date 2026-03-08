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
  title: Yup.string()
    .required('Auction title is required')
    .min(3, 'Auction title must be at least 3 characters')
    .max(200, 'Auction title must be less than 200 characters'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable(),
  total_budget_per_team: Yup.number()
    .required('Total budget per team is required')
    .positive('Budget must be positive')
    .max(10000000000, 'Budget cannot exceed 1000 crore'),
  max_teams: Yup.number()
    .min(2, 'Minimum 2 teams required')
    .max(16, 'Maximum 16 teams allowed')
    .nullable(),
  max_players_per_team: Yup.number()
    .min(11, 'Minimum 11 players per team')
    .max(25, 'Maximum 25 players per team')
    .nullable(),
  start_time: Yup.string()
    .nullable(),
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
    title: '',
    description: '',
    total_budget_per_team: 1000000000, // 100 crore default
    max_teams: 8,
    max_players_per_team: 15,
    start_time: currentDateTime,
    end_time: undefined,
  };

  const handleSubmit = async (values: CreateAuctionRequest) => {
    try {
      setLoading(true);

      // Prepare payload with proper type conversions
      const payload: CreateAuctionRequest = {
        title: values.title,
        description: values.description || undefined,
        total_budget_per_team: Number(values.total_budget_per_team),
        max_teams: values.max_teams ? Number(values.max_teams) : undefined,
        max_players_per_team: values.max_players_per_team ? Number(values.max_players_per_team) : undefined,
        start_time: values.start_time ? new Date(values.start_time).toISOString() : undefined,
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
              <Field name="title">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Auction Title"
                    placeholder="Enter auction title (e.g., IPL 2026 Mega Auction)"
                    error={touched.title && errors.title}
                  />
                )}
              </Field>

              <Field name="description">
                {({ field }: any) => (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description (Optional)
                    </label>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Enter auction description..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {touched.description && errors.description && (
                      <p className="text-sm text-destructive mt-1">{errors.description}</p>
                    )}
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field name="total_budget_per_team">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      label="Budget Per Team (₹)"
                      placeholder="e.g., 100 crore = 1000000000"
                      error={touched.total_budget_per_team && errors.total_budget_per_team}
                    />
                  )}
                </Field>

                <Field name="max_teams">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      label="Max Teams"
                      placeholder="Default: 8"
                      error={touched.max_teams && errors.max_teams}
                    />
                  )}
                </Field>

                <Field name="max_players_per_team">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      label="Max Players/Team"
                      placeholder="Default: 15"
                      error={touched.max_players_per_team && errors.max_players_per_team}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field name="start_time">
                  {({ field }: any) => (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Start Date & Time (Optional)
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
                    </div>
                  )}
                </Field>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Auction Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>{' '}
                    <span className="font-medium">{values.title || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget/Team:</span>{' '}
                    <span className="font-medium">
                      {values.total_budget_per_team
                        ? `₹${(values.total_budget_per_team / 10000000).toFixed(2)} Cr`
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Teams:</span>{' '}
                    <span className="font-medium">{values.max_teams || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Players/Team:</span>{' '}
                    <span className="font-medium">{values.max_players_per_team || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start:</span>{' '}
                    <span className="font-medium">
                      {values.start_time
                        ? new Date(values.start_time).toLocaleString('en-IN')
                        : 'Not Set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span>{' '}
                    <span className="font-medium">
                      {values.end_time
                        ? new Date(values.end_time).toLocaleString('en-IN')
                        : 'Manual'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Note: After creating, you can add players and teams from the auction management page.
                </p>
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
