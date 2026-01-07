import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronRight } from 'lucide-react'
import EpisodeSkeleton from './skeletons/EpisodeSkeleton'
import { cn } from '../../utils/cn'

const EpisodesSection = memo(({ 
  episodes, 
  loading, 
  type, 
  id, 
  selectedSeason, 
  seasons, 
  onSeasonChange,
  isChapters = false,
  totalEpisodes,
  totalChapters,
  showAllLimit = 20
}) => {
  const getImageUrl = (path, size = 'w500') => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  if (loading) {
    return <EpisodeSkeleton count={8} />
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg">No episodes available for this season.</p>
      </div>
    )
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Season Selector */}
      {seasons && seasons.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-3">
          {seasons
            .filter(season => season.season_number !== 0)
            .map((season) => (
              <button
                key={season.season_number}
                onClick={() => onSeasonChange(season.season_number)}
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-lg",
                  selectedSeason === season.season_number
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                Season {season.season_number}
              </button>
            ))}
        </div>
      )}

      {/* Episode/Chapter Grid - Crunchyroll Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {episodes.slice(0, showAllLimit).map((episode, index) => {
          const displayNum = isChapters ? (episode.chapter_number || episode.episode_number || index + 1) : (episode.episode_number || index + 1)
          const titlePrefix = isChapters ? 'Chapter' : 'Episode'
          const stillUrl = episode.still_path 
            ? getImageUrl(episode.still_path, 'w500')
            : null

          return (
            <Link
              key={episode.id || displayNum || index}
              to={isChapters 
                ? `/${type}/${id}/episodes?season=1&episode=${displayNum}`
                : `/${type}/${id}/episodes?season=${selectedSeason}&episode=${displayNum}`
              }
              className="group relative aspect-video overflow-hidden rounded-xl"
            >
              {/* Episode/Chapter Image */}
              {stillUrl ? (
                <img
                  src={stillUrl}
                  alt={episode.name || `${titlePrefix} ${displayNum}`}
                  className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <Play className="h-12 w-12 text-zinc-600" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Episode/Chapter Info */}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-xs text-white opacity-80 font-semibold">
                  {titlePrefix} {displayNum}
                </span>
                <h4 className="text-sm font-semibold text-white line-clamp-2 mt-1">
                  {episode.name || `${titlePrefix} ${displayNum}`}
                </h4>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Show All Button */}
      {episodes.length > showAllLimit && (
        <div className="flex justify-center pt-4">
          <Link
            to={`/${type}/${id}/episodes?season=${isChapters ? 1 : selectedSeason}${isChapters ? '&chapters=true' : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white font-semibold transition-all group"
          >
            <span>Show All {isChapters ? 'Chapters' : 'Episodes'} ({episodes.length})</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </section>
  )
})

EpisodesSection.displayName = 'EpisodesSection'

export default EpisodesSection

