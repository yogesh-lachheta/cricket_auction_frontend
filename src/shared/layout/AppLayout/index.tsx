import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy,
  Users,
  Target,
  Gavel,
  Menu,
  X,
} from 'lucide-react';
import { Button, Breadcrumb, UserDropdown } from '@shared/components';
import type { BreadcrumbItem } from '@shared/components';

type AppLayoutProps = {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
};

export const AppLayout = ({ children, breadcrumbs }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Trophy },
    { path: '/auctions', label: 'Auctions', icon: Gavel },
    { path: '/players', label: 'Players', icon: Users },
    { path: '/teams', label: 'Teams', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-soft border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-text-main leading-tight">
                  Cricket Auction
                </h1>
                <p className="text-xs text-text-muted leading-tight">
                  Live Bidding Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* User Dropdown (Desktop) */}
              <div className="hidden sm:block">
                <UserDropdown />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border-light animate-slideInUp">
              <div className="space-y-2 mb-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-border-light sm:hidden">
                <UserDropdown />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
