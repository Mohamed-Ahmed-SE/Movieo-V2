import { memo } from 'react'

const SidebarInfo = memo(({ media, posterUrl }) => {
  return (
    <aside className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Poster */}
      {posterUrl && (
        <div className="aspect-[2/3] overflow-hidden w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-none mx-auto lg:mx-0">
          <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      {/* Information */}
      <div>
        <h4 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Information</h4>
        <ul className="space-y-4 text-sm">
          {media.production_companies && media.production_companies.length > 0 && (
            <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Studios</span>
              <span className="text-zinc-200 text-sm">{media.production_companies.map(c => c.name).join(', ')}</span>
            </li>
          )}
          <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
            <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Type</span>
            <span className="text-zinc-200 text-sm capitalize">{media.type || 'Movie'}</span>
          </li>
          {media.genres && media.genres.length > 0 && (
            <li className="flex flex-col gap-2 border-b border-white/10 pb-3">
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Genres</span>
              <div className="flex flex-wrap gap-2">
                {media.genres.map((genre, idx) => (
                  <span key={idx} className="px-3 py-1 bg-zinc-900 text-zinc-200 text-xs">
                    {typeof genre === 'string' ? genre : (genre?.name || genre)}
                  </span>
                ))}
              </div>
            </li>
          )}
          {media.production_countries && media.production_countries.length > 0 && (
            <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Country</span>
              <span className="text-zinc-200 text-sm">{media.production_countries.map(c => c.name).join(', ')}</span>
            </li>
          )}
          {media.revenue > 0 && (
            <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Revenue</span>
              <span className="text-zinc-200 text-sm">${(media.revenue / 1000000).toFixed(1)}M</span>
            </li>
          )}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Rating</span>
          <span className="text-white font-semibold">{Number(media.vote_average || 0).toFixed(1)}/10</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Votes</span>
          <span className="text-white font-semibold">{media.vote_count?.toLocaleString() || 0}</span>
        </div>
        {media.runtime && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Runtime</span>
            <span className="text-white font-semibold">{media.runtime}m</span>
          </div>
        )}
        {(media.type === 'anime' || media.type === 'tv') && (media.totalEpisodes || media.episodes) && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Episodes</span>
            <span className="text-white font-semibold">{media.totalEpisodes || media.episodes}</span>
          </div>
        )}
        {(media.type === 'manga' || media.type === 'manhwa') && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Chapters</span>
            <span className="text-white font-semibold">
              {media.totalChapters || media.chapters 
                ? `${media.totalChapters || media.chapters}${media._chaptersEstimated ? ' (est.)' : ''}`
                : 'Ongoing'}
            </span>
          </div>
        )}
        {(media.type === 'manga' || media.type === 'manhwa') && media.totalVolumes && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Volumes</span>
            <span className="text-white font-semibold">{media.totalVolumes}</span>
          </div>
        )}
      </div>
    </aside>
  )
})

SidebarInfo.displayName = 'SidebarInfo'

export default SidebarInfo

