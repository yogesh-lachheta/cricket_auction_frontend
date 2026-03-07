import { useAppSelector } from '@shared/hooks/redux';
import { Button } from '@shared/components';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@shared/layout/AppLayout';
import {
  Trophy,
  Users,
  Target,
  Gavel,
  Plus,
  UserPlus,
  FileText,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'View Auctions',
      description: 'Browse all auctions',
      icon: Gavel,
      onClick: () => navigate('/auctions'),
      color: 'bg-primary',
      show: true,
    },
    {
      title: 'View Players',
      description: 'Browse all players',
      icon: Users,
      onClick: () => navigate('/players'),
      color: 'bg-secondary',
      show: true,
    },
    {
      title: 'View Teams',
      description: 'Browse all teams',
      icon: Target,
      onClick: () => navigate('/teams'),
      color: 'bg-accent-teal',
      show: true,
    },
    {
      title: 'Create Team',
      description: 'Start your team',
      icon: Plus,
      onClick: () => navigate('/teams/create'),
      color: 'bg-accent-yellow',
      show: user?.role === 'team_owner' || user?.role === 'admin',
    },
    {
      title: 'Add Player',
      description: 'Add new player',
      icon: UserPlus,
      onClick: () => navigate('/players/create'),
      color: 'bg-primary',
      show: user?.role === 'auctioneer' || user?.role === 'admin',
    },
    {
      title: 'Create Auction',
      description: 'Start new auction',
      icon: Trophy,
      onClick: () => navigate('/auctions/create'),
      color: 'bg-accent-coral',
      show: user?.role === 'auctioneer' || user?.role === 'admin',
    },
  ];

  const stats = [
    {
      title: 'Active Auctions',
      value: '0',
      icon: Gavel,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Players',
      value: '0',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'My Teams',
      value: '0',
      icon: Target,
      color: 'text-accent-teal',
      bgColor: 'bg-accent-teal/10',
    },
    {
      title: 'Total Bids',
      value: '0',
      icon: TrendingUp,
      color: 'text-accent-yellow',
      bgColor: 'bg-accent-yellow/10',
    },
  ];

  return (
    <AppLayout>
        {/* Welcome Section */}
        <div className="mb-8 animate-cardEntrance">
          <h2 className="text-3xl font-bold text-text-main mb-2">
            Welcome back, {user?.full_name}! 👋
          </h2>
          <p className="text-text-muted">
            You're logged in as{' '}
            <span className="font-semibold text-text-main">{user?.role}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-md transition-all duration-200 animate-cardEntrance"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-text-muted mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-text-main">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-text-main mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions
              .filter((action) => action.show)
              .map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-md transition-all duration-200 text-left group animate-cardEntrance"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${action.color} bg-opacity-10 group-hover:bg-opacity-100 transition-all duration-200`}
                    >
                      <action.icon
                        className={`w-6 h-6 ${action.color.replace('bg-', 'text-')} group-hover:text-white transition-colors duration-200`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-text-main mb-1">
                        {action.title}
                      </h4>
                      <p className="text-sm text-text-muted">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Features Card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 shadow-glow text-white animate-cardEntrance">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Platform Features</h3>
              <p className="text-primary-light text-sm">
                Everything you need for a successful auction
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-semibold">Live Bidding</p>
                <p className="text-sm text-primary-light">
                  Real-time auction with WebSocket support
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-semibold">Team Management</p>
                <p className="text-sm text-primary-light">
                  Create and manage your teams efficiently
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-semibold">Player Database</p>
                <p className="text-sm text-primary-light">
                  Comprehensive player profiles and stats
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-semibold">Real-time Notifications</p>
                <p className="text-sm text-primary-light">
                  Get instant updates on bids and auctions
                </p>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  );
};

export default Dashboard;
