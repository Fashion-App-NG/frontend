/**
 * Format date to a human-readable string
 * @param {string|Date} dateStr - Date string or Date object to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return null;
  
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (dateStr) => {
  if (!dateStr) return "";
  
  const date = new Date(dateStr);
  const now = new Date();
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return "";
  
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? "yesterday" : `${days} days ago`;
  } else {
    return formatDate(date);
  }
};