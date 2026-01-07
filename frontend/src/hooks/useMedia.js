import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentMedia, setSearchResults, setLoading, setError } from '../store/slices/mediaSlice'
import { mediaService } from '../services/mediaService'

export const useMedia = (type, id) => {
  const dispatch = useDispatch()
  const [loading, setLoadingState] = useState(true)
  const [error, setErrorState] = useState(null)
  const media = useSelector((state) => state.media.currentMedia)

  useEffect(() => {
    const fetchMedia = async () => {
      if (!type || !id) {
        setLoadingState(false)
        return
      }

      setLoadingState(true)
      setErrorState(null)

      try {
        const data = await mediaService.getDetails(type, id)
        dispatch(setCurrentMedia(data))
      } catch (err) {
        setErrorState(err.message)
        dispatch(setError(err.message))
      } finally {
        setLoadingState(false)
        dispatch(setLoading(false))
      }
    }

    fetchMedia()
  }, [type, id, dispatch])

  return { media, loading, error }
}

export const useMediaSearch = () => {
  const dispatch = useDispatch()
  const [loading, setLoadingState] = useState(false)
  const searchResults = useSelector((state) => state.media.searchResults)

  const search = async (query, filters = {}) => {
    if (!query) return

    setLoadingState(true)
    try {
      const results = await mediaService.search(query, filters)
      dispatch(setSearchResults(results))
      return results
    } catch (error) {
      console.error('Search error:', error)
      throw error
    } finally {
      setLoadingState(false)
    }
  }

  return { search, searchResults, loading }
}
