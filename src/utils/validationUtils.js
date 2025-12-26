/**
 * Utility functions for validation across the application
 */

/**
 * Validates if a vendor profile has all required fields for Terminal delivery integration
 * @param {Object} profile - The vendor profile object
 * @returns {boolean} - True if profile has all required fields
 */
export const validateVendorProfileCompleteness = (profileData) => {
  const missingFields = [];

  // Check required fields
  if (!profileData.storeName || profileData.storeName.trim() === '') {
    missingFields.push('Store Name');
  }

  if (!profileData.pickupAddress?.street || profileData.pickupAddress.street.trim() === '') {
    missingFields.push('Pickup Street Address');
  }

  if (!profileData.pickupAddress?.city || profileData.pickupAddress.city.trim() === '') {
    missingFields.push('Pickup City');
  }

  if (!profileData.pickupAddress?.state || profileData.pickupAddress.state.trim() === '') {
    missingFields.push('Pickup State');
  }

  if (!profileData.businessInfo?.contactPerson?.name || profileData.businessInfo.contactPerson.name.trim() === '') {
    missingFields.push('Contact Person Name');
  }

  if (!profileData.businessInfo?.contactPerson?.phone || profileData.businessInfo.contactPerson.phone.trim() === '') {
    missingFields.push('Contact Phone');
  }

  if (!profileData.businessInfo?.contactPerson?.email || profileData.businessInfo.contactPerson.email.trim() === '') {
    missingFields.push('Contact Email');
  }

  if (!profileData.businessInfo?.bankDetails?.accountNumber || profileData.businessInfo.bankDetails.accountNumber.trim() === '') {
    missingFields.push('Bank Account Number');
  }

  if (!profileData.businessInfo?.bankDetails?.accountName || profileData.businessInfo.bankDetails.accountName.trim() === '') {
    missingFields.push('Bank Account Name');
  }

  if (!profileData.businessInfo?.bankDetails?.bankName || profileData.businessInfo.bankDetails.bankName.trim() === '') {
    missingFields.push('Bank Name');
  }

  // ✅ IMPORTANT: Always return a consistent object structure
  return {
    isComplete: missingFields.length === 0,
    missingFields: missingFields, // Always return an array (even if empty)
    completionPercentage: Math.round(((10 - missingFields.length) / 10) * 100)
  };
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