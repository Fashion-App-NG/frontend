/**
 * Utility functions for validation across the application
 */

/**
 * Validates if a vendor profile has all required fields for Terminal delivery integration
 * @param {Object} profile - The vendor profile object
 * @returns {boolean} - True if profile has all required fields
 */
export const validateVendorProfileCompleteness = (profile) => {
  if (!profile) return false;
  
  // Check if required fields for Terminal delivery integration are present
  return !!(
    profile.businessInfo?.contactPerson?.name && 
    profile.businessInfo?.contactPerson?.phone &&
    profile.businessInfo?.contactPerson?.email &&
    profile.pickupAddress?.street &&
    profile.pickupAddress?.city &&
    profile.pickupAddress?.state &&
    profile.pickupAddress?.zipCode
  );
};

/**
 * Check if profile is complete via API call
 * @param {Function} navigate - React Router navigate function
 * @param {boolean} showToast - Whether to show toast notifications
 * @param {Object} toastInstance - Toast notification instance (optional)
 * @returns {Promise<boolean>} - True if profile is complete
 */
export const checkProfileCompleteness = async (navigate, showToast = true, toastInstance = null) => {
  try {
    const userService = await import('../services/userService').then(module => module.default);
    const response = await userService.getVendorProfile();
    
    if (!response.success || !response.data) {
      return false;
    }
    
    const profile = response.data.vendorProfile || response.data;
    const isComplete = validateVendorProfileCompleteness(profile);
    
    if (!isComplete && showToast) {
      // Use toast if available, otherwise fallback to alert
      if (toastInstance) {
        toastInstance.warning('Your profile is incomplete. Please complete your contact information and pickup address before scheduling items for pickup.');
      }
      
      if (navigate) {
        navigate('/vendor/profile');
      }
    }
    
    return isComplete;
  } catch (error) {
    console.error('Error checking profile:', error);
    
    if (showToast && toastInstance) {
      toastInstance.error('Failed to check profile completeness. Please ensure your profile is complete before scheduling pickups.');
    }
    
    return false;
  }
};