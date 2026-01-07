import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { getMediaImage } from '../../utils/mediaHelpers'

const BannerContent = ({ media, isVertical = false }) => {
    if (!media) return null

    const image = isVertical
        ? (getMediaImage(media, 'poster') || getMediaImage(media, 'backdrop'))
        : (getMediaImage(media, 'backdrop') || getMediaImage(media, 'poster'))

    return (
        <Link to={`/${media.mediaType || media.type || 'movie'}/${media.id}`} className="block w-full h-full relative group">
            <img
                src={image}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={media.title || media.name}
                loading="lazy"
            />

            {/* Gradient Overlay - Stronger at bottom for text readability */}
            <div className={`absolute inset-0 bg-gradient-to-t ${isVertical ? 'from-black via-black/40' : 'from-black via-black/50'} to-transparent`} />

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
                <h3 className={`${isVertical ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-6xl md:text-7xl'} font-black text-white mb-3 uppercase tracking-tighter text-balance shadow-black drop-shadow-2xl leading-[0.9] transition-transform duration-300 group-hover:-translate-y-2`}>
                    {media.title || media.name}
                </h3>

                <div className="flex items-center gap-4 text-sm font-bold text-white/90 uppercase tracking-widest">
                    {media.vote_average > 0 && (
                        <span className="text-green-400 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-green-400" />
                            {(media.vote_average * 10).toFixed(0)}% Match
                        </span>
                    )}
                    <span>•</span>
                    <span>{new Date(media.release_date || media.first_air_date).getFullYear() || 'N/A'}</span>
                </div>
            </div>
        </Link>
    )
}

const BentoGrid = ({ items }) => {
    // Ensure we have exactly 3 items or handle gracefully
    if (!items || items.length < 3) return null

    // Clean nulls if any (though logic should prevent)
    const validItems = items.filter(Boolean)
    if (validItems.length < 3) return null

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Left Column (Stack of 2 Wide Cards) */}
            <div className="lg:col-span-2 row-span-2 flex flex-col gap-6 h-full">
                {/* Top Wide */}
                <div className="flex-1 relative group overflow-hidden bg-zinc-900 rounded-xl min-h-[250px]">
                    <BannerContent media={validItems[0]} />
                </div>
                {/* Bottom Wide */}
                <div className="flex-1 relative group overflow-hidden bg-zinc-900 rounded-xl min-h-[250px]">
                    <BannerContent media={validItems[1]} />
                </div>
            </div>

            {/* Right Column (Single Tall Card) */}
            <div className="lg:col-span-1 row-span-2 relative group overflow-hidden bg-zinc-900 rounded-xl h-full min-h-[580px]">
                <BannerContent media={validItems[2]} isVertical />
            </div>
        </div>
    )
}

export default BentoGrid
