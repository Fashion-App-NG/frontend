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
- **Windows users**: See [Windows Setup Guide](docs/WINDOWS_SETUP.md) for cross-platform development

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

### Platform-Specific Setup
- **Windows**: Follow the [Windows Development Setup](docs/WINDOWS_SETUP.md) guide
- **macOS/Linux**: Standard Node.js installation works out of the box

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

## Documentation

### Setup Guides
- [Windows Development Setup](docs/WINDOWS_SETUP.md) - Cross-platform UI switching and troubleshooting
- [API Integration Guide](docs/API_INTEGRATION.md) - Backend service integration (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions (coming soon)

### Development
- [Component Architecture](docs/COMPONENTS.md) - UI component structure and patterns (coming soon)
- [State Management](docs/STATE_MANAGEMENT.md) - Context and state patterns (coming soon)

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

**Cross-Platform Support**: These scripts work on Windows, macOS, and Linux. Windows users should see the [Windows Setup Guide](docs/WINDOWS_SETUP.md) if you encounter permission issues.

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
npm run git:add-core        # Add core files (package.json, App.jsx, config files)
npm run git:add-shared      # Add shared logic (services, contexts, utils, Common components)
npm run git:add-docs        # Add documentation (README.md, docs/)
npm run git:add-all-shared  # Add all shared files (core + shared + docs)
npm run git:add-ai          # Add AI-specific components and pages
npm run git:add-designer    # Add Designer-specific components and pages
```

### 🎯 **Enhanced Git Workflow**

The git scripts are now organized into logical categories for better development workflow:

#### **Core Application Files**
```bash
npm run git:add-core
# Adds: package.json, src/App.jsx, public/, *.config.js, netlify.toml, .gitignore
```
Use this when you've made changes to:
- Dependencies or npm scripts
- Main app routing or providers
- Build configuration files
- Deployment settings

#### **Shared Business Logic**
```bash
npm run git:add-shared  
# Adds: src/services/, src/contexts/, src/utils/, src/hooks/, src/components/Common/
```
Use this when you've added:
- New API services or authentication logic
- React contexts or custom hooks
- Utility functions or shared components
- Cross-UI business logic

#### **Documentation**
```bash
npm run git:add-docs
# Adds: README.md, docs/
```
Use this when you've updated:
- Setup instructions or API documentation
- Workflow guides or troubleshooting docs
- Architecture or deployment guides

#### **Complete Shared Changes**
```bash
npm run git:add-all-shared
# Combines: git:add-core + git:add-shared + git:add-docs
```
Use this for comprehensive updates that affect:
- Core application structure AND business logic
- New features with documentation updates
- Major architectural changes

### 🔄 **Updated Daily Workflow Examples**

#### **Adding New Authentication Feature**
```bash
git checkout feature/oauth-integration

# 1. Update dependencies and add OAuth service
npm install @auth0/auth0-react
# Modify src/services/authService.js
# Update src/contexts/AuthContext.jsx
# Document in README.md

# 2. Commit all related changes together
npm run git:add-all-shared
git commit -m "feat: add OAuth authentication with Auth0

- Add Auth0 React SDK dependency
- Implement OAuth service integration  
- Update AuthContext with OAuth methods
- Document OAuth setup instructions"
```

#### **Core Configuration Updates**
```bash
git checkout feature/deployment-optimization

# 1. Update build configuration
# Modify package.json scripts
# Update netlify.toml
# Adjust tailwind.config.js

# 2. Commit configuration changes
npm run git:add-core
git commit -m "chore: optimize build configuration for production

- Add build caching and optimization scripts
- Update Netlify deployment settings
- Configure Tailwind for better performance"
```

#### **Documentation-Only Updates**
```bash
git checkout docs/api-integration-guide

# 1. Add comprehensive API documentation
# Create docs/API_INTEGRATION.md
# Update README.md with new API endpoints

# 2. Commit documentation changes
npm run git:add-docs
git commit -m "docs: add comprehensive API integration guide

- Document all authentication endpoints
- Add request/response examples
- Include error handling patterns"
```

#### **UI-Specific Development**
```bash
# Working on Designer UI components
git checkout ui/designer-components
npm run dev:designer

# Make changes to src/components/Auth-Designer/
npm run git:add-designer
git commit -m "ui: improve designer login form validation"

# Working on AI UI components  
git checkout ui/ai-components
npm run dev:ai

# Make changes to src/components/Auth-AI/
npm run git:add-ai
git commit -m "ui: enhance AI-generated form layouts"
```

### 🎯 **Why This Categorization Matters**

#### **Improved Development Workflow**
- **Logical grouping**: Related files are committed together
- **Clear intent**: Each script has a specific purpose
- **Reduced errors**: Less chance of committing wrong files
- **Better history**: Cleaner git log with focused commits

#### **Cross-Platform Reliability**
- **Windows compatibility**: All scripts work on Windows, macOS, and Linux
- **Automatic fallbacks**: UI switching handles permissions gracefully  
- **Comprehensive coverage**: No important files left uncommitted

#### **Team Collaboration**
- **Consistent commits**: Everyone uses the same categorization
- **Merge conflicts reduced**: Logical file grouping minimizes conflicts
- **Review efficiency**: PRs are easier to review with focused changes

### ⚠️ **Important Git Workflow Notes**

- **Use specific scripts**: Always use categorized scripts instead of `git add .`
- **Core files matter**: `package.json`, `App.jsx`, and config files affect both UIs
- **Documentation is shared**: README updates should be committed with `git:add-docs`
- **Test before commit**: Verify changes work across both UI approaches
- **Symlinks are ignored**: Only commit actual `Auth-AI/` or `Auth-Designer/` folders

### 🔧 **Script Categories Explained**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `git:add-core` | App structure & config | Dependencies, routing, build setup |
| `git:add-shared` | Business logic | Services, contexts, utilities |
| `git:add-docs` | Documentation | README, guides, API docs |
| `git:add-all-shared` | Complete features | Major changes affecting multiple areas |
| `git:add-ai` | AI UI components | AI-specific component development |
| `git:add-designer` | Designer UI | Designer component development |

This enhanced git workflow ensures that critical shared files like `package.json`, `src/App.jsx`, and `README.md` are properly included in commits, while maintaining clear separation between UI approaches and business logic! 🚀