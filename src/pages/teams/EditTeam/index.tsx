import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { teamService } from '@api/services';
import type { UpdateTeamRequest } from '@api/types';
import { Input, Button, PageHeader, FileUpload } from '@shared/components';
import { useAppSelector } from '@shared/hooks/redux';
import toast from 'react-hot-toast';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';
import { Loader2 } from 'lucide-react';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Team name is required')
    .min(3, 'Team name must be at least 3 characters')
    .max(200, 'Team name must be less than 200 characters'),
  short_name: Yup.string()
    .min(2, 'Short name must be at least 2 characters')
    .max(50, 'Short name must be less than 50 characters'),
  owner_name: Yup.string().max(200, 'Owner name must be less than 200 characters'),
  logo_url: Yup.string(),
  max_players: Yup.number()
    .min(11, 'Must allow at least 11 players')
    .max(25, 'Maximum 25 players allowed'),
});

export const EditTeam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [fetchingTeam, setFetchingTeam] = useState(true);
  const [initialValues, setInitialValues] = useState<UpdateTeamRequest>({
    name: '',
    short_name: '',
    owner_name: '',
    logo_url: '',
    max_players: 15,
  });

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  useEffect(() => {
    if (!id) {
      navigate('/teams');
      return;
    }

    const fetchTeam = async () => {
      try {
        setFetchingTeam(true);
        const team = await teamService.getTeamById(Number(id));
        setInitialValues({
          name: team.name,
          short_name: team.short_name,
          owner_name: team.owner_name || '',
          logo_url: team.logo_url || '',
          max_players: team.max_players,
        });
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error('Failed to load team details');
        navigate('/teams');
      } finally {
        setFetchingTeam(false);
      }
    };

    fetchTeam();
  }, [id, navigate]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (values: UpdateTeamRequest) => {
    try {
      setLoading(true);
      await teamService.updateTeam(Number(id), values);
      toast.success('Team updated successfully!');
      navigate('/teams');
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTeam) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Edit Team" breadcrumbs={breadcrumbs} />

      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values }) => (
            <Form id="team-edit-form" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field name="name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      label="Team Name"
                      placeholder="Enter full team name"
                      error={touched.name && errors.name}
                    />
                  )}
                </Field>

                <Field name="short_name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      label="Short Name"
                      placeholder="e.g., MI, CSK, RCB"
                      error={touched.short_name && errors.short_name}
                    />
                  )}
                </Field>
              </div>

              <Field name="owner_name">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Owner Name"
                    placeholder="Enter owner name"
                    error={touched.owner_name && errors.owner_name}
                  />
                )}
              </Field>

              <Field name="max_players">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Maximum Players"
                    placeholder="Enter maximum players (11-25)"
                    error={touched.max_players && errors.max_players}
                  />
                )}
              </Field>

              <Field name="logo_url">
                {({ field, form }: any) => (
                  <FileUpload
                    value={field.value}
                    onChange={(url) => form.setFieldValue('logo_url', url)}
                    label="Team Logo (Optional)"
                    error={touched.logo_url && errors.logo_url}
                    maxSize={2}
                  />
                )}
              </Field>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Team Summary</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Full Name:</span>{' '}
                    <span className="font-medium">{values.name || '-'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Short Name:</span>{' '}
                    <span className="font-medium">{values.short_name || '-'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Owner:</span>{' '}
                    <span className="font-medium">{values.owner_name || '-'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Max Players:</span>{' '}
                    <span className="font-medium">{values.max_players || 15}</span>
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
          form="team-edit-form"
          loading={loading}
          disabled={loading}
        >
          Update Team
        </Button>
      </div>
    </AppLayout>
  );
};
