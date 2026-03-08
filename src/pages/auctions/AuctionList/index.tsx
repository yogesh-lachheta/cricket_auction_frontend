import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionService } from '@api/services';
import type { Auction } from '@api/types';
import { Button, Badge, PageHeader } from '@shared/components';
import toast from 'react-hot-toast';
import { usePermissions } from '@shared/hooks';
import AppLayout from '@shared/layout/AppLayout';
import {
  Users,
  Gavel,
  Plus,
  Trash2,
  Settings,
  Play,
  Clock,
  CheckCircle,
  Pause,
  Calendar,
  Shield,
} from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  upcoming: 'secondary',
  live: 'success',
  completed: 'default',
  cancelled: 'warning',
};

const statusIcons: Record<string, React.ElementType> = {
  upcoming: Clock,
  live: Play,
  completed: CheckCircle,
  cancelled: Pause,
};

export const AuctionList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermissions();

  const canManageAuctions = checkPermission('auctions:create');

  const { data: auctions = [], isLoading, refetch } = useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      const response = await auctionService.getAuctions(0, 100);
      return response;
    },
    onError: (error) => {
      console.error('Error fetching auctions:', error);
      toast.error('Failed to load auctions');
    },
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;

    try {
      await auctionService.deleteAuction(id);
      toast.success('Auction deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error('Failed to delete auction');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Auctions"
        subtitle="Manage and participate in live auctions"
        actions={
          canManageAuctions && (
            <Button onClick={() => navigate('/auctions/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Auction
            </Button>
          )
        }
      />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-text-muted">Loading auctions...</div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
            <Gavel className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <p className="text-text-muted mb-4">No auctions found</p>
            {canManageAuctions && (
              <Button onClick={() => navigate('/auctions/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Auction
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction, index) => {
              const StatusIcon = statusIcons[auction.status] || Clock;

              return (
                <div
                  key={auction.id}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-md transition-all duration-200 animate-cardEntrance"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-text-main flex-1">
                      {auction.title}
                    </h3>
                    <Badge variant={statusColors[auction.status] || 'default'}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {auction.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-text-muted mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Start Time:</span>
                      </div>
                      <p className="font-medium text-text-main pl-6">
                        {formatDate(auction.start_time)}
                      </p>
                    </div>
                    {auction.end_time && (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>End Time:</span>
                        </div>
                        <p className="font-medium text-text-main pl-6">
                          {formatDate(auction.end_time)}
                        </p>
                      </div>
                    )}
                    {auction.current_player && (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-text-muted mb-1">
                          <Users className="w-4 h-4" />
                          <span>Current Player:</span>
                        </div>
                        <p className="font-medium text-text-main pl-6">
                          {auction.current_player.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {auction.status === 'active' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/auctions/${auction.id}/live`)}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Join Live
                        </Button>
                        {canManageAuctions && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/auctions/${auction.id}/admin`)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {canManageAuctions && auction.status !== 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/auctions/${auction.id}/configure`)}
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    )}
                    {canManageAuctions && auction.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(auction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
