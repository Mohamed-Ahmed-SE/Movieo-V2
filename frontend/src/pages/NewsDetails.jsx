import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { mediaService } from '../services/mediaService'

const NewsDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [newsItem, setNewsItem] = useState(null)
  const [relatedMedia, setRelatedMedia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        // Fetch trending media to get images
        const [movies, tv, anime] = await Promise.all([
          mediaService.getTrending('movie').catch(() => []),
          mediaService.getTrending('tv').catch(() => []),
          mediaService.getTrending('anime').catch(() => [])
        ])

        const safeList = (list) => Array.isArray(list) ? list : (list?.results || [])
        const allMovies = safeList(movies)
        const allTV = safeList(tv)
        const allAnime = safeList(anime)

        // Map news IDs to content
        const newsMap = {
          1: {
            id: 1,
            title: 'New Anime Season 2024: Top 10 Must-Watch Series',
            thumbnail: allAnime[0]?.backdrop || allAnime[0]?.poster || null,
            date: '2 hours ago',
            author: 'Movieo Editorial',
            category: 'Anime',
            content: `The 2024 anime season has brought us some incredible series that are taking the world by storm. From action-packed adventures to heartwarming slice-of-life stories, there's something for everyone.

Here are the top 10 must-watch anime series of 2024:

1. **Epic Fantasy Adventure** - A stunning new series that combines breathtaking animation with an engaging storyline
2. **Sci-Fi Thriller** - Mind-bending concepts and incredible character development
3. **Romantic Comedy** - Perfect blend of humor and romance that will keep you hooked
4. **Action Shounen** - High-energy battles and compelling character arcs
5. **Mystery Drama** - Intricate plotlines that will keep you guessing until the end

Each of these series brings something unique to the table, whether it's innovative animation techniques, compelling narratives, or memorable characters. The 2024 season has truly raised the bar for anime production quality.

Don't miss out on these incredible shows that are defining the anime landscape this year!`,
            relatedMedia: allAnime[0] || null
          },
          2: {
            id: 2,
            title: 'Breaking: Major Streaming Platform Announces Exclusive Content Deal',
            thumbnail: allMovies[0]?.backdrop || allMovies[0]?.poster || null,
            date: '5 hours ago',
            author: 'Movieo Editorial',
            category: 'News',
            content: `In a groundbreaking announcement today, one of the world's leading streaming platforms has revealed an exclusive multi-year content deal that will bring unprecedented entertainment to subscribers.

The deal includes:
- Exclusive access to blockbuster movies
- Original series productions
- International content partnerships
- Enhanced streaming quality features

This partnership represents a significant shift in the streaming landscape, promising subscribers access to premium content that was previously unavailable. Industry experts are calling this one of the most significant content deals of the decade.

Subscribers can expect to see new exclusive content rolling out over the coming months, with major releases scheduled throughout the year.`,
            relatedMedia: allMovies[0] || null
          },
          3: {
            id: 3,
            title: 'Top 5 Movies to Watch This Weekend',
            thumbnail: allMovies[1]?.backdrop || allMovies[1]?.poster || null,
            date: '1 day ago',
            author: 'Movieo Editorial',
            content: `Looking for the perfect movies to watch this weekend? We've curated a list of the top 5 must-see films that are currently trending and receiving rave reviews.

Our weekend picks include everything from action-packed blockbusters to thought-provoking dramas. Each film on this list has been carefully selected based on critical acclaim, audience ratings, and overall entertainment value.

Whether you're in the mood for an edge-of-your-seat thriller or a heartwarming family film, this list has something for everyone. Grab your popcorn and get ready for an amazing weekend of cinematic entertainment!`,
            relatedMedia: allMovies[1] || null
          },
          4: {
            id: 4,
            title: 'Behind the Scenes: Making of the Latest Blockbuster',
            thumbnail: allMovies[2]?.backdrop || allMovies[2]?.poster || null,
            date: '1 day ago',
            author: 'Movieo Editorial',
            content: `Ever wondered what goes into making a blockbuster film? We take you behind the scenes of the latest cinematic masterpiece, revealing the incredible effort and creativity that brings these stories to life.

From pre-production planning to post-production magic, this exclusive look reveals:
- Stunning visual effects work
- Intricate set designs
- Challenging stunt sequences
- The collaborative effort of hundreds of talented professionals

Discover the passion and dedication that goes into every frame of this incredible production.`,
            relatedMedia: allMovies[2] || null
          },
          5: {
            id: 5,
            title: 'TV Series Finale Review: What We Thought',
            thumbnail: allTV[0]?.backdrop || allTV[0]?.poster || null,
            date: '2 days ago',
            author: 'Movieo Editorial',
            content: `The highly anticipated finale of one of this year's most talked-about TV series has finally aired, and we're here to break down everything that happened.

This comprehensive review covers:
- Plot resolution and character arcs
- Outstanding performances
- Production quality
- Overall series impact

Spoiler alert: This review contains detailed discussion of the finale's events. If you haven't watched yet, you might want to catch up first!`,
            relatedMedia: allTV[0] || null
          },
          6: {
            id: 6,
            title: 'Manga Adaptation Announced for Popular Anime',
            thumbnail: allAnime[1]?.backdrop || allAnime[1]?.poster || null,
            date: '2 days ago',
            author: 'Movieo Editorial',
            content: `Fans of the popular anime series have reason to celebrate! A manga adaptation has been officially announced, bringing the beloved animated story to the printed page.

The manga will feature:
- Original artwork by the anime's character designer
- Expanded storylines and character development
- Exclusive bonus content
- Collector's edition releases

This announcement has generated significant excitement among the fanbase, with many eager to experience their favorite series in a new format.`,
            relatedMedia: allAnime[1] || null
          }
        }

        const item = newsMap[parseInt(id)]
        if (item) {
          setNewsItem(item)
          if (item.relatedMedia) {
            setRelatedMedia(item.relatedMedia)
          }
        } else {
          navigate('/')
        }
      } catch (error) {
        console.error('Error fetching news details:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchNewsDetails()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!newsItem) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Image */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        {newsItem.thumbnail ? (
          <img
            src={newsItem.thumbnail}
            alt={newsItem.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <div className="text-4xl sm:text-6xl opacity-50">📰</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-zinc-400">
            {newsItem.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="px-3 py-1 bg-primary/20 text-primary font-bold">
                  {newsItem.category}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{newsItem.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{newsItem.author}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight">
            {newsItem.title}
          </h1>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-8 sm:mb-12">
            <div className="text-sm sm:text-base md:text-lg leading-relaxed text-zinc-300 whitespace-pre-line">
              {newsItem.content}
            </div>
          </div>

          {/* Related Media */}
          {relatedMedia && (
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-zinc-900 border border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Related Content</h2>
              <Link
                to={`/${relatedMedia.type || 'movie'}/${relatedMedia.id}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group"
              >
                {relatedMedia.poster && (
                  <img
                    src={relatedMedia.poster}
                    alt={relatedMedia.title}
                    className="w-20 h-28 sm:w-24 sm:h-32 object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                    {relatedMedia.title}
                  </h3>
                  {relatedMedia.overview && (
                    <p className="text-sm sm:text-base text-zinc-400 line-clamp-2">{relatedMedia.overview}</p>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsDetails

