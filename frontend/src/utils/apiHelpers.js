/**
 * Extract data from API responses
 * Handles different response formats
 * @param {any} response - API response
 * @returns {Array|Object} Extracted data
 */
export const extractData = (response) => {
  if (Array.isArray(response)) {
    return response
  }
  if (response?.data) {
    return Array.isArray(response.data) ? response.data : response.data
  }
  if (response?.results) {
    return response.results
  }
  return response || []
}

/**
 * Safe array extraction with fallbacks
 * @param {any} data - Data to extract array from
 * @param {Array} fallback - Fallback array
 * @returns {Array} Extracted array
 */
export const safeArray = (data, fallback = []) => {
  if (Array.isArray(data)) {
    return data
  }
  if (data?.results) {
    return Array.isArray(data.results) ? data.results : fallback
  }
  if (data?.data) {
    return Array.isArray(data.data) ? data.data : fallback
  }
  return fallback
}

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

