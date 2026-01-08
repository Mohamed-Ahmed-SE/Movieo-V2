import { memo } from 'react'
import { Calendar, Clock, Globe, Activity, Layers, FileText, Timer } from 'lucide-react'
import { cn } from '../../utils/cn'

const AboutSection = memo(({ media }) => {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-primary rounded-full"></div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Overview</h2>
      </div>

      {/* Storyline Card */}
      <div className="relative group overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 transition-all hover:bg-zinc-900/50 hover:border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FileText className="w-24 h-24 text-white rotate-12" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          Storyline
        </h3>
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-light relative z-10">
          {media.overview || media.description || 'No description available for this title.'}
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Status */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all hover:bg-zinc-900/50 hover:scale-[1.02] hover:border-white/10 group">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Status</p>
            <p className="text-white font-semibold text-base sm:text-lg capitalize">{media.status || 'Released'}</p>
          </div>
        </div>

        {/* Release Date */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all hover:bg-zinc-900/50 hover:scale-[1.02] hover:border-white/10 group">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Released</p>
            <p className="text-white font-semibold text-base sm:text-lg">
              {(() => {
                const date = media.releaseDate || media.release_date || media.first_air_date
                if (date) {
                  try {
                    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  } catch {
                    return date
                  }
                }
                return 'N/A'
              })()}
            </p>
          </div>
        </div>

        {/* Duration/Episodes */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all hover:bg-zinc-900/50 hover:scale-[1.02] hover:border-white/10 group">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            {(media.type === 'manga' || media.type === 'manhwa') ? (
              <Layers className="w-5 h-5 text-emerald-400" />
            ) : (
              <Timer className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">
              {(() => {
                if (media.type === 'manga' || media.type === 'manhwa') return 'Chapters'
                if (media.type === 'anime' || media.type === 'tv') return 'Episodes'
                return 'Runtime'
              })()}
            </p>
            <p className="text-white font-semibold text-base sm:text-lg">
              {(() => {
                // For manga/manhwa, show chapters
                if (media.type === 'manga' || media.type === 'manhwa') {
                  const chapters = media.totalChapters || media.chapters
                  if (chapters && chapters > 0) return `${chapters}`
                  return 'Ongoing'
                }
                // For anime/TV, show episodes
                if (media.type === 'anime' || media.type === 'tv') {
                  const episodes = media.totalEpisodes || media.episodes || media.number_of_episodes
                  if (episodes) return `${episodes}`
                  return 'TBA'
                }
                // For movies, show runtime
                const runtime = media.runtime || media.episode_run_time?.[0] || media.duration
                if (runtime) return `${runtime}m`
                return 'N/A'
              })()}
            </p>
          </div>
        </div>

        {/* Language */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all hover:bg-zinc-900/50 hover:scale-[1.02] hover:border-white/10 group">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Language</p>
            <p className="text-white font-semibold text-base sm:text-lg capitalize">
              {(() => {
                const lang = media.original_language || media.originalLanguage || media.language
                if (lang) {
                  const langMap = {
                    'en': 'English', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
                    'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
                    'pt': 'Portuguese', 'ru': 'Russian', 'ar': 'Arabic', 'hi': 'Hindi'
                  }
                  return langMap[lang] || lang.toUpperCase()
                }
                return 'N/A'
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Genres Chips */}
      {media.genres && media.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {media.genres.map((genre, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-zinc-200 text-xs sm:text-sm font-medium rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-default"
            >
              {typeof genre === 'string' ? genre : (genre?.name || genre)}
            </span>
          ))}
        </div>
      )}
    </section>
  )
})

AboutSection.displayName = 'AboutSection'

export default AboutSection
