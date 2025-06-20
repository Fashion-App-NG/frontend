# Fashion Culture - Frontend

A comprehensive React-based fashion marketplace platform with complete vendor product management, role-based authentication, and real-time API integration.

## 🚀 Features

### 🔐 Authentication System
- ✅ **Multi-Role Support**: Shoppers, Vendors, and Admins
- ✅ **Email Verification**: OTP-based email verification for all registrations  
- ✅ **Password Reset**: Secure password reset functionality
- ✅ **JWT Token Management**: Secure token-based authentication with proper storage
- ✅ **Role-Based Routing**: Automatic redirection to appropriate dashboards
- ✅ **Centralized Auth Context**: Unified login/logout functionality

### 👥 User Types
- ✅ **Shoppers**: Browse products, manage favorites, place orders
- ✅ **Vendors**: Complete product management system with CRUD operations
- ✅ **Admins**: User management, vendor approval, system oversight

### 🎨 Dashboard Features
- ✅ **Vendor Dashboard**: Complete product management with enhanced UI
  - Product listing with comprehensive table view
  - Real-time product creation and updates
  - Advanced product editing with modal interface
  - Inventory restocking functionality
  - Product soft-delete (hide) functionality
- **Shopper Dashboard**: Order history, favorites, recommendations
- **Admin Dashboard**: User management, vendor approval workflow

### 🛍️ Product Management System (NEW)
- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete products
- ✅ **Rich Product Data**: Name, price, quantity, material type, patterns, descriptions
- ✅ **Image Upload System**: Drag & drop interface with compression
- ✅ **Real-time API Integration**: Full backend synchronization
- ✅ **Advanced Search & Filtering**: Product discovery features
- ✅ **Inventory Management**: Stock tracking and restocking workflows
- ✅ **Status Management**: Product availability controls

### 🛡️ Security & Error Handling
- ✅ **Role-Based Access Control**: Protected routes based on user roles
- ✅ **JWT Token Validation**: Secure API communication with proper headers
- ✅ **Centralized Error Handling**: Comprehensive error management system
- ✅ **Input Validation**: Client-side and server-side validation
- ✅ **Debug Tools**: Development-only debugging components
- **Admin Invitation System**: Secure admin onboarding (planned)

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.1.0
- **Authentication**: JWT tokens with secure localStorage management
- **State Management**: React Context API
- **API Communication**: Custom VendorService with full CRUD operations
- **Error Handling**: Centralized error management system
- **Development Tools**: Token debugging and API testing utilities

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
REACT_APP_API_URL=http://localhost:3002
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
│   │   └── LoadingSpinner.jsx  # Reusable loading components
│   └── Vendor/                 # Vendor-specific components
│       ├── VendorDashboardContent.jsx
│       ├── VendorProductListContent.jsx    # Complete product listing
│       ├── VendorProductUploadContent.jsx  # Product creation form
│       ├── VendorProductEditModal.jsx      # Product editing interface
│       ├── VendorSidebar.jsx
│       ├── TokenDebug.jsx                  # Development debugging
│       └── VendorApiDebug.jsx             # API testing utilities
├── contexts/
│   ├── AuthContext.jsx         # Enhanced authentication with login/logout
│   └── CartContext.jsx         # Shopping cart state
├── hooks/
│   └── useVendorProducts.js    # Product management custom hook
├── pages/                      # Page components
│   ├── AdminDashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ShopperDashboardPage.jsx
│   ├── VendorDashboardPage.jsx
│   ├── VendorProductListPage.jsx    # Product listing page
│   ├── VendorProductUploadPage.jsx  # Product creation page
│   ├── TermsOfServicePage.jsx
│   └── PrivacyPolicyPage.jsx
├── services/
│   ├── authService.js          # Authentication API service
│   └── vendorService.js        # Complete vendor product API service
└── utils/                      # Utility functions
    └── errorHandler.js         # Centralized error management
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
4. ✅ Enhanced login with centralized auth management
5. ✅ Redirect to comprehensive vendor dashboard
6. Pending admin approval (planned feature)

### Admin Management
1. SuperAdmin creates admin accounts
2. Admin receives credentials
3. Admin login with elevated permissions
4. Access to user management and vendor approval

