# Fashion App Frontend

React-based frontend for the Fashion Shopping Platform MVP with complete authentication flow and plans for comprehensive e-commerce functionality.

## ✅ Current Features
- **User Registration** with email/password validation
- **OTP Email Verification** with JWT token handling  
- **User Login** with persistent authentication
- **Password Reset** with email OTP verification
- **User Logout** with session cleanup
- **Public Landing Page** with auth-aware navigation
- **Session Management** with localStorage and React Context

## 🚧 Planned Features
- Product catalog with search and cart functionality
- Vendor portal for inventory management
- Admin dashboard for platform management

## Tech Stack
- **React.js** (>=18) with hooks and functional components
- **Tailwind CSS** for responsive styling
- **React Router** (v6) for client-side routing
- **Context API** for global state management
- **JWT** authentication with localStorage persistence

## Architecture
```
src/
├── components/
│   ├── Auth-Designer/     # Authentication UI components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx  
│   │   ├── OTPInput.jsx
│   │   ├── ForgotPasswordForm.jsx
│   │   └── PasswordResetForm.jsx
│   └── Common/           # Reusable UI components
├── contexts/             # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/               # Route-level components
├── services/            # API integration
│   └── authService.js
└── App.jsx             # Main app with routing
```

## Getting Started

### Prerequisites
- Node.js (>=16)
- Backend API running on `localhost:3002` (development) or production backend

### Installation
```bash
git clone git@github.com:Fashion-App-NG/frontend.git
cd frontend
npm install
npm start
```

### Environment Variables
Create `.env.local`:
```env
# Development
REACT_APP_API_BASE_URL=http://localhost:3002/api
REACT_APP_ENV=development

# Production (example)
# REACT_APP_API_BASE_URL=https://backend-bsm1.onrender.com/api
# REACT_APP_ENV=production
```

## Authentication Flow

### User Journey
```
Registration: Register → OTP Verification → Login → Dashboard
Login: Login → Dashboard
Password Reset: Forgot Password → OTP Verification → Set New Password → Login
```

### API Endpoints
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User authentication
- **POST** `/auth/verify-otp` - Email verification
- **POST** `/auth/resend-otp` - Resend verification code  
- **POST** `/auth/forgot-password` - Request password reset
- **POST** `/auth/reset-password` - Reset password with OTP
- **POST** `/auth/logout` - User logout

## Development

### UI Management
This project supports dual UI approaches:

```bash
npm run switch:designer    # Switch to Designer UI components
npm run switch:ai          # Switch to AI-generated UI components
npm run check:ui           # Check current UI version

npm run dev:designer       # Start with Designer UI
npm run dev:ai            # Start with AI UI
```

### Git Workflow
Organized commit scripts for better development workflow:

```bash
npm run git:add-core          # App structure & config files
npm run git:add-shared        # Business logic (services, contexts)
npm run git:add-docs          # Documentation updates
npm run git:add-all-shared    # Complete features (core + shared + docs)
npm run git:add-designer      # Designer-specific components
npm run git:add-ai           # AI-specific components
```

### Branch Strategy
- `main` - Production-ready code
- `dev` - Development integration
- `feature/*` - Feature-specific branches

### Testing
```bash
npm test                 # Run tests
npm run test:coverage    # Generate coverage report
```

## Deployment

### Live Deployment
- **Frontend**: [https://fashionappng.netlify.app/](https://fashionappng.netlify.app/) (Netlify)
- **Backend API**: [https://backend-bsm1.onrender.com/api](https://backend-bsm1.onrender.com/api) (Render)

### Local Development
```bash
npm start               # Development server (http://localhost:3000)
npm run build          # Production build
```

### Production Deployment

#### Frontend (Netlify)
1. **Automatic Deployment**: Connected to GitHub repository
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
3. **Environment Variables**:
   ```
   REACT_APP_API_BASE_URL=https://backend-bsm1.onrender.com/api
   REACT_APP_ENV=production
   ```
4. **Custom Domain**: [fashionappng.netlify.app](https://fashionappng.netlify.app/)

#### Backend (Render)
- **API Base URL**: `https://backend-bsm1.onrender.com`
- **Health Check**: `https://backend-bsm1.onrender.com/health`
- **Auto-deployment** from backend repository

### Environment Configuration
```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:3002/api

# Production  
REACT_APP_API_BASE_URL=https://backend-bsm1.onrender.com/api
```

## Cross-Platform Support

**Windows Users**: If you encounter permission issues with UI switching, see [Windows Setup Guide](docs/WINDOWS_SETUP.md) for troubleshooting.

**All Platforms**: UI switching scripts work on Windows, macOS, and Linux with automatic fallbacks.

## Key Components

### Authentication
- **LoginForm/VendorLoginForm**: Email/password authentication with error handling
- **RegisterForm/VendorRegisterForm**: Registration with validation and terms acceptance
- **OTPInput**: 6-digit verification with paste support, auto-submit, and resend functionality
- **ForgotPasswordForm**: Email-based password reset request
- **PasswordResetForm**: OTP verification and new password setting
- **PasswordInput**: Secure input with visibility toggle (excluded from tab navigation)

### Services
- **authService**: Complete API integration with JWT management and error handling
- **AuthContext**: Global authentication state with login/logout functionality

## Security & Performance

### Security
- JWT tokens in localStorage with proper cleanup
- Input validation on all forms
- Session management with automatic cleanup
- Rate limiting on OTP resend requests
- HTTPS-only in production (Netlify SSL)

### Performance
- Lazy loading for route components
- Optimistic UI updates
- Efficient re-renders with proper dependencies
- Form validation debouncing
- CDN delivery via Netlify

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Use appropriate git scripts: `npm run git:add-shared`
4. Commit with conventional format: `feat: add new feature`
5. Push and create Pull Request

### Commit Format
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: testing
chore: maintenance
```

## Roadmap

### Phase 2: Shopping Experience
- [ ] Product catalog with search/filtering
- [ ] Shopping cart with persistent state
- [ ] Checkout flow with payment integration
- [ ] Order history and tracking

### Phase 3: Advanced Features
- [ ] Vendor portal for sellers
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile app (React Native)

## Documentation

- [Windows Setup Guide](docs/WINDOWS_SETUP.md) - Cross-platform development setup
- [API Integration Guide](docs/API_INTEGRATION.md) - Backend integration (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment (coming soon)

## Links

- **Live App**: [https://fashionappng.netlify.app/](https://fashionappng.netlify.app/)
- **Backend API**: [https://backend-bsm1.onrender.com/api](https://backend-bsm1.onrender.com/api)
- **GitHub Repository**: [https://github.com/Fashion-App-NG/frontend](https://github.com/Fashion-App-NG/frontend)

---

**Current Status**: ✅ Complete authentication system with dual UI support  
**Next Phase**: 🚧 Product catalog and shopping cart functionality