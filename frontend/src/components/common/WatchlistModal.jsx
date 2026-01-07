import { useState } from 'react'
import { X } from 'lucide-react'
import { listsService } from '../../services/listsService'
import { useDispatch } from 'react-redux'
import { addToList, removeFromList } from '../../store/slices/userListsSlice'
import { getRealMediaType } from '../../utils/mediaHelpers'

const LIST_TYPES = [
  { id: 'watching', label: 'Watching' },
  { id: 'planned', label: 'Planned' },
  { id: 'completed', label: 'Completed' },
  { id: 'onHold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
]

const WatchlistModal = ({ isOpen, onClose, media }) => {
  const dispatch = useDispatch()
  const [selectedList, setSelectedList] = useState('planned')
  const [isAdding, setIsAdding] = useState(false)

  if (!isOpen || !media) return null

  const handleAdd = async () => {
    const detectedType = getRealMediaType(media)
    const mediaId = media.id || media.mediaId
    
    // Optimistic update: Add to Redux state immediately
    dispatch(addToList({
      listType: selectedList,
      item: {
        ...media,
        mediaId,
        mediaType: detectedType,
        posterUrl: media.poster || media.poster_path || media.coverImage?.large || media.coverImage,
      }
    }))
    
    // Close modal immediately for better UX
    onClose()

    // Make API call in background (non-blocking)
    setIsAdding(true)
    try {
      const listData = {
        mediaId,
        mediaType: detectedType,
        listType: selectedList,
        posterUrl: media.poster || media.poster_path || media.coverImage?.large || media.coverImage,
      }
      
      const result = await listsService.addToList(listData)
      
      // Update with server response (in case of any corrections)
      if (result?.data) {
        dispatch(addToList({
          listType: selectedList,
          item: {
            ...media,
            ...result.data,
            mediaId,
            posterUrl: listData.posterUrl,
          }
        }))
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      // Revert optimistic update on error
      dispatch(removeFromList({ listType: selectedList, mediaId }))
      alert('Failed to add to watchlist')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/10 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add to Watchlist</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-zinc-400 mb-4">Select a list to add this item to:</p>
          <div className="space-y-2">
            {LIST_TYPES.map((list) => (
              <button
                key={list.id}
                onClick={() => setSelectedList(list.id)}
                className={`w-full text-left px-4 py-3 border transition-all ${
                  selectedList === list.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-white hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {list.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="flex-1 px-4 py-2 bg-primary text-black font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WatchlistModal

