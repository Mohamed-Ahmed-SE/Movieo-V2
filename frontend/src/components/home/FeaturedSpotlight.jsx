import { useNavigate } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { memo } from 'react'

const FeaturedSpotlight = memo(({ items = [] }) => {
  const navigate = useNavigate()
  
  if (!items || items.length === 0) return null

  const featured = items[0]
  const secondary = items.slice(1, 4)

  const handleClick = (item) => {
    const type = item.type || item.mediaType || 'movie'
    const id = item.id || item.mediaId
    navigate(`/details/${type}/${id}`)
  }

  return (
    <section className="w-full py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Featured Spotlight</h2>
        <p className="text-zinc-400 text-sm sm:text-base">Handpicked content you don't want to miss</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Large Featured Card */}
        {featured && (
          <div
            onClick={() => handleClick(featured)}
            className="lg:col-span-2 group relative h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url(${featured.backdrop || featured.backdrop_path || featured.bannerImage || featured.poster || featured.poster_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  {featured.vote_average && (
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-sm">{featured.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-white/80 text-sm capitalize">{featured.type || 'movie'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white line-clamp-2">
                  {featured.title || featured.name}
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base line-clamp-2 max-w-2xl">
                  {featured.overview || featured.description}
                </p>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold px-6 py-3 rounded-lg transition-all hover:scale-105 w-fit">
                  <Play className="h-5 w-5" />
                  <span>Watch Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Cards */}
        <div className="space-y-4 sm:space-y-6">
          {secondary.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => handleClick(item)}
              className="group relative h-[120px] sm:h-[140px] md:h-[180px] rounded-xl overflow-hidden cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${item.poster || item.poster_path || item.coverImage?.large || item.backdrop || item.backdrop_path})`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              
              <div className="absolute inset-0 flex items-end p-4">
                <div className="w-full">
                  <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2 mb-1">
                    {item.title || item.name}
                  </h4>
                  {item.vote_average && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white/80 text-xs">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturedSpotlight.displayName = 'FeaturedSpotlight'
export default FeaturedSpotlight
