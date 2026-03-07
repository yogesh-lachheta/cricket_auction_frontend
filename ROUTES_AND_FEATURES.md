# Cricket Auction Platform - Frontend Routes & Features

## Server Information
- **Frontend Server**: http://localhost:3000/
- **Backend API**: http://localhost:8000/api/v1
- **WebSocket**: ws://localhost:8000/ws

---

## Authentication Routes (Public)

### `/login`
- Manual login with username/password
- OAuth placeholders (Google, Microsoft)
- Redirects to `/dashboard` after successful login

### `/signup`
- Registration form with:
  - Email, Username, Password
  - Full Name, Mobile (optional)
  - Role selection (viewer, team_owner, auctioneer, admin)
- Redirects to `/verify-otp` after registration

### `/verify-otp`
- Dual OTP verification (Email + Mobile)
- Resend OTP functionality with 60s timer
- Auto-login after verification complete

---

## Protected Routes (Login Required)

### `/dashboard`
- **Access**: All authenticated users
- **Features**:
  - User profile display
  - Role badge
  - Quick action buttons (role-based)
  - Stats cards (Active auctions, Total players, My teams)
  - Platform features overview

---

## Player Management Routes

### `/players`
- **Access**: All authenticated users
- **Features**:
  - View all players in grid layout
  - Filter tabs: All / Available / Sold
  - Player cards showing:
    - Name, Country, Age, Role
    - Batting & Bowling style
    - Base price and final price (if sold)
    - Status badge (Sold/Available)
  - Edit/Delete buttons (for Auctioneer/Admin only)

### `/players/create`
- **Access**: Auctioneer, Admin
- **Features**:
  - Form with Formik + Yup validation
  - Fields:
    - Player name
    - Age (16-50)
    - Role (Batsman, Bowler, All-Rounder, Wicket-Keeper)
    - Batting style dropdown
    - Bowling style dropdown
    - Country
    - Base price (₹)
  - Cancel button returns to player list

### `/players/:id/edit`
- **Access**: Auctioneer, Admin
- **Features**:
  - Pre-filled form with player data
  - Same fields as create
  - Update player details
  - Cancel button returns to player list

---

## Team Management Routes

### `/teams`
- **Access**: All authenticated users
- **Features**:
  - View all teams in grid layout
  - Team cards showing:
    - Team name, Owner name
    - Purse remaining
    - Players count (x / max)
    - Progress bar for squad completion
    - "My Team" badge for owned teams
  - Click card to view team details
  - Delete button (for Team Owner/Admin)

### `/teams/create`
- **Access**: Team Owner, Admin
- **Features**:
  - Create new team form
  - Fields:
    - Team name
    - Owner (auto-filled from current user)
    - Purse amount (₹)
    - Maximum players
  - Team summary preview
  - Currency formatting for purse

### `/teams/:id`
- **Access**: All authenticated users
- **Features**:
  - Team header with name and owner
  - Team stats dashboard:
    - Purse remaining
    - Total spent
    - Players acquired
  - Squad completion progress bar
  - Full squad player list with:
    - Player avatar
    - Name, Role, Country
    - Purchase price
  - Squad composition breakdown by role

---

## Auction Management Routes

### `/auctions`
- **Access**: All authenticated users
- **Features**:
  - View all auctions in grid layout
  - Auction cards showing:
    - Auction name
    - Status badge (Pending, Active, Paused, Completed)
    - Start/End time
    - Current player (if any)
  - Action buttons:
    - "Join Live" (for active auctions)
    - "Configure" (for Auctioneer/Admin)
    - "Delete" (for pending auctions, Auctioneer/Admin only)

### `/auctions/create`
- **Access**: Auctioneer, Admin
- **Features**:
  - Create new auction form
  - Fields:
    - Auction name
    - Start date & time (datetime-local input)
    - End date & time (optional)
  - Auction details preview
  - Date/time formatting

### `/auctions/:id/configure`
- **Access**: Auctioneer, Admin
- **Features**:
  - Auction control panel
  - Display:
    - Auction name and status
    - Start/End time
    - Current player
  - Controls (based on status):
    - **Pending**: "Start Auction" button
    - **Active**: "Pause Auction" + "End Auction" buttons
    - **Paused**: "Resume Auction" + "End Auction" buttons
    - **Completed**: Status message
  - Set current player:
    - Dropdown of available players
    - Shows player name, role, base price
    - Update current player for bidding

### `/auctions/:id/live`
- **Access**: All authenticated users
- **Features**:
  - **Real-time bidding interface** with WebSocket
  - Connection status indicators
  - Main content:
    - Current player card:
      - Name, Country, Role
      - Age, Batting, Bowling, Base price
      - Current highest bid (highlighted)
      - Team name of highest bidder
    - Bid placement form (for team owners):
      - Team selection dropdown (shows purse)
      - Bid amount input
      - Quick increment buttons (+50K, +1L, +5L)
      - "Place Bid" button
    - Bid history:
      - All bids for current player
      - Sorted by amount (highest first)
      - Shows team name, bid amount, timestamp
      - "Highest" badge for winning bid
  - Sidebar:
    - All teams list
    - Shows purse remaining
    - Shows players count
  - Real-time updates:
    - New bids appear instantly
    - Toast notifications for bids and player sold
    - Auto-refresh team purse

