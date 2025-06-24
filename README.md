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
- ✅ **Production Security**: Environment-gated debug logging for sensitive data

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
- ✅ **Shopper Dashboard**: Order history, favorites, recommendations
- ✅ **Admin Dashboard**: User management, vendor approval workflow

### 🛍️ Product Management System
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
- ✅ **Production Security**: No sensitive data exposure in production logs
- ✅ **Accessibility**: WCAG-compliant components with semantic HTML

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1
- **Routing**: React Router DOM 6.30.1 with optimized route structure
- **Styling**: Tailwind CSS 3.1.0
- **Authentication**: JWT tokens with secure localStorage management
- **State Management**: React Context API with selective providers
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

Create a `.env` file in the root directory with:

```bash
# API Configuration
REACT_APP_API_BASE_URL=process.env.REACT_APP_API_BASE_URL;

# For production deployment:
REACT_APP_API_BASE_URL=https://backend-bsm1.onrender.com
```

## Development Setup

1. Start the backend server on port 3002
2. Start the frontend server: `npm start`
3. The app will connect to the API at the configured URL

## Deployment

Update `REACT_APP_API_BASE_URL` to your production API URL before building.

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
│   │   ├── Dashboard/          # User dashboards with optimized sections
│   │   ├── AdminLoginForm.jsx
│   │   ├── CreateAdminForm.jsx
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── VendorLoginForm.jsx
│   │   └── VendorRegisterForm.jsx
│   ├── Common/                 # Shared components
│   │   ├── LoadingSpinner.jsx  # Reusable loading components
│   │   └── DashboardRouter.jsx # Smart routing logic
│   └── Vendor/                 # Vendor-specific components
│       ├── VendorDashboardContent.jsx
│       ├── VendorProductListContent.jsx    # Complete product listing
│       ├── VendorProductUploadContent.jsx  # Product creation form
│       ├── VendorProductEditModal.jsx      # Product editing interface
│       ├── VendorSidebar.jsx
│       ├── TokenDebug.jsx                  # Development debugging
│       └── VendorApiDebug.jsx             # API testing utilities
├── contexts/
│   ├── AuthContext.jsx         # Enhanced authentication with security
│   └── CartContext.jsx         # Shopping cart state (selective routes)
├── hooks/
│   └── useVendorProducts.js    # Product management custom hook
├── pages/                      # Page components with role protection
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

## 🎯 Optimized Routing Structure

### Smart Route Organization
- `/` - User type selection homepage
- `/login` - Shopper login
- `/login/vendor` - Vendor login
- `/register` - Shopper registration
- `/register/vendor` - Vendor registration
- `/verify-otp` - Email verification

### Role-Based Dashboards
- `/shopper/dashboard` - Shopper dashboard
- `/vendor/dashboard` - Vendor dashboard  
- `/admin/dashboard` - Admin dashboard

### Vendor Management Routes
- `/vendor/products` - Product listing
- `/vendor/products/add` - Product creation
- `/vendor/orders` - Order management
- `/vendor/sales` - Sales analytics
- `/vendor/settings` - Account settings

### Shopping Routes (Cart-Enabled)
- `/shopping/dashboard` - Shopping interface
- `/shopping/explore` - Product discovery
- `/shopping/orders` - Order history
- `/shopping/favourites` - Saved items

### System Routes
- `/admin/login` - Admin authentication
- `/admin/create-admin` - Admin creation (SuperAdmin only)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/terms-of-service` - Legal terms
- `/privacy-policy` - Privacy policy

## 🔌 API Integration

### VendorService Endpoints
- ✅ `GET /api/product/vendor/{vendorId}` - Fetch vendor products
- ✅ `POST /api/product` - Create new product (supports multipart/form-data for images)
- ✅ `PUT /api/product/{productId}` - Update existing product  
- ✅ `PUT /api/product/{productId}/hide` - Soft delete product
- ✅ Token-based authentication with proper headers
- ✅ Multipart form support for image uploads
- ✅ Comprehensive error handling and logging

### Enhanced Features
- ✅ **Multipart Form Support**: Automatic detection and handling of image uploads
- ✅ **File Preservation**: Original File objects maintained for proper upload
- ✅ **Fallback JSON**: Products without images use standard JSON API
- ✅ **Vendor ID Validation**: Explicit vendorId field as per API specification
- ✅ **Environment-Aware Logging**: Debug logs only in development

## 🖼️ Image Handling Options

### Current Implementation
- **Option 1**: Simple Cloudinary integration with fallback to placeholder
- **Option 2**: Advanced ProductImageDisplay component with multiple image support
- **Option 3**: Static placeholder images (no Cloudinary required)

### Cloudinary Integration Status
- ✅ **Backend**: Ready for Cloudinary URLs in `product.images[].url`
- ✅ **Frontend**: Flexible image display with error handling
- ✅ **Fallback**: Graceful degradation to placeholder images
- ✅ **Multiple Images**: Support for product galleries (optional)

### Image Display Features
- **Error Handling**: Automatic fallback to placeholder on load failure
- **Multiple Images**: Badge showing image count per product
- **Lazy Loading**: Improved performance for image-heavy lists
- **Responsive Design**: Consistent sizing across different screen sizes

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build for production
npm run build:production

# Deploy to Netlify
npm run netlify:build
```

