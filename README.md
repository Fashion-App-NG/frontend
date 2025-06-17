# Fashion Culture - Frontend

A modern React-based fashion marketplace platform supporting multiple user types (shoppers, vendors, and admins) with role-based authentication and dashboards.

## 🚀 Features

### 🔐 Authentication System
- **Multi-Role Support**: Shoppers, Vendors, and Admins
- **Email Verification**: OTP-based email verification for all registrations
- **Password Reset**: Secure password reset functionality
- **JWT Token Management**: Secure token-based authentication
- **Role-Based Routing**: Automatic redirection to appropriate dashboards

### 👥 User Types
- **Shoppers**: Browse products, manage favorites, place orders
- **Vendors**: Manage store, track orders, view analytics
- **Admins**: User management, vendor approval, system oversight

### 🎨 Dashboard Features
- **Vendor Dashboard**: Analytics, order management, sales tracking
- **Shopper Dashboard**: Order history, favorites, recommendations
- **Admin Dashboard**: User management, vendor approval workflow

### 🛡️ Security Features
- **Role-Based Access Control**: Protected routes based on user roles
- **JWT Token Validation**: Secure API communication
- **Admin Invitation System**: Secure admin onboarding (planned)
- **Input Validation**: Client-side and server-side validation

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.1.0
- **Authentication**: JWT tokens with localStorage
- **State Management**: React Context API
- **API Communication**: Fetch API with custom authService

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd fashion-app/frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:3002/api
REACT_APP_ENV=development
```

## 📜 Available Scripts

### Development
- `npm start` - Start development server
- `npm run dev:ai` - Switch to AI UI and start
- `npm run dev:designer` - Switch to Designer UI and start

### Building
- `npm run build` - Build for production
- `npm run build:production` - Build with production environment
- `npm run build:ai` - Build AI UI version
- `npm run build:designer` - Build Designer UI version

### Git Workflows
- `npm run git:add-core` - Add core files (App.jsx, package.json, config)
- `npm run git:add-shared` - Add shared components (services, contexts, utils, Vendor components)
- `npm run git:add-designer` - Add Auth-Designer components and pages
- `npm run git:add-all-shared` - Add all shared files including docs

### UI Switching
- `npm run switch:ai` - Switch to AI-generated UI
- `npm run switch:designer` - Switch to Designer UI
- `npm run check:ui` - Check current UI mode

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth-Designer/          # Authentication forms and components
│   │   ├── Dashboard/          # User dashboards
│   │   ├── AdminLoginForm.jsx
│   │   ├── CreateAdminForm.jsx
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── VendorLoginForm.jsx
│   │   └── VendorRegisterForm.jsx
│   ├── Common/                 # Shared components
│   └── Vendor/                 # Vendor-specific components
│       ├── VendorDashboardContent.jsx
│       ├── VendorSidebar.jsx
│       ├── InventoryItem.jsx
│       └── InventoryList.jsx
├── contexts/
│   ├── AuthContext.jsx         # Authentication state management
│   └── CartContext.jsx         # Shopping cart state
├── pages/                      # Page components
│   ├── AdminDashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ShopperDashboardPage.jsx
│   ├── VendorDashboardPage.jsx
│   ├── TermsOfServicePage.jsx
│   └── PrivacyPolicyPage.jsx
├── services/
│   └── authService.js          # API communication service
└── utils/                      # Utility functions
```

## 🔐 Authentication Flow

### Shopper Registration
1. User fills registration form
2. Email verification via OTP
3. Email verification
4. Login and redirect to shopper dashboard

### Vendor Registration
1. Vendor fills registration form with store details
2. OTP verification sent to email
3. Email verification with store name
4. Login with store name and redirect to vendor dashboard
5. Pending admin approval (planned feature)

### Admin Management
1. SuperAdmin creates admin accounts
2. Admin receives credentials
3. Admin login with elevated permissions
4. Access to user management and vendor approval

## 🎯 Routing Structure

- `/` - User type selection homepage
- `/login` - Shopper login
- `/login/vendor` - Vendor login
- `/register` - Shopper registration
- `/register/vendor` - Vendor registration
- `/verify-otp` - Email verification
- `/dashboard` - Redirects to role-specific dashboard
- `/shopper/dashboard` - Shopper dashboard
- `/vendor/dashboard` - Vendor dashboard
- `/admin/dashboard` - Admin dashboard
- `/admin/login` - Admin login
- `/admin/create-admin` - Admin creation (SuperAdmin only)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/terms-of-service` - Terms of service
- `/privacy-policy` - Privacy policy

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build for production
npm run build:production

# Deploy to Netlify
npm run netlify:build
```

### Manual Deployment
```bash
# Build the project
npm run build

# Serve static files
npm run preview
```

## 🔄 Recent Updates

### Version 1.0.0 (Current)
- ✅ Complete authentication system for all user types
- ✅ Role-based dashboard routing
- ✅ Vendor dashboard with analytics and order management
- ✅ Admin account creation functionality
- ✅ OTP email verification system
- ✅ Password reset functionality
- ✅ Responsive design with Tailwind CSS

### Upcoming Features
- 🔄 Admin invitation workflow (security improvement)
- 🔄 Vendor approval system
- 🔄 Real-time notifications
- 🔄 Advanced analytics dashboard
- 🔄 Product management system
- 🔄 Order tracking system

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Use the provided npm scripts for git operations
3. Ensure all components have proper TypeScript-style comments
4. Test authentication flows before committing
5. Update README for any new features

## 📞 Support

For technical support or questions:
- Email: dev@fashionculture.com
- Documentation: `/docs` folder
- Issues: Create GitHub issues for bugs and feature requests

## 📄 License

This project is proprietary and confidential. All rights reserved.