import { useState, useEffect } from 'react'
import { mediaService } from '../services/mediaService'

/**
 * Custom hook for fetching media data
 * Used in: Home, Explore, Search pages
 * @param {Function} fetchFunction - Function to fetch data (e.g., mediaService.getTrending)
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {{ data: Array, loading: boolean, error: string | null, refetch: Function }}
 */
export const useMediaFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFunction()
      // Handle different response formats
      const result = Array.isArray(response) 
        ? response 
        : (response?.results || response?.data || [])
      setData(result)
    } catch (err) {
      console.error('Error fetching media:', err)
      setError(err.message || 'Failed to fetch data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

