/**
 * Standardized API response helpers
 */

/**
 * Success response wrapper
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  }
}

/**
 * Error response wrapper
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Additional error details
 * @returns {Object} Formatted error response
 */
export const errorResponse = (message = 'An error occurred', statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(errors && { errors }),
  }
}

/**
 * Paginated response wrapper
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, page = 1, limit = 20, total = null) => {
  const totalItems = total !== null ? total : data.length
  const totalPages = Math.ceil(totalItems / limit)

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

