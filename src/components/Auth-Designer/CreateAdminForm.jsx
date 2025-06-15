import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService'; // ✅ Use default import (no curly braces)
import { PasswordInput } from './PasswordInput';

export const CreateAdminForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Check if user is superadmin on component mount
  useEffect(() => {
    const currentUser = authService.getUser();
    
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    
    if (currentUser.role !== 'superadmin') {
      setError('Access denied. Only superadmins can create admin accounts.');
      setTimeout(() => navigate('/admin/dashboard'), 3000);
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      phone: formData.get('phone') || '',
      role: 'admin' // ✅ Always set to 'admin'
      // permissions: Array.from(formData.getAll('permissions')) // ✅ Remove this
    };

    // Client-side validation (keep existing validation)
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.confirmPassword || !data.phone) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Phone validation
    if (!data.phone || data.phone.trim().length === 0) {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }

    // Optional: Add phone format validation
    const phonePattern = /^\+?[\d\s\-()]{10,}$/;
    if (!phonePattern.test(data.phone.trim())) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Debug logging - this should now work
      const currentToken = authService.getAuthToken();
      const currentUser = authService.getUser();
      
      console.log('🔐 Debug info before create admin:');
      console.log('- Token present:', !!currentToken);
      console.log('- Token preview:', currentToken ? currentToken.substring(0, 20) + '...' : 'null');
      console.log('- User:', currentUser);
      console.log('- User role:', currentUser?.role);
      
      if (!currentToken) {
        setError('No authentication token found. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }
      
      if (!currentUser || currentUser.role !== 'superadmin') {
        setError('Only superadmins can create admin accounts.');
        return;
      }
      
      console.log('🔐 Creating new admin:', { ...data, password: '***', confirmPassword: '***' });
      
      // ✅ This should now work with proper JWT token
      const response = await authService.createAdmin({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role
      });

      console.log('✅ Admin created successfully:', response);
      setSuccess(`Admin account created successfully! ${data.firstName} ${data.lastName} can now log in with their email address.`);
      
      // Reset form
      setTimeout(() => {
        e.target.reset();
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Create admin failed:', error);
      
      if (error.message.includes('Authentication required')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else if (error.message.includes('already exists')) {
        setError('Admin with this email already exists. Please use a different email address.');
      } else if (error.message.includes('Unauthorized') || error.message.includes('403')) {
        setError('You do not have permission to create admin accounts.');
      } else if (error.message.includes('500')) {
        setError('Server error occurred while creating admin account. Please try again later.');
      } else {
        setError(error.message || 'Failed to create admin account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Super Admin Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Super Admin
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Admin Management</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Create Admin Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Add a new administrator to the platform
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* First Name */}
        <div>
          <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2]">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            placeholder="Enter first name"
            required
            disabled={isLoading}
            className="w-full bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2]">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            placeholder="Enter last name"
            required
            disabled={isLoading}
            className="w-full bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
          />
        </div>
      </div>

      {/* Email Address Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter email address"
        required
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Phone Field - NOW REQUIRED */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        name="phone"
        placeholder="Enter phone number (e.g., +1234567890)"
        required // ✅ Add required attribute
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Permissions Section */}
      <div className="mt-4 p-4 bg-[rgba(248,249,250,1)] rounded-[5px] border border-[rgba(229,231,235,1)]">
        <label className="text-[rgba(46,46,46,1)] text-sm font-semibold leading-[1.2]">
          Admin Permissions
        </label>
        <p className="text-[rgba(107,114,128,1)] text-sm mt-2">
          New admin accounts will be created with standard administrative access including user management, content moderation, and basic analytics.
        </p>
      </div>

      {/* Password Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput 
        name="password"
        placeholder="Enter secure password" 
        disabled={isLoading}
      />

      {/* Confirm Password Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Confirm Password
      </label>
      <PasswordInput 
        name="confirmPassword"
        placeholder="Confirm password" 
        disabled={isLoading}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Creating Admin Account...
          </span>
        ) : (
          'Create Admin Account'
        )}
      </button>

      {/* Navigation Links */}
      <div className="text-center space-y-2 pt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          disabled={isLoading}
          className="text-[#2e2e2e] text-sm hover:underline disabled:opacity-50 font-['Urbanist',Helvetica]"
        >
          ← Back to Admin Dashboard
        </button>
      </div>
    </form>
  );
};

export default CreateAdminForm;