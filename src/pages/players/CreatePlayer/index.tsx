import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { playerService } from '@api/services';
import type { CreatePlayerRequest } from '@api/types';
import { Input, Select, Button, PageHeader } from '@shared/components';
import toast from 'react-hot-toast';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';

const playerRoles = [
  { value: 'Batsman', label: 'Batsman' },
  { value: 'Bowler', label: 'Bowler' },
  { value: 'All-Rounder', label: 'All-Rounder' },
  { value: 'Wicket-Keeper', label: 'Wicket-Keeper' },
];

const battingStyles = [
  { value: 'Right-hand Bat', label: 'Right-hand Bat' },
  { value: 'Left-hand Bat', label: 'Left-hand Bat' },
  { value: 'N/A', label: 'N/A' },
];

const bowlingStyles = [
  { value: 'Right-arm Fast', label: 'Right-arm Fast' },
  { value: 'Right-arm Medium', label: 'Right-arm Medium' },
  { value: 'Right-arm Spin', label: 'Right-arm Spin' },
  { value: 'Left-arm Fast', label: 'Left-arm Fast' },
  { value: 'Left-arm Spin', label: 'Left-arm Spin' },
  { value: 'N/A', label: 'N/A' },
];

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  age: Yup.number()
    .required('Age is required')
    .min(16, 'Age must be at least 16')
    .max(50, 'Age must be less than 50'),
  role: Yup.string().required('Role is required'),
  batting_style: Yup.string().required('Batting style is required'),
  bowling_style: Yup.string().required('Bowling style is required'),
  base_price: Yup.number()
    .required('Base price is required')
    .min(0, 'Base price must be positive'),
  country: Yup.string().required('Country is required'),
});

export const CreatePlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  const initialValues: CreatePlayerRequest = {
    name: '',
    age: 25,
    role: '',
    batting_style: '',
    bowling_style: '',
    base_price: 50000,
    country: '',
  };

  const handleSubmit = async (values: CreatePlayerRequest) => {
    try {
      setLoading(true);
      await playerService.createPlayer(values);
      toast.success('Player created successfully!');
      navigate('/players');
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Failed to create player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Add New Player" breadcrumbs={breadcrumbs} />

      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form id="player-form" className="space-y-4">
              <Field name="name">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Player Name"
                    placeholder="Enter player name"
                    error={touched.name && errors.name}
                  />
                )}
              </Field>

              <Field name="age">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Age"
                    placeholder="Enter age"
                    error={touched.age && errors.age}
                  />
                )}
              </Field>

              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select
                  value={values.role}
                  onValueChange={(value) => setFieldValue('role', value)}
                  options={playerRoles}
                  placeholder="Select role"
                />
                {touched.role && errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Batting Style</label>
                <Select
                  value={values.batting_style}
                  onValueChange={(value) => setFieldValue('batting_style', value)}
                  options={battingStyles}
                  placeholder="Select batting style"
                />
                {touched.batting_style && errors.batting_style && (
                  <p className="text-sm text-destructive mt-1">{errors.batting_style}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bowling Style</label>
                <Select
                  value={values.bowling_style}
                  onValueChange={(value) => setFieldValue('bowling_style', value)}
                  options={bowlingStyles}
                  placeholder="Select bowling style"
                />
                {touched.bowling_style && errors.bowling_style && (
                  <p className="text-sm text-destructive mt-1">{errors.bowling_style}</p>
                )}
              </div>

              <Field name="country">
                {({ field }: any) => (
                  <Input
                    {...field}
                    label="Country"
                    placeholder="Enter country"
                    error={touched.country && errors.country}
                  />
                )}
              </Field>

              <Field name="base_price">
                {({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Base Price (₹)"
                    placeholder="Enter base price"
                    error={touched.base_price && errors.base_price}
                  />
                )}
              </Field>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/players')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="player-form"
          loading={loading}
          disabled={loading}
        >
          Create Player
        </Button>
      </div>
    </AppLayout>
  );
};
