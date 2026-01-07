import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { memo } from 'react'

const BentoGrid = memo(({ items = [] }) => {
  const navigate = useNavigate()
  
  if (!items || items.length === 0) return null

  const gridItems = items.slice(0, 6)

  const handleClick = (item) => {
    const type = item.type || item.mediaType || 'movie'
    const id = item.id || item.mediaId
    navigate(`/details/${type}/${id}`)
  }

  return (
    <section className="w-full py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Bento Collection</h2>
        <p className="text-zinc-400 text-sm sm:text-base">Curated picks in a beautiful grid</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Large Card - Top Left */}
        {gridItems[0] && (
          <div
            onClick={() => handleClick(gridItems[0])}
            className="md:col-span-2 md:row-span-2 group relative h-[200px] sm:h-[250px] md:h-[400px] rounded-xl overflow-hidden cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url(${gridItems[0].backdrop || gridItems[0].backdrop_path || gridItems[0].bannerImage || gridItems[0].poster || gridItems[0].poster_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4 sm:p-6">
              <div className="w-full">
                <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl line-clamp-2 mb-2">
                  {gridItems[0].title || gridItems[0].name}
                </h3>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-lg transition-all hover:scale-105 w-fit text-sm">
                  <Play className="h-4 w-4" />
                  <span>Watch</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medium Cards - Top Right */}
        {gridItems[1] && (
          <div
            onClick={() => handleClick(gridItems[1])}
            className="md:col-span-2 group relative h-[200px] sm:h-[250px] md:h-[190px] rounded-xl overflow-hidden cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url(${gridItems[1].backdrop || gridItems[1].backdrop_path || gridItems[1].poster || gridItems[1].poster_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4">
              <h4 className="text-white font-bold text-base sm:text-lg line-clamp-2">
                {gridItems[1].title || gridItems[1].name}
              </h4>
            </div>
          </div>
        )}

        {gridItems[2] && (
          <div
            onClick={() => handleClick(gridItems[2])}
            className="md:col-span-2 group relative h-[200px] sm:h-[250px] md:h-[190px] rounded-xl overflow-hidden cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url(${gridItems[2].backdrop || gridItems[2].backdrop_path || gridItems[2].poster || gridItems[2].poster_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4">
              <h4 className="text-white font-bold text-base sm:text-lg line-clamp-2">
                {gridItems[2].title || gridItems[2].name}
              </h4>
            </div>
          </div>
        )}

        {/* Small Cards - Bottom Row */}
        {gridItems.slice(3, 6).map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleClick(item)}
            className="group relative h-[150px] sm:h-[180px] md:h-[190px] rounded-xl overflow-hidden cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url(${item.poster || item.poster_path || item.coverImage?.large || item.backdrop || item.backdrop_path})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-end p-3 sm:p-4">
              <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2">
                {item.title || item.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})

BentoGrid.displayName = 'BentoGrid'
export default BentoGrid
