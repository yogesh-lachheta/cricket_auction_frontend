import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playerService } from '@api/services';
import type { Player } from '@api/types';
import { Button, Badge, PageHeader } from '@shared/components';
import toast from 'react-hot-toast';
import { usePermissions } from '@shared/hooks';
import AppLayout from '@shared/layout/AppLayout';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react';

export const PlayerList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');

  const canManagePlayers = checkPermission('players:create');

  const { data: players = [], isLoading, refetch } = useQuery({
    queryKey: ['players', filter],
    queryFn: async () => {
      if (filter === 'available') {
        return await playerService.getAvailablePlayers();
      } else if (filter === 'sold') {
        return await playerService.getSoldPlayers();
      } else {
        return await playerService.getPlayers(0, 100);
      }
    },
    onError: (error) => {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    },
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;

    try {
      await playerService.deletePlayer(id);
      toast.success('Player deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Failed to delete player');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Players Directory"
        subtitle="Browse and manage cricket players"
        actions={
          canManagePlayers && (
            <Button onClick={() => navigate('/players/create')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Player
            </Button>
          )
        }
      />

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            All Players
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            onClick={() => setFilter('available')}
            size="sm"
          >
            Available
          </Button>
          <Button
            variant={filter === 'sold' ? 'default' : 'outline'}
            onClick={() => setFilter('sold')}
            size="sm"
          >
            Sold
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-text-muted">Loading players...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
            <Users className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <p className="text-text-muted mb-4">No players found</p>
            {canManagePlayers && (
              <Button onClick={() => navigate('/players/create')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Player
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-md transition-all duration-200 animate-cardEntrance"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-main">
                      {player.name}
                    </h3>
                    <p className="text-sm text-text-muted">{player.country}</p>
                  </div>
                  <Badge variant={player.is_sold ? 'destructive' : 'secondary'}>
                    {player.is_sold ? 'Sold' : 'Available'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Age:</span>
                    <span className="font-medium text-text-main">{player.age} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Role:</span>
                    <span className="font-medium text-text-main">{player.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Batting:</span>
                    <span className="font-medium text-text-main">{player.batting_style}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Bowling:</span>
                    <span className="font-medium text-text-main">{player.bowling_style}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Base Price:</span>
                    <span className="font-medium text-text-main">{formatPrice(player.base_price)}</span>
                  </div>
                  {player.is_sold && player.final_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Sold For:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(player.final_price)}
                      </span>
                    </div>
                  )}
                </div>

                {canManagePlayers && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/players/${player.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(player.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </AppLayout>
  );
};
