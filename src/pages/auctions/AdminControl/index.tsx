import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionService, teamService, playerService } from '@api/services';
import type { Auction, Team, Player } from '@api/types';
import { Button, Badge, PageHeader } from '@shared/components';
import { useAuctionWebSocket } from '@shared/hooks/useAuctionWebSocket';
import { useAppSelector } from '@shared/hooks/redux';
import AppLayout from '@shared/layout/AppLayout';

// Type definitions
interface BidData {
  id: number;
  auction_id: number;
  player_id: number;
  team_id: number;
  bid_amount: number;
  is_winning_bid: boolean;
  created_at: string;
  team?: {
    id: number;
    name: string;
    short_name: string;
  };
  player?: {
    id: number;
    name: string;
    role: string;
  };
}

interface PlayerSoldData {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  final_price: number;
}

interface BudgetUpdateData {
  team_id: number;
  remaining_budget: number;
  current_players: number;
}
import toast from 'react-hot-toast';
import {
  Play,
  Pause,
  StopCircle,
  Gavel,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Wifi,
  WifiOff,
  ChevronRight
} from 'lucide-react';
import axiosInstance from '@api/config/axiosInstance';

export const AdminControl = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bids, setBids] = useState<BidData[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is admin/auctioneer
  useEffect(() => {
    if (user && !['admin', 'auctioneer'].includes(user.role)) {
      toast.error('Access denied. Admin/Auctioneer only.');
      navigate('/auctions');
    }
  }, [user, navigate]);

  // Fetch auction data
  const { data: auctionData, refetch: refetchAuction } = useQuery({
    queryKey: ['auction-admin', id],
    queryFn: async () => {
      const data = await auctionService.getAuctionById(Number(id));
      setAuction(data);
      if (data.current_player_id) {
        setSelectedPlayerId(data.current_player_id);
      }
      return data;
    },
    enabled: !!id,
    refetchInterval: 5000
  });

  // Fetch players
  const { data: playersData, refetch: refetchPlayers } = useQuery({
    queryKey: ['players-admin', id],
    queryFn: async () => {
      const data = await playerService.getPlayers(0, 1000);
      // Filter players for this auction
      const auctionPlayers = data.filter((p: Player) => p.auction_id === Number(id));
      setPlayers(auctionPlayers);
      return auctionPlayers;
    },
    enabled: !!id
  });

  // Fetch teams
  const { data: teamsData, refetch: refetchTeams } = useQuery({
    queryKey: ['teams-admin', id],
    queryFn: async () => {
      const data = await teamService.getTeams(0, 100);
      // Filter teams for this auction
      const auctionTeams = data.filter((t: Team) => t.auction_id === Number(id));
      setTeams(auctionTeams);
      return auctionTeams;
    },
    enabled: !!id
  });

  // Fetch current player
  useEffect(() => {
    if (auction?.current_player_id) {
      playerService.getPlayerById(auction.current_player_id).then(setCurrentPlayer);
    } else {
      setCurrentPlayer(null);
    }
  }, [auction?.current_player_id]);

  // WebSocket connection
  const { isConnected } = useAuctionWebSocket({
    auctionId: Number(id),
    enabled: true,
    onConnected: () => {
      console.log('Admin connected to auction');
    },
    onNewBid: (data: BidData) => {
      setBids((prev) => [data, ...prev]);
      refetchTeams();
    },
    onBidPlaced: (data: BidData) => {
      setBids((prev) => [data, ...prev]);
    },
    onPlayerSold: (data: PlayerSoldData) => {
      toast.success(`${data.player_name} sold!`);
      setBids([]);
      refetchPlayers();
      refetchTeams();
      refetchAuction();
    },
    onPlayerUnsold: (data) => {
      toast(`${data.player_name} marked unsold`);
      setBids([]);
      refetchPlayers();
    },
    onBudgetUpdate: (data: BudgetUpdateData) => {
      setTeams(prev => prev.map(t =>
        t.id === data.team_id
          ? { ...t, remaining_budget: data.remaining_budget, current_players: data.current_players }
          : t
      ));
    }
  });

  const handleStartAuction = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/auctions/${id}/start`);
      toast.success('Auction started!');
      refetchAuction();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndAuction = async () => {
    if (!confirm('Are you sure you want to end this auction?')) return;

    try {
      setActionLoading(true);
      await axiosInstance.post(`/auctions/${id}/end`);
      toast.success('Auction ended!');
      refetchAuction();
      navigate('/auctions');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to end auction');
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
      await axiosInstance.post(`/auctions/${id}/set-current-player/${selectedPlayerId}`);
      toast.success('Player set for bidding!');
      setBids([]); // Clear previous bids
      refetchAuction();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to set player');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    if (!currentPlayer) return;

    if (!confirm(`Mark ${currentPlayer.name} as SOLD to highest bidder?`)) return;

    try {
      setActionLoading(true);
      await axiosInstance.post(`/auctions/${id}/players/${currentPlayer.id}/mark-sold`);
      toast.success(`${currentPlayer.name} marked as sold!`);
      refetchPlayers();
      refetchTeams();
      refetchAuction();
      setBids([]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to mark as sold');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;

    if (!confirm(`Mark ${currentPlayer.name} as UNSOLD?`)) return;

    try {
      setActionLoading(true);
      await axiosInstance.post(`/auctions/${id}/players/${currentPlayer.id}/mark-unsold`);
      toast.success(`${currentPlayer.name} marked as unsold`);
      refetchPlayers();
      refetchAuction();
      setBids([]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to mark as unsold');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      const crores = amount / 10000000;
      return `${crores.toFixed(crores % 1 === 0 ? 0 : 1)} cr`;
    } else if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)} lakh`;
    } else {
      return `${(amount / 1000).toFixed(0)}k`;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!auction) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-text-main">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const unsoldPlayers = players.filter(p => !p.is_sold);
  const soldPlayers = players.filter(p => p.is_sold);
  const highestBid = bids.length > 0 ? bids[0] : null;

  return (
    <AppLayout>
      <PageHeader
        title={`Admin Control - ${auction.title}`}
        subtitle="Manage live auction bidding"
        breadcrumbs={[
          { label: 'Auctions', path: '/auctions' },
          { label: auction.title, path: `/auctions/${id}/live` },
          { label: 'Admin Control' }
        ]}
      />

      <div className="space-y-6">
        {/* Control Panel Header */}
        <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge variant={auction.status === 'active' ? 'default' : 'secondary'} className={auction.status === 'active' ? 'bg-green-500' : ''}>
                {auction.status.toUpperCase()}
              </Badge>
              {isConnected ? (
                <Badge variant="default" className="bg-blue-500 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Disconnected
                </Badge>
              )}
              <span className="text-sm text-text-muted">
                {soldPlayers.length} / {players.length} players sold
              </span>
            </div>

            <div className="flex gap-3">
              {auction.status === 'upcoming' && (
                <Button
                  onClick={handleStartAuction}
                  loading={actionLoading}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Auction
                </Button>
              )}

              {auction.status === 'active' && (
                <Button
                  onClick={handleEndAuction}
                  variant="destructive"
                  loading={actionLoading}
                  className="flex items-center gap-2"
                >
                  <StopCircle className="w-4 h-4" />
                  End Auction
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate(`/auctions/${id}/live`)}
              >
                View Live Page
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Player Selection */}
            <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
              <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Select Player for Bidding
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-main mb-2 block">
                    Choose Player ({unsoldPlayers.length} unsold)
                  </label>
                  <select
                    value={selectedPlayerId || ''}
                    onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Select a player --</option>
                    {unsoldPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} - {player.role} - ₹{formatCurrency(player.base_price)}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleSetCurrentPlayer}
                  loading={actionLoading}
                  disabled={!selectedPlayerId || actionLoading}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <ChevronRight className="w-5 h-5" />
                  Set as Current Player
                </Button>
              </div>
            </div>

            {/* Current Player Display */}
            {currentPlayer && (
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
                <h3 className="text-xl font-bold text-text-main mb-4">Current Player</h3>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary rounded-xl p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-text-main">{currentPlayer.name}</h4>
                      <p className="text-text-muted mt-1">{currentPlayer.country}</p>
                    </div>
                    <Badge variant="default">{currentPlayer.role}</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-text-muted">Age</p>
                      <p className="font-semibold text-text-main">{currentPlayer.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Batting</p>
                      <p className="font-semibold text-text-main text-sm">{currentPlayer.batting_style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Bowling</p>
                      <p className="font-semibold text-text-main text-sm">{currentPlayer.bowling_style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Base Price</p>
                      <p className="font-semibold text-text-main">₹{formatCurrency(currentPlayer.base_price)}</p>
                    </div>
                  </div>

                  {highestBid && (
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-text-muted">Highest Bid</p>
                      </div>
                      <p className="text-3xl font-bold text-primary">₹{formatCurrency(highestBid.bid_amount)}</p>
                      <p className="text-sm mt-1 text-text-main">by <span className="font-semibold">{highestBid.team?.name}</span></p>
                    </div>
                  )}

                  {!highestBid && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-text-muted">No bids yet. Waiting for teams to bid...</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleMarkSold}
                    loading={actionLoading}
                    disabled={!highestBid || actionLoading}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark SOLD
                  </Button>
                  <Button
                    onClick={handleMarkUnsold}
                    loading={actionLoading}
                    disabled={actionLoading}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark UNSOLD
                  </Button>
                </div>
              </div>
            )}

            {/* Bid History */}
            {currentPlayer && (
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
                <h3 className="text-xl font-bold text-text-main mb-4">Live Bids</h3>
                {bids.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No bids yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bids.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex justify-between items-center p-4 rounded-xl ${
                          index === 0
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500'
                            : 'bg-background-light'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? 'default' : 'secondary'} className={index === 0 ? 'bg-green-500' : ''}>
                            {index === 0 ? 'Winning' : `#${index + 1}`}
                          </Badge>
                          <div>
                            <p className="font-semibold text-text-main">{bid.team?.name || 'Unknown'}</p>
                            <p className="text-xs text-text-muted">{formatTime(bid.created_at)}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-primary">₹{formatCurrency(bid.bid_amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Teams */}
          <div className="space-y-6">
            <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft sticky top-6">
              <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teams Status
              </h3>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl border border-border-light bg-background-light"
                  >
                    <p className="font-bold text-text-main mb-2">{team.name}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Budget:</span>
                        <span className="font-semibold text-green-600">
                          ₹{formatCurrency(team.remaining_budget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Players:</span>
                        <span className="font-semibold text-text-main">
                          {team.current_players} / {team.max_players}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Overseas:</span>
                        <span className="font-semibold text-text-main">
                          {team.overseas_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