### Environment Configuration
- **Development**: Full debug logging and development tools
- **Production**: Optimized build with security-gated logging
- **API Integration**: Supports both localhost and deployed backends

## 🔄 Recent Updates

### Version 2.1.0 (Current) - Security & Performance Enhancements
- ✅ **Production Security**: Environment-gated authentication and debug logging
- ✅ **Route Optimization**: Smart CartProvider usage only for shopping routes
- ✅ **Code Quality**: Removed unused functions and optimized dependencies
- ✅ **Accessibility**: Semantic HTML elements and WCAG compliance
- ✅ **Error Handling**: Enhanced HTTP status detection and user feedback
- ✅ **ESLint Clean**: All warnings resolved, production-ready code

### Version 2.0.0 (Previous) - Complete Product Management
- ✅ **Full CRUD Product Management**: Complete vendor product operations
- ✅ **Enhanced Authentication**: Centralized login/logout with proper token management
- ✅ **Advanced UI Components**: Comprehensive product listing with enhanced legibility
- ✅ **Real-time API Integration**: Full backend synchronization with error handling
- ✅ **Product Creation System**: Rich forms with image upload and validation
- ✅ **Inventory Management**: Restocking workflows and quantity tracking
- ✅ **Debug Tools**: Development utilities for API testing and token debugging
- ✅ **Responsive Design**: Mobile-friendly interfaces with Tailwind CSS

### Version 1.0.0 (Foundation)
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
- ✅ **ESLint Integration**: Real-time code quality monitoring

### Testing & Quality
- ✅ **Input Validation**: Client-side and server-side validation
- ✅ **Error Boundaries**: React error boundary implementation
- ✅ **Type Safety**: Proper prop validation and error handling
- ✅ **Performance**: Optimized re-renders and API calls
- ✅ **Code Quality**: ESLint warnings resolved, production-ready

### Security Features
- ✅ **Environment-Aware Logging**: No sensitive data in production
- ✅ **Token Security**: Secure storage and transmission
- ✅ **Route Protection**: Role-based access control
- ✅ **Input Sanitization**: XSS protection and validation
- ✅ **Accessibility**: WCAG 2.1 compliance for inclusive design

## 🎯 Architecture Decisions

### Context Provider Strategy
```jsx
// Smart provider usage - Cart only for shopping routes
<AuthProvider>           // Global authentication state
  <Router>
    <Routes>
      {/* Non-shopping routes - No CartProvider overhead */}
      <Route path="/vendor/*" element={<VendorRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Shopping routes - Cart context available */}
      <Route path="/shopping/*" element={
        <CartProvider>
          <ShoppingRoutes />
        </CartProvider>
      } />
    </Routes>
  </Router>
</AuthProvider>
```

### Security-First Development
- Environment-gated debug logging prevents data exposure
- Role-based route protection with automatic redirects
- Secure token management with multiple fallback strategies
- Production-ready error handling without sensitive data leaks

### Performance Optimizations
- Selective context providers reduce unnecessary re-renders
- Lazy loading for images and components
- Optimized React Hook dependencies
- Efficient state management patterns

## 🤝 Contributing

### Code Quality Standards
1. Follow the existing code structure and patterns
2. Use the provided npm scripts for git operations  
3. Ensure all components have proper error handling
4. Test API integration and authentication flows
5. Update README and documentation for new features
6. Follow the established patterns for state management
7. Include proper loading states and user feedback
8. Resolve all ESLint warnings before committing

### Security Guidelines
- Gate all debug logging behind `NODE_ENV === 'development'`
- Never log sensitive user data or tokens in production
- Use semantic HTML for accessibility compliance
- Implement proper error boundaries and fallbacks
- Follow role-based access control patterns

### Performance Best Practices
- Use selective context providers (don't wrap all routes unnecessarily)
- Implement lazy loading for images and heavy components
- Optimize React Hook dependencies to prevent unnecessary re-renders
- Use proper loading states and error handling

## 📞 Support

For technical support or questions:
- Email: bioye007@gmail.com
- Documentation: `/docs` folder and this README
- Issues: Create GitHub issues for bugs and feature requests
- Code Quality: All ESLint warnings resolved for production deployment

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 🏆 Project Status

**Current Status**: Production-Ready v2.1.0
- ✅ All ESLint warnings resolved
- ✅ Security hardened for production
- ✅ Accessibility compliant
- ✅ Performance optimized
- ✅ Full vendor product management
- ✅ Multi-role authentication system
- ✅ Comprehensive error handling

**Next Milestone**: Shopping cart integration and order management system