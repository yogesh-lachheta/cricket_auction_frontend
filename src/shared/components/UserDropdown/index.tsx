import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { logout } from '@store/slices/authSlice';
import { Badge } from '@shared/components';

export const UserDropdown = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'auctioneer':
        return 'destructive';
      case 'team_owner':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background-light transition-all duration-200"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-xl font-semibold text-sm">
          {getInitials(user.full_name)}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-text-main leading-tight">
            {user.full_name}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-md border border-border-light overflow-hidden z-50 animate-slideInUp">
          {/* User Info */}
          <div className="p-4 border-b border-border-light bg-background-light">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-xl font-semibold">
                {getInitials(user.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background-light transition-colors text-left"
            >
              <User className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-main">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
