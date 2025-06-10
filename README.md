# Fashion App Frontend

## Overview
React-based frontend for the Fashion Shopping Platform MVP. Currently implements complete user authentication flow with plans for comprehensive e-commerce functionality.

### Current Features (Phase 1 - Authentication) ✅
- **User Registration** with email/password validation
- **OTP Email Verification** with JWT token handling  
- **User Login** with persistent authentication
- **Public Landing Page** with auth-aware navigation
- **Session Management** with localStorage and React Context

### Planned Features (Phase 2+) 🚧
- Shopper flows (Product Search, Cart/Checkout, Order Tracking)
- Vendor flows (Vendor Onboarding, Inventory Management)  
- Admin flows (User Management, Revenue Reporting)

## Tech Stack
- **React.js** (>=18) with functional components and hooks
- **Tailwind CSS** for responsive styling
- **React Router** (v6) for navigation
- **Context API** for global state management
- **JWT** authentication with localStorage persistence
- **Jest & React Testing Library** for unit tests

## Architecture
```
src/
├── components/
│   ├── Auth/           # Authentication components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx  
│   │   ├── OTPInput.jsx
│   │   └── PasswordInput.jsx
│   └── Common/         # Reusable UI components
├── contexts/           # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/              # Route-level components  
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── OTPPage.jsx
├── services/           # API integration
│   └── authService.js
└── App.jsx            # Main app with routing
```

## Getting Started

### Prerequisites
- Node.js (>=16)
- npm or yarn
- Backend API running on `localhost:3002`

### Installation
```bash
# Clone the repository
git clone git@github.com:Fashion-App-NG/frontend.git
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npm start
# or  
yarn start
```

