/**
 * Centralized localStorage management to prevent QuotaExceededError
 * caused by large base64 strings in driver profile.
 */

export const storage = {
  /**
   * Save driver data to localStorage with aggressive compaction
   */
  setDriver: (data) => {
    if (!data) {
      localStorage.removeItem('gtgl_driver');
      return;
    }

    try {
      // Destructure to remove large fields that shouldn't be in localStorage
      const { 
        documents, 
        vehicleImages, 
        profileImage, 
        licenseDoc, 
        rcDoc, 
        aadharDoc,
        // Any other potentially large fields
        ...compactData 
      } = data;

      localStorage.setItem('gtgl_driver', JSON.stringify(compactData));
    } catch (err) {
      console.warn('LocalStorage Quota Exceeded. Failed to cache driver state.', err);
      // Fail silently - app should rely on React state
    }
  },

  /**
   * Get driver data from localStorage
   */
  getDriver: () => {
    try {
      const saved = localStorage.getItem('gtgl_driver');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      return null;
    }
  },

  /**
   * Clear all app-related storage
   */
  clearAll: () => {
    const keys = [
      'gtgl_token', 'gtgl_refresh_token', 'gtgl_user',
      'gtgl_driver_token', 'gtgl_driver_refresh_token', 'gtgl_driver',
      'gtgl_admin_token', 'gtgl_admin_refresh_token',
      'gtgl_driver_stats'
    ];
    keys.forEach(k => localStorage.removeItem(k));
  }
};