---

## Features Implementation

### 1. Authentication & Authorization
- JWT token-based authentication
- Tokens stored in localStorage
- Auto token attachment via Axios interceptors
- Auto-logout on 401 (token expiration)
- Protected routes with ProtectedRoute component
- Role-based access control (RBAC)
- Permission system (resource:action pattern)

### 2. Role-Based Access Control (RBAC)
**Roles**:
- `viewer`: Can view auctions, players, teams
- `team_owner`: Can create teams, place bids
- `auctioneer`: Can manage players and auctions
- `admin`: Full access to all features

**Permissions**:
- `auctions:read`, `auctions:create`, `auctions:update`, etc.
- `players:read`, `players:create`, `players:update`, etc.
- `teams:read`, `teams:create`, `teams:update`, etc.
- `bids:read`, `bids:create`
- Wildcard permissions: `auctions:*` (all auction permissions)

### 3. Feature Flags
- `LIVE_BIDDING`: Enable/disable live bidding (enabled)
- `OAUTH_LOGIN`: Enable/disable OAuth login (disabled - coming soon)
- `REAL_TIME_NOTIFICATIONS`: Enable/disable WebSocket notifications (enabled)
- Role-based flag access control

### 4. Real-time WebSocket Integration
**Message Types**:
- `BID_PLACED`: New bid placed on current player
- `PLAYER_SOLD`: Player sold to team
- `AUCTION_UPDATED`: Auction status or current player changed
- `AUCTION_STARTED`: Auction started
- `AUCTION_ENDED`: Auction ended
- `AUCTION_PAUSED`: Auction paused
- `AUCTION_RESUMED`: Auction resumed

**Features**:
- Auto-reconnect (5 attempts)
- Connection status indicator
- Toast notifications for all events
- Automatic data refresh on events

### 5. Form Validation
- **Library**: Formik + Yup
- **Validation**:
  - Required fields
  - Min/max length
  - Email format
  - Password strength
  - Number ranges (age, price, etc.)
  - Custom validators (e.g., end time > start time)
- **Error Display**: Field-level error messages

### 6. API Integration
- **Base URL**: Environment variable (VITE_API_BASE_URL) or default
- **Timeout**: 30 seconds
- **Request Interceptor**: Auto-attach JWT token
- **Response Interceptor**:
  - 401: Auto-logout and redirect to login
  - 403: Permission denied toast
  - 404: Resource not found toast
  - 422: Validation errors (multiple toasts)
  - 500: Server error toast
  - Network errors: Connection toast

### 7. State Management
- **Library**: Redux Toolkit
- **Slices**:
  - `auth`: User authentication state
    - isAuthenticated, user, token, loading
    - Actions: setCredentials, setUser, logout, setLoading
  - localStorage persistence for auth state

### 8. UI Components
**Custom Components**:
- Button (6 variants, 4 sizes, loading state)
- Input (with label and error)
- Select (Radix UI dropdown)
- Badge (5 variants)
- Dialog (Radix UI modal)
- Checkbox (Radix UI)
- ProtectedRoute (route guard with role checking)

**Styling**:
- Tailwind CSS v4
- Custom theme via @theme directive
- Dark mode support (prefers-color-scheme)
- Responsive grid layouts
- Card-based UI design

### 9. Toast Notifications
- **Library**: react-hot-toast
- **Position**: Top-right
- **Duration**: 3-4 seconds
- **Types**: Success, Error, Info
- Custom styling with dark theme

---

