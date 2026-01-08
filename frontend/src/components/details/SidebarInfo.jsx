import { memo } from 'react'
import { Building2, Film, Globe, DollarSign, Star, Vote, Clock, Layers, BookOpen } from 'lucide-react'

const SidebarInfo = memo(({ media, posterUrl }) => {
  return (
    <aside className="space-y-6 sm:space-y-8">
      {/* Poster */}
      {posterUrl && (
        <div className="aspect-[2/3] overflow-hidden w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-none mx-auto lg:mx-0 rounded-2xl shadow-2xl border border-white/10 group relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={posterUrl}
            alt="Poster"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      )}

      {/* Information Card */}
      <div className="bg-zinc-900/20 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-6">
        <h4 className="text-white font-bold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          Information
        </h4>

        <ul className="space-y-5">
          {media.production_companies && media.production_companies.length > 0 && (
            <li className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Studios
              </span>
              <span className="text-zinc-200 text-sm font-medium pl-4.5 border-l-2 border-white/10">
                {media.production_companies.map(c => c.name).join(', ')}
              </span>
            </li>
          )}

          <li className="flex flex-col gap-1.5">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Type
            </span>
            <span className="text-zinc-200 text-sm font-medium pl-4.5 border-l-2 border-white/10 capitalize">
              {media.type || 'Movie'}
            </span>
          </li>

          {media.production_countries && media.production_countries.length > 0 && (
            <li className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Country
              </span>
              <span className="text-zinc-200 text-sm font-medium pl-4.5 border-l-2 border-white/10">
                {media.production_countries.map(c => c.name).join(', ')}
              </span>
            </li>
          )}

          {media.revenue > 0 && (
            <li className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Revenue
              </span>
              <span className="text-zinc-200 text-sm font-medium pl-4.5 border-l-2 border-white/10">
                ${(media.revenue / 1000000).toFixed(1)}M
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-gradient-to-br from-zinc-900/40 to-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-4">
        <h4 className="text-white font-bold text-lg mb-4">Statistics</h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-zinc-400 text-sm">Rating</span>
            </div>
            <span className="text-white font-bold">
              {(() => {
                const score = media.rating || media.vote_average || media.averageScore || media.score
                if (score !== undefined && score !== null) {
                  // If score is > 10 (likely 0-100 scale), convert to 0-10
                  if (score > 10) return (score / 10).toFixed(1)
                  return Number(score).toFixed(1)
                }
                return 'N/A'
              })()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Vote className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-zinc-400 text-sm">
                {(media.type === 'anime' || media.type === 'manga' || media.type === 'manhwa') ? 'Popularity' : 'Votes'}
              </span>
            </div>
            <span className="text-white font-bold">
              {(() => {
                const count = media.vote_count || media.popularity || media.favourites
                return count ? count.toLocaleString() : 'N/A'
              })()}
            </span>
          </div>

          {media.runtime ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-zinc-500/10">
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-sm">Runtime</span>
              </div>
              <span className="text-white font-bold">{media.runtime}m</span>
            </div>
          ) : null}

          {(media.type === 'anime' || media.type === 'tv') && (media.totalEpisodes || media.episodes) ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-indigo-500/10">
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-zinc-400 text-sm">Episodes</span>
              </div>
              <span className="text-white font-bold">{media.totalEpisodes || media.episodes}</span>
            </div>
          ) : null}

          {(media.type === 'manga' || media.type === 'manhwa') ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-500/10">
                    <BookOpen className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-zinc-400 text-sm">Chapters</span>
                </div>
                <span className="text-white font-bold">
                  {media.totalChapters || media.chapters
                    ? `${media.totalChapters || media.chapters}${media._chaptersEstimated ? ' (est.)' : ''}`
                    : 'Ongoing'}
                </span>
              </div>
              {media.totalVolumes && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-500/10">
                      <Layers className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Volumes</span>
                  </div>
                  <span className="text-white font-bold">{media.totalVolumes}</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </aside>
  )
})

SidebarInfo.displayName = 'SidebarInfo'

export default SidebarInfo
