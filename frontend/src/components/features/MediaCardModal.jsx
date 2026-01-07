import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import Button from '../common/Button'
import ListSelector from './ListSelector'
import ProgressTracker from './ProgressTracker'
import RatingSelector from './RatingSelector'
import { addToList, updateListItem, removeFromList } from '../../store/slices/userListsSlice'
import { openModal } from '../../store/slices/uiSlice'
import { listsService } from '../../services/listsService'
import { getRealMediaType } from '../../utils/mediaHelpers'
import { Trash2 } from 'lucide-react'

const MediaCardModal = ({ open, onOpenChange, media }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const userLists = useSelector(state => state.userLists.lists)

  const [selectedList, setSelectedList] = useState('')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingItem, setExistingItem] = useState(null)
  const [existingListType, setExistingListType] = useState('')

  // Initialization
  useEffect(() => {
    if (open && isAuthenticated && userLists) {
      // Check if media is already in a list
      let found = null
      let foundList = ''

      const mediaIdToCheck = String(media.id || media.mediaId)

      Object.keys(userLists).forEach(listKey => {
        const item = userLists[listKey]?.find(i => String(i.mediaId) === mediaIdToCheck)
        if (item) {
          found = item
          foundList = listKey
        }
      })

      if (found) {
        setExistingItem(found)
        setExistingListType(foundList)
        setSelectedList(foundList)
        setRating(found.rating || 0)
        setNotes(found.notes || '')
      } else {
        setExistingItem(null)
        setExistingListType('')
        setSelectedList('')
        setRating(0)
        setNotes('')
      }
    }
  }, [open, media, userLists, isAuthenticated])


  const handleSave = async () => {
    if (!isAuthenticated) {
      dispatch(openModal({ modalName: 'guestAction' }))
      return
    }

    if (!selectedList) {
      alert('Please select a list')
      return
    }

    // Use getRealMediaType to ensure correct type detection (anime, manhwa, etc.)
    const detectedType = getRealMediaType(media)
    const mediaId = media.id || media.mediaId
    
    // Optimistic update: Update Redux state immediately
    if (existingItem && selectedList !== existingListType) {
      dispatch(removeFromList({ 
        listType: existingListType, 
        mediaId: existingItem.mediaId 
      }))
    }
    
    // Optimistically add to selected list
    dispatch(
      addToList({
        listType: selectedList,
        item: {
          ...media,
          mediaId,
          mediaType: detectedType,
          rating,
          notes,
          posterUrl: media.poster || media.poster_path || media.coverImage?.large || media.coverImage,
        },
      })
    )

    // Close modal immediately for better UX
    onOpenChange(false)

    // Make API call in background (non-blocking)
    setLoading(true)
    try {
      const listData = {
        mediaId,
        mediaType: detectedType,
        listType: selectedList,
        rating: rating || undefined,
        notes: notes || undefined,
      }

      const result = await listsService.addToList(listData)
      
      // Update with server response (in case of any corrections)
      if (result?.data) {
        dispatch(
          addToList({
            listType: selectedList,
            item: {
              ...media,
              ...result.data,
              mediaId,
              rating,
              notes,
            },
          })
        )
      }
    } catch (error) {
      console.error('Error adding to list:', error)
      // Revert optimistic update on error
      if (existingItem && selectedList !== existingListType) {
        dispatch(addToList({
          listType: existingListType,
          item: existingItem,
        }))
      }
      dispatch(removeFromList({ 
        listType: selectedList, 
        mediaId 
      }))
      alert('Failed to add to list')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!existingItem || !existingItem._id) return
    
    const mediaId = existingItem.mediaId
    const listType = existingListType
    
    // Optimistic update: Remove from Redux state immediately
    dispatch(removeFromList({ listType, mediaId }))
    
    // Close modal immediately
    onOpenChange(false)

    // Make API call in background (non-blocking)
    setLoading(true)
    try {
      await listsService.removeFromList(existingItem._id)

      // Trigger profile stats refresh (debounced in Profile component)
      window.dispatchEvent(new CustomEvent('listUpdated', { 
        detail: { action: 'removed', mediaId } 
      }))
    } catch (e) {
      console.error("Failed to remove", e)
      // Revert optimistic update on error
      dispatch(addToList({
        listType,
        item: existingItem,
      }))
      alert('Failed to remove from list')
    } finally {
      setLoading(false)
    }
  }

  if (!media) return null

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={media.title || media.name}>
      <div className="space-y-4 sm:space-y-6">
        <ListSelector value={selectedList} onChange={setSelectedList} />

        {(media.type === 'tv' || media.type === 'anime') && (
          <ProgressTracker media={media} />
        )}

        <RatingSelector value={rating} onChange={setRating} />

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] sm:min-h-[100px] rounded-md border border-input bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
            placeholder="Add your thoughts..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 bg-zinc-900/50 p-3 sm:p-4 rounded-lg -mx-4 sm:-mx-5 md:-mx-6 mb-[-1rem] sm:mb-[-1.5rem] mt-4 sm:mt-6 md:mt-8 border-t border-white/10">
          {existingItem ? (
            <Button variant="ghost" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 sm:px-3 text-xs sm:text-sm justify-start sm:justify-center">
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
              <span className="whitespace-nowrap">Remove from List</span>
            </Button>
          ) : <div></div>}

          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !selectedList} className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default MediaCardModal


