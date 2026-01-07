import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLists, setLoading } from '../store/slices/userListsSlice'
import { listsService } from '../services/listsService'

export const useUserLists = () => {
  const dispatch = useDispatch()
  const { lists, isLoading } = useSelector((state) => state.userLists)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchLists = async () => {
        dispatch(setLoading(true))
        try {
          const data = await listsService.getUserLists()
          dispatch(setLists(data))
        } catch (error) {
          console.error('Error fetching lists:', error)
        } finally {
          dispatch(setLoading(false))
        }
      }

      fetchLists()
    }
  }, [isAuthenticated, dispatch])

  return { lists, isLoading }
}


