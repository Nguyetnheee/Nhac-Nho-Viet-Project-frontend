/**
 * Utility functions for date formatting
 */

/**
 * Format solar date for display
 * @param {string} dateSolar - The solar date string
 * @returns {string} - Formatted date or fallback text
 */
export const formatSolarDate = (dateSolar) => {
  if (!dateSolar) {
    return 'Chưa xác định';
  }
  
  // Check if it's a special case (not a real date)
  if (dateSolar === 'Tùy theo ngày khởi công' || dateSolar === 'Tùy theo ngày sinh') {
    return dateSolar;
  }
  
  try {
    const date = new Date(dateSolar);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateSolar; // Return original string if invalid
    }
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateSolar; // Return original string if error
  }
};

/**
 * Check if a date string is a valid date
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if valid date, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  if (dateString === 'Tùy theo ngày khởi công' || dateString === 'Tùy theo ngày sinh') {
    return false; // These are not actual dates
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};
