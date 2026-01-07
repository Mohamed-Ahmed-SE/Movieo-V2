import { memo } from 'react'
import { cn } from '../../utils/cn'

const AboutSection = memo(({ media }) => {
  return (
    <section className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="h-1 w-12 bg-primary"></div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">About</h2>
      </div>

      {/* Storyline */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Storyline</h3>
        <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-light">
          {media.overview || media.description || 'No description available.'}
        </p>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider mb-2 font-semibold">Status</p>
          <p className="text-white font-bold text-sm sm:text-base md:text-lg">{media.status || 'Released'}</p>
        </div>
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider mb-2 font-semibold">Release Date</p>
          <p className="text-white font-bold text-sm sm:text-base md:text-lg">
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
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider mb-2 font-semibold">Language</p>
          <p className="text-white font-bold uppercase text-sm sm:text-base md:text-lg">
            {(() => {
              const lang = media.original_language || media.originalLanguage || media.language
              if (lang) {
                // Convert language code to full name if it's a 2-letter code
                const langMap = {
                  'en': 'English',
                  'ja': 'Japanese',
                  'ko': 'Korean',
                  'zh': 'Chinese',
                  'es': 'Spanish',
                  'fr': 'French',
                  'de': 'German',
                  'it': 'Italian',
                  'pt': 'Portuguese',
                  'ru': 'Russian',
                  'ar': 'Arabic',
                  'hi': 'Hindi'
                }
                return langMap[lang] || lang.toUpperCase()
              }
              return 'N/A'
            })()}
          </p>
        </div>
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider mb-2 font-semibold">
            {(() => {
              if (media.type === 'manga' || media.type === 'manhwa') {
                return 'Chapters'
              } else if (media.type === 'anime' || media.type === 'tv') {
                return 'Episodes'
              }
              return 'Runtime'
            })()}
          </p>
          <p className="text-white font-bold text-sm sm:text-base md:text-lg">
            {(() => {
              // For manga/manhwa, show chapters
              if (media.type === 'manga' || media.type === 'manhwa') {
                const chapters = media.totalChapters || media.chapters
                if (chapters && chapters > 0) {
                  return `${chapters} Chapter${chapters > 1 ? 's' : ''}`
                }
                return 'Ongoing'
              }
              // For anime/TV, show episodes
              if (media.type === 'anime' || media.type === 'tv') {
                const episodes = media.totalEpisodes || media.episodes || media.number_of_episodes
                if (episodes) {
                  return `${episodes} Episode${episodes > 1 ? 's' : ''}`
                }
                return 'N/A'
              }
              // For movies, show runtime
              const runtime = media.runtime || media.episode_run_time?.[0] || media.duration
              if (runtime) {
                return `${runtime}m`
              }
              return 'N/A'
            })()}
          </p>
        </div>
      </div>

      {/* Genres */}
      {media.genres && media.genres.length > 0 && (
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Genres</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {media.genres.map((genre, idx) => (
              <span 
                key={idx} 
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/20 text-primary border border-primary/30 font-semibold text-xs sm:text-sm rounded-lg hover:bg-primary/30 transition-colors"
              >
                {typeof genre === 'string' ? genre : (genre?.name || genre)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
})

AboutSection.displayName = 'AboutSection'

export default AboutSection

