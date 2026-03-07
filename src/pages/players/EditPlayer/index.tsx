import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { playerService } from '@api/services';
import type { Player, UpdatePlayerRequest } from '@api/types';
import { Input } from '@shared/components/Input';
import { Select } from '@shared/components/Select';
import { Button } from '@shared/components/Button';
import toast from 'react-hot-toast';

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

export const EditPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setFetchLoading(true);
        const data = await playerService.getPlayerById(Number(id));
        setPlayer(data);
      } catch (error) {
        console.error('Error fetching player:', error);
        toast.error('Failed to load player');
        navigate('/players');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchPlayer();
    }
  }, [id, navigate]);

  const handleSubmit = async (values: UpdatePlayerRequest) => {
    try {
      setLoading(true);
      await playerService.updatePlayer(Number(id), values);
      toast.success('Player updated successfully!');
      navigate('/players');
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading player...</div>
      </div>
    );
  }

  if (!player) {
    return null;
  }

  const initialValues: UpdatePlayerRequest = {
    name: player.name,
    age: player.age,
    role: player.role,
    batting_style: player.batting_style,
    bowling_style: player.bowling_style,
    base_price: player.base_price,
    country: player.country,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/players')}>
          ← Back to Players
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Player</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-4">
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  Update Player
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/players')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
