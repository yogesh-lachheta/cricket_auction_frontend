import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService } from '@api/services';
import type { Team } from '@api/types';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import toast from 'react-hot-toast';

export const ViewTeam = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading team details...</div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const playersCount = team.players?.length || 0;
  const totalSpent = team.players?.reduce((sum, player) => {
    return sum + (player.final_price || 0);
  }, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/teams')}>
          ← Back to Teams
        </Button>
      </div>

      {/* Team Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            {team.owner && (
              <p className="text-muted-foreground">
                Owner: <span className="font-medium">{team.owner.full_name}</span>
              </p>
            )}
          </div>
          <Badge variant="default">
            {playersCount} / {team.max_players} Players
          </Badge>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Purse Remaining</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(team.purse_remaining)}
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Players Acquired</p>
            <p className="text-2xl font-bold">
              {playersCount} / {team.max_players}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Squad Completion</span>
            <span className="font-medium">
              {((playersCount / team.max_players) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{
                width: `${(playersCount / team.max_players) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Squad Players</h2>

        {!team.players || team.players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No players acquired yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {team.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.role} • {player.country}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary">{player.role}</Badge>
                  {player.final_price && (
                    <p className="text-sm font-semibold mt-1">
                      {formatCurrency(player.final_price)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Players by Role Breakdown */}
      {team.players && team.players.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Squad Composition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map((role) => {
              const count = team.players?.filter((p) => p.role === role).length || 0;
              return (
                <div key={role} className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{role}s</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
