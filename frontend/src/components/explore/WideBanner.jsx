import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getMediaImage } from '../../utils/mediaHelpers'

const WideBanner = ({ media, alignRight = false, centered = false }) => {
    const image = getMediaImage(media, 'backdrop') || getMediaImage(media, 'poster')
    if (!image) return null

    return (
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] lg:aspect-[3/1] rounded-2xl overflow-hidden group">
            <img
                src={image}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={media.title || media.name}
                loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-center p-8 sm:p-12 ${alignRight ? 'items-end text-right' : centered ? 'items-center text-center' : 'items-start text-left'
                }`}>
                {/* Logo or Title */}
                <h3 className={`font-black text-white mb-4 uppercase tracking-tighter text-balance shadow-black drop-shadow-lg ${centered ? 'text-4xl sm:text-6xl md:text-7xl' : 'text-3xl sm:text-5xl'
                    }`}>
                    {media.title || media.name}
                </h3>

                <p className={`text-zinc-300 line-clamp-2 max-w-xl mb-6 text-sm sm:text-lg drop-shadow-md hidden sm:block ${centered ? 'text-center' : ''
                    }`}>
                    {media.overview}
                </p>

                <Link to={`/${media.mediaType || media.type || 'movie'}/${media.id}`}>
                    <button className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase rounded hover:bg-zinc-200 transition-all transform hover:scale-105 tracking-widest text-sm">
                        <Play className="h-4 w-4 fill-black" />
                        Play
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default WideBanner
