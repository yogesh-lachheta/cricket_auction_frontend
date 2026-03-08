import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionService, teamService, playerService } from '@api/services';
import type { Auction, Team, Player } from '@api/types';
import { Button, Badge, Input } from '@shared/components';
import { useAuctionWebSocket } from '@shared/hooks/useAuctionWebSocket';
import { useAppSelector } from '@shared/hooks/redux';
import toast from 'react-hot-toast';

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
import { Wifi, WifiOff, Gavel, TrendingUp, Users } from 'lucide-react';
import AppLayout from '@shared/layout/AppLayout';

export const LiveBidding = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bids, setBids] = useState<BidData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidLoading, setBidLoading] = useState(false);

  // Fetch auction data
  const { data: auctionData, isLoading: auctionLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const data = await auctionService.getAuctionById(Number(id));
      setAuction(data);
      return data;
    },
    enabled: !!id,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Fetch teams
  const { data: teamsData, refetch: refetchTeams } = useQuery({
    queryKey: ['teams-auction', id],
    queryFn: async () => {
      const data = await teamService.getTeams(0, 100);
      setTeams(data);

      // Find user's team
      if (user) {
        const userTeam = data.find((t: Team) => t.user_id === user.id);
        setMyTeam(userTeam || null);
      }

      return data;
    },
    enabled: !!id
  });

  // Fetch current player
  const { data: playerData } = useQuery({
    queryKey: ['current-player', auction?.current_player_id],
    queryFn: async () => {
      if (!auction?.current_player_id) return null;
      const data = await playerService.getPlayerById(auction.current_player_id);
      setCurrentPlayer(data);

      // Set initial bid amount
      const basePrice = data.base_price || 0;
      setBidAmount(basePrice);

      return data;
    },
    enabled: !!auction?.current_player_id
  });

  // WebSocket connection
  const { isConnected, placeBid } = useAuctionWebSocket({
    auctionId: Number(id),
    enabled: true,
    onConnected: () => {
      toast.success('Connected to live auction');
    },
    onDisconnected: () => {
      toast.error('Disconnected from auction');
    },
    onNewBid: (data: BidData) => {
      console.log('New bid received:', data);
      // Add bid to history
      setBids((prev) => [data, ...prev]);

      // Update bid amount to be higher than current
      if (data.bid_amount) {
        setBidAmount(data.bid_amount + 500000); // +50 lakh
      }

      // Refetch teams to update budgets
      refetchTeams();
    },
    onBidPlaced: (data: BidData) => {
      console.log('Your bid placed:', data);
      toast.success(`Bid placed: ₹${formatCurrency(data.bid_amount)}`);
      setBids((prev) => [data, ...prev]);
      refetchTeams();
    },
    onPlayerSold: (data: PlayerSoldData) => {
      toast.success(`${data.player_name} sold to ${data.team_name} for ₹${formatCurrency(data.final_price)}!`, {
        duration: 5000
      });
      // Clear bids and wait for next player
      setBids([]);
      setCurrentPlayer(null);
      refetchTeams();
    },
    onPlayerUnsold: (data) => {
      toast(`${data.player_name} went unsold`, {
        icon: '🚫'
      });
      setBids([]);
      setCurrentPlayer(null);
    },
    onBudgetUpdate: (data: BudgetUpdateData) => {
      // Update team in local state
      setTeams(prev => prev.map(t =>
        t.id === data.team_id
          ? { ...t, remaining_budget: data.remaining_budget, current_players: data.current_players }
          : t
      ));

      // Update myTeam if it's the updated team
      if (myTeam && myTeam.id === data.team_id) {
        setMyTeam({ ...myTeam, remaining_budget: data.remaining_budget, current_players: data.current_players });
      }
    },
    onError: (error) => {
      toast.error(`WebSocket error: ${error}`);
    }
  });

  const handlePlaceBid = async () => {
    if (!currentPlayer || !myTeam) {
      toast.error('Cannot place bid at this time');
      return;
    }

    // Validate budget
    if (bidAmount > myTeam.remaining_budget) {
      toast.error(`Insufficient budget! You have ₹${formatCurrency(myTeam.remaining_budget)} remaining`);
      return;
    }

    // Validate minimum increment
    if (bidAmount % 500000 !== 0) {
      toast.error('Bid amount must be in multiples of ₹50 lakh');
      return;
    }

    // Validate against current highest bid
    const highestBid = bids.length > 0 ? bids[0].bid_amount : currentPlayer.base_price;
    if (bidAmount <= highestBid) {
      toast.error(`Bid must be higher than ₹${formatCurrency(highestBid)}`);
      return;
    }

    try {
      setBidLoading(true);
      placeBid(currentPlayer.id, myTeam.id, bidAmount);
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(error?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
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

  if (auctionLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-text-main">Loading live auction...</div>
        </div>
      </AppLayout>
    );
  }

  if (!auction || auction.status !== 'active') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4 text-text-main">This auction is not active</p>
            <Button onClick={() => navigate('/auctions')}>
              Back to Auctions
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const highestBid = bids.length > 0 ? bids[0] : null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background-light">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border-light shadow-soft">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-text-main flex items-center gap-3">
                  <Gavel className="w-6 h-6 text-primary" />
                  {auction.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="bg-green-500">
                    LIVE
                  </Badge>
                  {isConnected ? (
                    <Badge variant="default" className="bg-blue-500 flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      Connecting...
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/auctions')}>
                Exit Auction
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Current Player & Bidding */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Player Card */}
              {currentPlayer ? (
                <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-text-main">{currentPlayer.name}</h2>
                      <p className="text-text-muted mt-1">{currentPlayer.country}</p>
                    </div>
                    <Badge variant="default" className="text-base px-4 py-1">
                      {currentPlayer.role}
                    </Badge>
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-background-light rounded-xl">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Age</p>
                      <p className="font-semibold text-text-main">{currentPlayer.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Batting</p>
                      <p className="font-semibold text-text-main text-sm">{currentPlayer.batting_style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Bowling</p>
                      <p className="font-semibold text-text-main text-sm">{currentPlayer.bowling_style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">Base Price</p>
                      <p className="font-semibold text-text-main">₹{formatCurrency(currentPlayer.base_price)}</p>
                    </div>
                  </div>

                  {/* Current Highest Bid */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <p className="text-sm font-medium text-text-muted">Current Highest Bid</p>
                    </div>
                    <p className="text-4xl font-bold text-primary">
                      ₹{highestBid ? formatCurrency(highestBid.bid_amount) : formatCurrency(currentPlayer.base_price)}
                    </p>
                    {highestBid && highestBid.team && (
                      <p className="text-sm mt-2 text-text-main">
                        by <span className="font-semibold">{highestBid.team.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Bidding Controls */}
                  {myTeam ? (
                    <div className="space-y-4 p-4 bg-background-light rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-text-muted">Your Team</p>
                          <p className="font-bold text-text-main">{myTeam.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-muted">Remaining Budget</p>
                          <p className="font-bold text-green-600">₹{formatCurrency(myTeam.remaining_budget)}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-text-main mb-2 block">
                          Your Bid Amount
                        </label>
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          step={500000}
                          min={currentPlayer.base_price}
                          className="text-lg font-bold"
                        />
                      </div>

                      {/* Quick Increment Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          onClick={() => setBidAmount((prev) => prev + 500000)}
                          variant="outline"
                          size="sm"
                        >
                          +50L
                        </Button>
                        <Button
                          onClick={() => setBidAmount((prev) => prev + 1000000)}
                          variant="outline"
                          size="sm"
                        >
                          +1Cr
                        </Button>
                        <Button
                          onClick={() => setBidAmount((prev) => prev + 2000000)}
                          variant="outline"
                          size="sm"
                        >
                          +2Cr
                        </Button>
                        <Button
                          onClick={() => setBidAmount((prev) => prev + 5000000)}
                          variant="outline"
                          size="sm"
                        >
                          +5Cr
                        </Button>
                      </div>

                      <Button
                        onClick={handlePlaceBid}
                        loading={bidLoading}
                        disabled={bidLoading || !isConnected}
                        size="lg"
                        className="w-full text-lg"
                      >
                        Place Bid - ₹{formatCurrency(bidAmount)}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-background-light rounded-xl">
                      <p className="text-text-muted mb-4">
                        You need to create a team to participate in bidding
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/teams/create')}
                      >
                        Create Team
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-border-light rounded-2xl p-12 text-center shadow-soft">
                  <Gavel className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-lg text-text-muted">
                    Waiting for auctioneer to select a player...
                  </p>
                </div>
              )}

              {/* Bid History */}
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft">
                <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Bidding History
                </h3>
                {bids.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No bids yet. Be the first to bid!</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bids.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                          index === 0
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500'
                            : 'bg-background-light'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={index === 0 ? 'default' : 'secondary'}
                            className={index === 0 ? 'bg-green-500' : ''}
                          >
                            {index === 0 ? 'Winning' : `#${index + 1}`}
                          </Badge>
                          <div>
                            <p className="font-semibold text-text-main">{bid.team?.name || 'Unknown Team'}</p>
                            <p className="text-xs text-text-muted">
                              {formatTime(bid.created_at)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-primary">₹{formatCurrency(bid.bid_amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Teams Standings */}
            <div className="space-y-6">
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-soft sticky top-24">
                <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Teams Standings
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {teams.map((team) => {
                    const isMyTeam = myTeam?.id === team.id;
                    return (
                      <div
                        key={team.id}
                        className={`p-4 rounded-xl transition-all ${
                          isMyTeam
                            ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary'
                            : 'border border-border-light bg-background-light'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-text-main">{team.name}</p>
                          {isMyTeam && <Badge variant="default">You</Badge>}
                        </div>
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
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