## 🛍️ Product Management Workflow

### Vendor Product Operations
1. ✅ **Product Creation**
   - Rich form with material types, patterns, pricing
   - Image upload with drag & drop functionality
   - Real-time validation and API integration
   
2. ✅ **Product Listing** 
   - Comprehensive table view with all product details
   - Enhanced typography and legibility
   - Advanced action menus (Edit, Restock, Delete)
   
3. ✅ **Product Management**
   - Modal-based editing interface
   - Inventory restocking with quantity calculations
   - Soft delete functionality (hide products)
   
4. ✅ **Real-time Synchronization**
   - Instant updates via API calls
   - Loading states and error handling
   - Success/failure notifications

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

## 🔌 API Integration

### VendorService Endpoints
- ✅ `GET /api/product/vendor/{vendorId}` - Fetch vendor products
- ✅ `POST /api/product` - Create new product
- ✅ `PUT /api/product/{productId}` - Update existing product  
- ✅ `PUT /api/product/{productId}/hide` - Soft delete product
- ✅ Token-based authentication with proper headers
- ✅ Comprehensive error handling and logging

### Enhanced Features
- ✅ **MongoDB ID Mapping**: Automatic `_id` to `id` conversion
- ✅ **Request Debugging**: Development-mode API testing tools
- ✅ **Connection Testing**: API health check functionality
- ✅ **Retry Logic**: Automatic retry for failed operations

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

### Version 2.0.0 (Current) - Complete Product Management
- ✅ **Full CRUD Product Management**: Complete vendor product operations
- ✅ **Enhanced Authentication**: Centralized login/logout with proper token management
- ✅ **Advanced UI Components**: Comprehensive product listing with enhanced legibility
- ✅ **Real-time API Integration**: Full backend synchronization with error handling
- ✅ **Product Creation System**: Rich forms with image upload and validation
- ✅ **Inventory Management**: Restocking workflows and quantity tracking
- ✅ **Debug Tools**: Development utilities for API testing and token debugging
- ✅ **Responsive Design**: Mobile-friendly interfaces with Tailwind CSS
- ✅ **Error Handling**: Centralized error management system
- ✅ **Loading States**: Comprehensive loading indicators and feedback

### Version 1.0.0 (Previous)
- ✅ Basic authentication system for all user types
- ✅ Role-based dashboard routing  
- ✅ Basic vendor dashboard
- ✅ Admin account creation functionality
- ✅ OTP email verification system
- ✅ Password reset functionality

### Upcoming Features (Roadmap)
- 🔄 **Shopping Cart Integration**: Complete e-commerce functionality
- 🔄 **Order Management System**: Order tracking and fulfillment
- 🔄 **Advanced Analytics**: Sales reports and vendor insights
- 🔄 **Admin Approval Workflow**: Vendor verification system
- 🔄 **Real-time Notifications**: Push notifications for orders and updates
- 🔄 **Payment Integration**: Secure payment processing
- 🔄 **Advanced Search**: Elasticsearch integration for product discovery
- 🔄 **Mobile App**: React Native companion app

## 🧪 Development Features

### Debug Tools (Development Only)
- ✅ **TokenDebug Component**: Real-time token status monitoring
- ✅ **VendorApiDebug**: API endpoint testing and validation
- ✅ **Error Logging**: Comprehensive error tracking and reporting
- ✅ **Loading States**: Visual feedback for all operations
- ✅ **Development Guards**: Environment-aware feature flags

### Testing & Quality
- ✅ **Input Validation**: Client-side and server-side validation
- ✅ **Error Boundaries**: React error boundary implementation
- ✅ **Type Safety**: Proper prop validation and error handling
- ✅ **Performance**: Optimized re-renders and API calls

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Use the provided npm scripts for git operations  
3. Ensure all components have proper error handling
4. Test API integration and authentication flows
5. Update README and documentation for new features
6. Follow the established patterns for state management
7. Include proper loading states and user feedback

## 📞 Support

For technical support or questions:
- Email: bioye007@gmai.com
- Documentation: `/docs` folder
- Issues: Create GitHub issues for bugs and feature requests

## 📄 License

This project is proprietary and confidential. All rights reserved.