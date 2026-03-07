import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { teamService } from '@api/services';
import type { CreateTeamRequest } from '@api/types';
import { Input, Button, PageHeader } from '@shared/components';
import { useAppSelector } from '@shared/hooks/redux';
import toast from 'react-hot-toast';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Team name is required')
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters'),
  purse_remaining: Yup.number()
    .required('Purse amount is required')
    .min(0, 'Purse amount must be positive')
    .max(10000000000, 'Purse amount is too large'),
  max_players: Yup.number()
    .required('Maximum players is required')
    .min(1, 'Must allow at least 1 player')
    .max(25, 'Maximum 25 players allowed'),
});

export const CreateTeam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (!user) {
    navigate('/login');
    return null;
  }

  const initialValues = {
    name: '',
    owner_id: user.id,
    purse_remaining: 10000000, // Default 1 Crore
    max_players: 15,
  };

  const handleSubmit = async (values: CreateTeamRequest) => {
    try {
      setLoading(true);
      await teamService.createTeam(values);
      toast.success('Team created successfully!');
      navigate('/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <PageHeader title="Create New Team" breadcrumbs={breadcrumbs} />

      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values }) => (
            <Form id="team-form" className="space-y-4">
              <Field name="name">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Team Name"
                    placeholder="Enter team name"
                    error={touched.name && errors.name}
                  />
                )}
              </Field>

              <div>
                <label className="text-sm font-medium mb-2 block">Owner</label>
                <Input
                  value={user.full_name}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You will be the owner of this team
                </p>
              </div>

              <Field name="purse_remaining">
                {({ field }: any) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      label="Purse Amount (₹)"
                      placeholder="Enter purse amount"
                      error={touched.purse_remaining && errors.purse_remaining}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {formatCurrency(values.purse_remaining)}
                    </p>
                  </div>
                )}
              </Field>

              <Field name="max_players">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Maximum Players"
                    placeholder="Enter maximum players"
                    error={touched.max_players && errors.max_players}
                  />
                )}
              </Field>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Team Summary</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">{values.name || '-'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Owner:</span>{' '}
                    <span className="font-medium">{user.full_name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Budget:</span>{' '}
                    <span className="font-medium">
                      {formatCurrency(values.purse_remaining)}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Max Players:</span>{' '}
                    <span className="font-medium">{values.max_players}</span>
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
          onClick={() => navigate('/teams')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="team-form"
          loading={loading}
          disabled={loading}
        >
          Create Team
        </Button>
      </div>
    </AppLayout>
  );
};
