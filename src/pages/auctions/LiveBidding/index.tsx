import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auctionService, bidService, teamService } from '@api/services';
import type { Auction, Bid, Team } from '@api/types';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Input } from '@shared/components/Input';
import { Select } from '@shared/components/Select';
import { useWebSocket } from '@shared/hooks/useWebSocket';
import { useAppSelector } from '@shared/hooks/redux';
import toast from 'react-hot-toast';

export const LiveBidding = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket();

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [auctionData, teamsData] = await Promise.all([
        auctionService.getAuctionById(Number(id)),
        teamService.getTeams(0, 100),
      ]);

      setAuction(auctionData);
      setTeams(teamsData.items);

      // Filter user's teams
      if (user) {
        const userTeams = teamsData.items.filter((t) => t.owner_id === user.id);
        setMyTeams(userTeams);
        if (userTeams.length > 0) {
          setSelectedTeamId(String(userTeams[0].id));
        }
      }

      // Fetch bids if current player exists
      if (auctionData.current_player_id) {
        const bidsData = await bidService.getBidsByPlayer(auctionData.current_player_id);
        setBids(bidsData);

        // Set initial bid amount (base price or highest bid + increment)
        const highestBid = bidsData.length > 0 ? Math.max(...bidsData.map((b) => b.amount)) : 0;
        const basePrice = auctionData.current_player?.base_price || 0;
        setBidAmount(Math.max(highestBid + 50000, basePrice));
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
      toast.error('Failed to load auction');
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

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'BID_PLACED':
        // Add new bid to the list
        const newBid: Bid = lastMessage.data;
        setBids((prev) => [newBid, ...prev]);

        // Update bid amount
        setBidAmount(newBid.amount + 50000);

        // Refresh teams to update purse
        teamService.getTeams(0, 100).then((data) => setTeams(data.items));
        break;

      case 'PLAYER_SOLD':
        toast.success(`${lastMessage.data.playerName} sold for ₹${lastMessage.data.amount}!`);
        // Refresh auction data
        fetchData();
        break;

      case 'AUCTION_UPDATED':
        // Refresh auction data when current player changes
        fetchData();
        break;

      case 'AUCTION_ENDED':
        toast('Auction has ended', {
          icon: 'ℹ️',
        });
        navigate('/auctions');
        break;
    }
  }, [lastMessage]);

  const handlePlaceBid = async () => {
    if (!auction?.current_player_id || !selectedTeamId) {
      toast.error('Please select a team');
      return;
    }

    const selectedTeam = teams.find((t) => t.id === Number(selectedTeamId));
    if (!selectedTeam) return;

    // Validate purse
    if (bidAmount > selectedTeam.purse_remaining) {
      toast.error('Insufficient purse amount!');
      return;
    }

    // Validate bid amount
    const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;
    const basePrice = auction.current_player.base_price;

    if (bidAmount < basePrice) {
      toast.error(`Bid must be at least ₹${basePrice.toLocaleString('en-IN')}`);
      return;
    }

    if (bidAmount <= highestBid) {
      toast.error(`Bid must be higher than current bid of ₹${highestBid.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setBidLoading(true);
      await bidService.placeBid({
        auction_id: Number(id),
        player_id: auction.current_player_id,
        team_id: Number(selectedTeamId),
        amount: bidAmount,
      });

      toast.success('Bid placed successfully!');
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(error.response?.data?.detail || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading live auction...</div>
      </div>
    );
  }

  if (!auction || auction.status !== 'active') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">This auction is not active</p>
          <Button onClick={() => navigate('/auctions')}>
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  const currentPlayer = auction.current_player;
  const highestBid = bids.length > 0 ? bids[0] : null;
  const teamOptions = myTeams.map((team) => ({
    value: String(team.id),
    label: `${team.name} (${formatCurrency(team.purse_remaining)})`,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{auction.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success">LIVE</Badge>
            {isConnected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="warning">Connecting...</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/auctions')}>
          Exit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Current Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Player Card */}
          {currentPlayer ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{currentPlayer.name}</h2>
                  <p className="text-muted-foreground">{currentPlayer.country}</p>
                </div>
                <Badge variant="default">{currentPlayer.role}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{currentPlayer.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batting</p>
                  <p className="font-semibold text-sm">{currentPlayer.batting_style}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bowling</p>
                  <p className="font-semibold text-sm">{currentPlayer.bowling_style}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-semibold">{formatCurrency(currentPlayer.base_price)}</p>
                </div>
              </div>

              {/* Current Bid */}
              <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Current Highest Bid</p>
                <p className="text-3xl font-bold text-primary">
                  {highestBid ? formatCurrency(highestBid.amount) : formatCurrency(currentPlayer.base_price)}
                </p>
                {highestBid && highestBid.team && (
                  <p className="text-sm mt-1">by {highestBid.team.name}</p>
                )}
              </div>

              {/* Bid Form */}
              {myTeams.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Team</label>
                    <Select
                      value={selectedTeamId}
                      onValueChange={setSelectedTeamId}
                      options={teamOptions}
                      placeholder="Select your team"
                    />
                  </div>

                  <Input
                    type="number"
                    label="Bid Amount (₹)"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    step={50000}
                    min={currentPlayer.base_price}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setBidAmount((prev) => prev + 50000)}
                      variant="outline"
                      size="sm"
                    >
                      +50K
                    </Button>
                    <Button
                      onClick={() => setBidAmount((prev) => prev + 100000)}
                      variant="outline"
                      size="sm"
                    >
                      +1L
                    </Button>
                    <Button
                      onClick={() => setBidAmount((prev) => prev + 500000)}
                      variant="outline"
                      size="sm"
                    >
                      +5L
                    </Button>
                  </div>

                  <Button
                    onClick={handlePlaceBid}
                    loading={bidLoading}
                    disabled={bidLoading}
                    size="lg"
                    className="w-full"
                  >
                    Place Bid - {formatCurrency(bidAmount)}
                  </Button>
                </div>
              )}

              {myTeams.length === 0 && (
                <div className="text-center py-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    You need to create a team to participate in bidding
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/teams/create')}
                    className="mt-2"
                  >
                    Create Team
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-lg text-muted-foreground">
                Waiting for auctioneer to select a player...
              </p>
            </div>
          )}

          {/* Bid History */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Bidding History</h3>
            {bids.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'success' : 'secondary'}>
                        {index === 0 ? 'Highest' : `#${index + 1}`}
                      </Badge>
                      <div>
                        <p className="font-semibold">{bid.team?.name || 'Unknown Team'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(bid.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(bid.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Teams */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Teams</h3>
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-3 border border-border rounded-lg"
                >
                  <p className="font-semibold">{team.name}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Purse:</span>
                    <span className="font-medium">
                      {formatCurrency(team.purse_remaining)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium">
                      {team.players?.length || 0} / {team.max_players}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
