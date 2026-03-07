import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auctionService, playerService } from '@api/services';
import type { Auction, Player } from '@api/types';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Select } from '@shared/components/Select';
import toast from 'react-hot-toast';

export const ConfigureAuction = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auctionData, playersData] = await Promise.all([
        auctionService.getAuctionById(Number(id)),
        playerService.getAvailablePlayers(),
      ]);
      setAuction(auctionData);
      setAvailablePlayers(playersData);
      if (auctionData.current_player_id) {
        setSelectedPlayerId(String(auctionData.current_player_id));
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
      navigate('/auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleStartAuction = async () => {
    try {
      setActionLoading(true);
      const updatedAuction = await auctionService.startAuction(Number(id));
      setAuction(updatedAuction);
      toast.success('Auction started successfully!');
    } catch (error) {
      console.error('Error starting auction:', error);
      toast.error('Failed to start auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseAuction = async () => {
    try {
      setActionLoading(true);
      const updatedAuction = await auctionService.pauseAuction(Number(id));
      setAuction(updatedAuction);
      toast.success('Auction paused');
    } catch (error) {
      console.error('Error pausing auction:', error);
      toast.error('Failed to pause auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeAuction = async () => {
    try {
      setActionLoading(true);
      const updatedAuction = await auctionService.resumeAuction(Number(id));
      setAuction(updatedAuction);
      toast.success('Auction resumed');
    } catch (error) {
      console.error('Error resuming auction:', error);
      toast.error('Failed to resume auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndAuction = async () => {
    if (!window.confirm('Are you sure you want to end this auction?')) return;

    try {
      setActionLoading(true);
      const updatedAuction = await auctionService.endAuction(Number(id));
      setAuction(updatedAuction);
      toast.success('Auction ended successfully!');
    } catch (error) {
      console.error('Error ending auction:', error);
      toast.error('Failed to end auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetCurrentPlayer = async () => {
    if (!selectedPlayerId) {
      toast.error('Please select a player');
      return;
    }

    try {
      setActionLoading(true);
      const updatedAuction = await auctionService.setCurrentPlayer(
        Number(id),
        Number(selectedPlayerId)
      );
      setAuction(updatedAuction);
      toast.success('Current player updated!');

      // Refresh available players
      const playersData = await playerService.getAvailablePlayers();
      setAvailablePlayers(playersData);
    } catch (error) {
      console.error('Error setting current player:', error);
      toast.error('Failed to set current player');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading auction configuration...</div>
      </div>
    );
  }

  if (!auction) {
    return null;
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
    pending: 'secondary',
    active: 'success',
    paused: 'warning',
    completed: 'default',
  };

  const playerOptions = availablePlayers.map((player) => ({
    value: String(player.id),
    label: `${player.name} (${player.role}) - ₹${player.base_price.toLocaleString('en-IN')}`,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/auctions')}>
          ← Back to Auctions
        </Button>
        {auction.status === 'active' && (
          <Button onClick={() => navigate(`/auctions/${auction.id}/live`)}>
            View Live Auction
          </Button>
        )}
      </div>

      {/* Auction Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{auction.name}</h1>
            <p className="text-muted-foreground">Auction Configuration & Control</p>
          </div>
          <Badge variant={statusColors[auction.status]}>
            {auction.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Time</p>
            <p className="font-medium">{formatDate(auction.start_time)}</p>
          </div>
          {auction.end_time && (
            <div>
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-medium">{formatDate(auction.end_time)}</p>
            </div>
          )}
          {auction.current_player && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Current Player</p>
              <p className="font-medium text-lg text-primary">
                {auction.current_player.name} ({auction.current_player.role})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auction Controls */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Auction Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auction.status === 'pending' && (
            <Button
              onClick={handleStartAuction}
              disabled={actionLoading}
              loading={actionLoading}
              size="lg"
              className="md:col-span-2"
            >
              Start Auction
            </Button>
          )}

          {auction.status === 'active' && (
            <>
              <Button
                variant="warning"
                onClick={handlePauseAuction}
                disabled={actionLoading}
                loading={actionLoading}
                size="lg"
              >
                Pause Auction
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndAuction}
                disabled={actionLoading}
                loading={actionLoading}
                size="lg"
              >
                End Auction
              </Button>
            </>
          )}

          {auction.status === 'paused' && (
            <>
              <Button
                onClick={handleResumeAuction}
                disabled={actionLoading}
                loading={actionLoading}
                size="lg"
              >
                Resume Auction
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndAuction}
                disabled={actionLoading}
                loading={actionLoading}
                size="lg"
              >
                End Auction
              </Button>
            </>
          )}

          {auction.status === 'completed' && (
            <div className="md:col-span-2 text-center py-4">
              <p className="text-muted-foreground">This auction has been completed</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Selection */}
      {auction.status !== 'completed' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Set Current Player</h2>

          {availablePlayers.length === 0 ? (
            <p className="text-muted-foreground">No available players to auction</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Player
                </label>
                <Select
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                  options={playerOptions}
                  placeholder="Choose a player for bidding"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {availablePlayers.length} players available
                </p>
              </div>

              <Button
                onClick={handleSetCurrentPlayer}
                disabled={!selectedPlayerId || actionLoading}
                loading={actionLoading}
                className="w-full"
              >
                Set as Current Player
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
