import { useState, useEffect } from 'react'

const ProgressTracker = ({ media, initialProgress, onProgressChange }) => {
  // Get total from media (cannot be changed by user)
  const mediaTotal = media.totalEpisodes || media.total_episodes || 0
  const [currentEpisode, setCurrentEpisode] = useState(
    initialProgress?.currentEpisode || initialProgress?.currentEpisodes || 0
  )
  // Total is readonly - use media total
  const totalEpisodes = mediaTotal

  useEffect(() => {
    if (initialProgress?.currentEpisode !== undefined) {
      setCurrentEpisode(initialProgress.currentEpisode)
    } else if (initialProgress?.currentEpisodes !== undefined) {
      setCurrentEpisode(initialProgress.currentEpisodes)
    }
  }, [initialProgress])

  useEffect(() => {
    if (mediaTotal && currentEpisode > mediaTotal) {
      // Auto-correct if current exceeds total
      setCurrentEpisode(mediaTotal)
    }
  }, [mediaTotal])

  const handleCurrentChange = (value) => {
    const numValue = parseInt(value) || 0
    // Validate: cannot be less than 0 or greater than total
    const validatedValue = Math.max(0, Math.min(numValue, totalEpisodes || 0))
    setCurrentEpisode(validatedValue)
    // Notify parent component if callback provided
    if (onProgressChange) {
      onProgressChange({ currentEpisode: validatedValue, totalEpisodes })
    }
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block text-white">Progress</label>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max={totalEpisodes || 9999}
              value={currentEpisode}
              onChange={(e) => handleCurrentChange(e.target.value)}
              className="w-20 rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-zinc-400">/</span>
            <input
              type="number"
              value={totalEpisodes}
              readOnly
              disabled
              className="w-20 rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
              placeholder="Total"
            />
            <span className="text-sm text-zinc-400">episodes</span>
          </div>
          {totalEpisodes > 0 && (
            <div className="mt-2">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((currentEpisode / totalEpisodes) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {Math.round(Math.min((currentEpisode / totalEpisodes) * 100, 100))}% complete
              </p>
            </div>
          )}
          {currentEpisode > totalEpisodes && totalEpisodes > 0 && (
            <p className="text-xs text-red-400 mt-1">Current cannot exceed total episodes</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker
