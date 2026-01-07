import { Link } from 'react-router-dom'
import { memo } from 'react'

const GENRES = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Sci-Fi',
    'Thriller',
    'Romance',
    'Mystery',
    'Animation',
    'Documentary'
]

const GenreTabs = ({ genres = GENRES, activeGenre, onGenreClick }) => {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Browse Genres</h2>
                <Link to="/search" className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">
                    View All
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {genres.map(g => (
                    <button
                        key={g}
                        onClick={() => onGenreClick && onGenreClick(g)}
                        className={`
              px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-300
              ${activeGenre === g
                                ? 'bg-white text-black border-white'
                                : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/30'
                            }
            `}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default memo(GenreTabs)
