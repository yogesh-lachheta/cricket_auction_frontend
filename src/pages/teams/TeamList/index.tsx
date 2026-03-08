import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teamService } from '@api/services';
import type { Team } from '@api/types';
import { Button, Badge, PageHeader, Tooltip, Avatar } from '@shared/components';
import toast from 'react-hot-toast';
import { usePermissions } from '@shared/hooks';
import { useAppSelector } from '@shared/hooks/redux';
import AppLayout from '@shared/layout/AppLayout';
import {
  Target,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Edit,
} from 'lucide-react';

export const TeamList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();
  const { user } = useAppSelector((state) => state.auth);

  const canManageTeams = checkPermission('teams:create');

  const { data: teams = [], isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      return await teamService.getTeams(0, 100);
    },
    onError: (error) => {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    },
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamService.deleteTeam(id);
      toast.success('Team deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
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
      <PageHeader
        title="Teams Directory"
        subtitle="Browse and manage cricket teams"
        actions={
          canManageTeams && (
            <Button onClick={() => navigate('/teams/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Team
            </Button>
          )
        }
      />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-text-muted">Loading teams...</div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
            <Target className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <p className="text-text-muted mb-4">No teams found</p>
            {canManageTeams && (
              <Button onClick={() => navigate('/teams/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Team
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => {
              const isMyTeam = user && team.user_id === user.id;
              const playersCount = team.current_players;

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-cardEntrance border border-transparent hover:border-primary/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      src={team.logo_url}
                      alt={team.name}
                      fallbackText={team.short_name || team.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-text-main">
                            {team.name}
                          </h3>
                          <p className="text-sm font-medium text-primary">
                            {team.short_name}
                          </p>
                          {team.owner_name && (
                            <p className="text-sm text-text-muted">
                              Owner: {team.owner_name}
                            </p>
                          )}
                        </div>
                        {isMyTeam && (
                          <Badge variant="default">My Team</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Purse Remaining:
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(team.remaining_budget)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-muted">Players:</span>
                      <span className="font-medium text-text-main">
                        {playersCount} / {team.max_players}
                      </span>
                    </div>
                    <div className="w-full bg-border-light rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((playersCount / team.max_players) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Tooltip content="View Team" position="top">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teams/${team.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    {(canManageTeams || isMyTeam) && (
                      <>
                        <Tooltip content="Edit Team" position="top">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/teams/${team.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete Team" position="top">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(team.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </AppLayout>
  );
};
