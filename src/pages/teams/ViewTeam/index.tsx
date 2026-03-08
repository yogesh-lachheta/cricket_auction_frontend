import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { teamService } from '@api/services';
import type { Team } from '@api/types';
import { Button, Badge, PageHeader } from '@shared/components';
import toast from 'react-hot-toast';
import AppLayout from '@shared/layout/AppLayout';
import { generateBreadcrumbs } from '@shared/utils/breadcrumbHelpers';

export const ViewTeam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await teamService.getTeamById(Number(id));
        setTeam(data);
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error('Failed to load team details');
        navigate('/teams');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeam();
    }
  }, [id, navigate]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      // Crore (1 cr = 10,000,000)
      const crores = amount / 10000000;
      return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)} cr`;
    } else if (amount >= 100000) {
      // Lakh (1 lakh = 100,000)
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)} lakh`;
    } else if (amount >= 1000) {
      // Thousands
      const thousands = amount / 1000;
      return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-text-muted">Loading team details...</div>
        </div>
      </AppLayout>
    );
  }

  if (!team) {
    return null;
  }

  const playersCount = team.current_players;
  const totalSpent = team.total_budget - team.remaining_budget;

  return (
    <AppLayout>
      <PageHeader
        title={team.name}
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" onClick={() => navigate('/teams')}>
            ← Back to Teams
          </Button>
        }
      />

      {/* Team Stats */}
      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background-light p-4 rounded-lg">
            <p className="text-sm text-text-muted mb-1">Purse Remaining</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(team.remaining_budget)}
            </p>
          </div>
          <div className="bg-background-light p-4 rounded-lg">
            <p className="text-sm text-text-muted mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-text-main">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="bg-background-light p-4 rounded-lg">
            <p className="text-sm text-text-muted mb-1">Players Acquired</p>
            <p className="text-2xl font-bold text-text-main">
              {playersCount} / {team.max_players}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-muted">Squad Completion</span>
            <span className="font-medium text-text-main">
              {((playersCount / team.max_players) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-border-light rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${(playersCount / team.max_players) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
        <h2 className="text-2xl font-bold mb-4 text-text-main">Squad Players</h2>

        {playersCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No players acquired yet</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-muted">Player details will be shown here</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