## API Endpoints Used

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/resend-otp` - Resend OTP
- `GET /auth/me` - Get current user

### Players
- `GET /players` - Get all players (with pagination)
- `GET /players/{id}` - Get player by ID
- `POST /players` - Create player
- `PUT /players/{id}` - Update player
- `DELETE /players/{id}` - Delete player
- `GET /players/available` - Get available players
- `GET /players/sold` - Get sold players

### Teams
- `GET /teams` - Get all teams (with pagination)
- `GET /teams/{id}` - Get team by ID
- `POST /teams` - Create team
- `PUT /teams/{id}` - Update team
- `DELETE /teams/{id}` - Delete team
- `GET /teams/my-teams` - Get user's teams
- `GET /teams/{id}/players` - Get team players

### Auctions
- `GET /auctions` - Get all auctions (with pagination)
- `GET /auctions/{id}` - Get auction by ID
- `POST /auctions` - Create auction
- `PUT /auctions/{id}` - Update auction
- `DELETE /auctions/{id}` - Delete auction
- `POST /auctions/{id}/start` - Start auction
- `POST /auctions/{id}/pause` - Pause auction
- `POST /auctions/{id}/resume` - Resume auction
- `POST /auctions/{id}/end` - End auction
- `GET /auctions/active` - Get active auction
- `POST /auctions/{id}/set-player` - Set current player

### Bids
- `GET /bids` - Get all bids (with pagination)
- `GET /bids/{id}` - Get bid by ID
- `POST /bids` - Place bid
- `GET /bids/auction/{auction_id}` - Get bids by auction
- `GET /bids/player/{player_id}` - Get bids by player
- `GET /bids/team/{team_id}` - Get bids by team
- `GET /bids/player/{player_id}/winning` - Get winning bid

---

## Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## Testing Checklist

### Authentication Flow
- [ ] Register new user with different roles
- [ ] Receive OTP emails/SMS
- [ ] Verify OTP (email and mobile)
- [ ] Login with credentials
- [ ] Auto-redirect to dashboard
- [ ] Token persistence (reload page)
- [ ] Auto-logout on token expiration
- [ ] Logout functionality

### Player Management
- [ ] View all players (as any role)
- [ ] Filter players (all/available/sold)
- [ ] Create new player (as auctioneer)
- [ ] Edit player details (as auctioneer)
- [ ] Delete player (as auctioneer)
- [ ] Permission denied for viewer/team_owner

### Team Management
- [ ] View all teams (as any role)
- [ ] Create new team (as team_owner)
- [ ] View team details with squad
- [ ] Delete own team (as team_owner)
- [ ] Permission checks

### Auction Management
- [ ] View all auctions (as any role)
- [ ] Create new auction (as auctioneer)
- [ ] Start auction (as auctioneer)
- [ ] Pause/Resume auction (as auctioneer)
- [ ] End auction (as auctioneer)
- [ ] Set current player (as auctioneer)
- [ ] Delete pending auction (as auctioneer)

### Live Bidding
- [ ] Join active auction
- [ ] WebSocket connection established
- [ ] View current player details
- [ ] Select team to bid with
- [ ] Place bid (purse validation)
- [ ] Receive real-time bid updates
- [ ] View bid history
- [ ] Quick increment buttons
- [ ] Toast notifications for events
- [ ] Purse updates after bids
- [ ] Player sold notification

### RBAC & Permissions
- [ ] Viewer can only view data
- [ ] Team owner can create teams and place bids
- [ ] Auctioneer can manage players and auctions
- [ ] Admin has full access
- [ ] Route guards working correctly
- [ ] Button visibility based on permissions

---

## Known Issues & Limitations

1. **Node.js Version**: Using 20.18.0, but Vite recommends 20.19+ or 22.12+
2. **OAuth**: Google and Microsoft OAuth not yet implemented (placeholders only)
3. **WebSocket**: Backend WebSocket endpoint must be implemented
4. **Email/SMS**: OTP delivery requires backend email/SMS service configuration
5. **Image Uploads**: Player/Team images not implemented

---

## Next Steps

1. **Backend Integration**:
   - Ensure all API endpoints are implemented
   - Configure WebSocket endpoint at `/ws`
   - Set up email/SMS service for OTP

2. **OAuth Implementation**:
   - Create Google OAuth app
   - Create Microsoft OAuth app
   - Implement callback endpoints
   - Update frontend OAuth handlers

3. **Testing**:
   - End-to-end testing with actual backend
   - Cross-browser testing
   - Mobile responsive testing
   - WebSocket connection reliability testing

4. **Enhancements**:
   - Player/Team image uploads
   - Export data to CSV/Excel
   - Auction analytics dashboard
   - Bid history charts
   - Email notifications
   - Dark mode toggle UI

---

## File Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── config/
│   │   │   └── axiosInstance.ts
│   │   ├── services/
│   │   │   ├── playerService.ts
│   │   │   ├── teamService.ts
│   │   │   ├── auctionService.ts
│   │   │   ├── bidService.ts
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login/
│   │   │   ├── Signup/
│   │   │   └── VerifyOTP/
│   │   ├── dashboard/
│   │   ├── players/
│   │   │   ├── PlayerList/
│   │   │   ├── CreatePlayer/
│   │   │   └── EditPlayer/
│   │   ├── teams/
│   │   │   ├── TeamList/
│   │   │   ├── CreateTeam/
│   │   │   └── ViewTeam/
│   │   └── auctions/
│   │       ├── AuctionList/
│   │       ├── CreateAuction/
│   │       ├── ConfigureAuction/
│   │       └── LiveBidding/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Badge/
│   │   │   ├── Dialog/
│   │   │   ├── Checkbox/
│   │   │   └── ProtectedRoute/
│   │   ├── hooks/
│   │   │   ├── redux.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── usePermissions.ts
│   │   │   └── useFeatureFlag.ts
│   │   ├── services/
│   │   │   └── websocketService.ts
│   │   └── utils/
│   │       ├── rbac.ts
│   │       └── featureFlags.ts
│   ├── store/
│   │   ├── slices/
│   │   │   └── authSlice.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.js
└── .env
```

---

**Documentation Complete!** 🚀
