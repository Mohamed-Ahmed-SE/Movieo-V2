import { memo } from 'react'
import { Play, Tv, Film, BookOpen, Trophy } from 'lucide-react'
import { cn } from '../../utils/cn'

const ProfileStats = memo(({ stats }) => {
  const statItems = [
    {
      icon: Play,
      label: 'Anime Episodes',
      value: stats?.animeEpisodes || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Tv,
      label: 'Series Episodes',
      value: stats?.seriesEpisodes || 0,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Film,
      label: 'Movies Watched',
      value: stats?.moviesWatched || 0,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    {
      icon: BookOpen,
      label: 'Manga Completed',
      value: stats?.mangaCompleted || 0,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
  ]

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">Statistics</h3>
      </div>

      {/* PlayStation-style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className={cn(
                "p-4 sm:p-6 transition-all hover:scale-105",
                "bg-zinc-900/50 border border-white/5",
                item.bgColor
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={cn("p-1.5 sm:p-2", item.bgColor)}>
                  <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-400 font-semibold truncate">
                    {item.label}
                  </p>
                </div>
              </div>
              <p className={cn("text-2xl sm:text-3xl font-extrabold", item.color)}>
                {item.value.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
})

ProfileStats.displayName = 'ProfileStats'

export default ProfileStats