### Environment Variables
Create `.env.local` in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:3002/api
REACT_APP_ENV=development
```

## Current Authentication Flow

### User Journey
```
New User: HomePage → Register → OTP Verification → Login → Authenticated Homepage
Returning User: HomePage → Login → Authenticated Homepage
```

### API Integration
- **POST** `/auth/register` - User registration with JWT response
- **POST** `/auth/verify-otp` - Email verification (userId + 6-digit code)
- **POST** `/auth/login` - User authentication
- **POST** `/auth/resend-otp` - Resend verification code

### Key Components

#### RegisterForm.jsx
- Email/password validation with repeat password confirmation
- JWT token extraction for OTP verification
- Session storage management for verification flow
- Terms of service acceptance
- Error handling for duplicate accounts and delivery failures

#### LoginForm.jsx  
- Email/password authentication
- JWT token storage and user context updates
- Success message handling from OTP verification
- Specific error handling for unverified accounts

#### OTPInput.jsx
- 6-digit code input with auto-focus navigation
- Session validation and userId verification
- Code expiration handling with resend functionality
- Navigation to login after successful verification

#### authService.js
- Complete API integration with error handling
- JWT token management (storage/retrieval/removal)
- User data persistence with localStorage
- Authentication state checking

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `dev` - Development integration branch
- `feature/*` - Feature-specific branches

### Current Development Status
- ✅ **Phase 1**: Complete authentication flow implemented
- 🚧 **Phase 2**: Planning authenticated shopping dashboard
- 📋 **Phase 3**: Product catalog and cart functionality
- 📋 **Phase 4**: Vendor and admin portals

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage Goals
- Authentication flow: 90%+ coverage
- Form validation: 100% coverage
- API service integration: 85%+ coverage

## Code Quality

### Styling Guidelines
- **Tailwind CSS** for all styling
- **Responsive design** (mobile-first approach)
- **Consistent spacing** using Tailwind spacing scale
- **Color scheme** based on design system

### Component Standards
- **Functional components** with React hooks
- **PropTypes** for type checking
- **Error boundaries** for graceful error handling
- **Loading states** for all async operations

## Security Considerations

- JWT tokens stored securely in localStorage
- Input validation on all form fields
- Password fields with visibility toggle
- Session cleanup on logout
- CSRF protection (planned)

## Performance Optimizations

- Lazy loading for route components
- Form validation debouncing
- Optimistic UI updates
- Efficient re-renders with proper dependencies

## Deployment

### Environment Variables Setup

#### Local Development
Create `.env.local` in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:3002/api
REACT_APP_ENV=development
```

#### Netlify Production Deployment
Set these environment variables in your Netlify dashboard:
```
REACT_APP_API_BASE_URL=https://your-production-backend.herokuapp.com/api
REACT_APP_ENV=production
NODE_ENV=production
```

### Build Commands
```bash
# Local development
npm start

# Production build
npm run build

# Preview production build locally
npm run preview

# Check environment variables
npm run env:check
```

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Environment Variable Precedence
1. **Netlify Environment Variables** (highest priority)
2. `.env.local` (local development) 
3. `.env.development` / `.env.production`
4. **Default fallback values** (lowest priority)

### Environment Configuration
- **Development**: `localhost:3000` → Backend at `localhost:3002`
- **Production**: Netlify deployment → Production backend API
- **Environment Variables**: Always take precedence over hardcoded values

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Message Format
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## Roadmap

### Phase 2: Authenticated Shopping Dashboard
- [ ] Product catalog with search and filtering
- [ ] Shopping cart with persistent state
- [ ] User profile management
- [ ] Order history and tracking

### Phase 3: E-commerce Core Features  
- [ ] Checkout flow with payment integration
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Inventory management

### Phase 4: Advanced Features
- [ ] Vendor portal for sellers
- [ ] Admin dashboard for platform management
- [ ] Analytics and reporting
- [ ] Mobile app (React Native)

## UI Development Workflow

This project supports two UI approaches: AI-generated components and Designer components. Use the scripts below to manage and switch between them.

### 🎨 UI Management Scripts

#### Switch Between UI Versions
```bash
npm run switch:ai        # Switch to AI-generated UI components
npm run switch:designer  # Switch to Designer UI components
npm run check:ui         # Check which UI is currently active
```

#### Development with Specific UI
```bash
npm run dev:ai          # Start development server with AI UI
npm run dev:designer    # Start development server with Designer UI
```

#### Build Specific UI Versions
```bash
npm run build:ai        # Build production version with AI UI
npm run build:designer  # Build production version with Designer UI
```

#### Git Management (Selective Commits)
```bash
npm run git:add-shared    # Add shared logic (services, contexts, utils)
npm run git:add-ai        # Add AI-specific components and pages
npm run git:add-designer  # Add Designer-specific components and pages
```

### 🏗️ Updated Project Structure

```
src/
├── components/
│   ├── Auth-AI/           # AI-generated UI components
│   ├── Auth-Designer/     # Designer UI components
│   ├── Auth -> Auth-AI/   # Symlink to active UI (git ignored)
│   └── Common/            # Shared components
├── contexts/              # React Context providers
├── pages/                 # Route-level components
├── services/              # API integration
└── App.jsx               # Main app with routing
```

### 🔄 Daily UI Development Workflow

#### Working on AI UI:
```bash
git checkout ui/ai-components
npm run dev:ai                    # Start with AI UI
# Make changes to src/components/Auth-AI/
npm run git:add-ai               # Commit only AI changes
git commit -m "ui: improve AI login form"
```

#### Working on Designer UI:
```bash
git checkout ui/designer-components
npm run dev:designer             # Start with Designer UI
# Make changes to src/components/Auth-Designer/
npm run git:add-designer         # Commit only Designer changes
git commit -m "ui: implement designer components"
```

#### Working on Shared Logic:
```bash
git checkout feature/new-feature
# Make changes to src/services/, src/contexts/, etc.
npm run git:add-shared           # Commit only shared changes
git commit -m "feat: add new authentication feature"

# Then merge to both UI branches:
git checkout ui/ai-components
git merge feature/new-feature

git checkout ui/designer-components  
git merge feature/new-feature
```

### 🎯 Branch Strategy for UI Management

- **`ui/ai-components`** - AI-generated UI approach
- **`ui/designer-components`** - Designer UI approach  
- **`feature/*`** - New features that affect both UIs
- **`main`** - Production-ready code (chosen UI approach)

### ⚠️ Important Notes

- **Never use `git add .`** when working with UI branches
- **Always use specific git scripts** to avoid committing wrong UI
- **The `Auth` symlink is git-ignored** - only commit `Auth-AI/` or `Auth-Designer/`
- **Test both UIs** before merging features to main


## Support

For questions and support:
- Create an issue in the GitHub repository
- Email: 
- Slack: #developers (fashion-app-world.slack.com)

---

**Current Version**: v1.0.0 (Authentication MVP)  
**Last Updated**: June 10, 2025  
**Maintainer**: Fashion App NG Team