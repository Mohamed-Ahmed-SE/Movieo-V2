import { useState, useEffect } from 'react'
import GenreTabs from './GenreTabs'
import HorizontalCarousel from '../common/HorizontalCarousel'
import { mediaService } from '../../services/mediaService'

const GenreSection = ({ config, activeType }) => {
    const [activeGenre, setActiveGenre] = useState(config.tabGenres[0])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchGenreItems = async () => {
            setLoading(true)
            try {
                // Use with_genres filter to search by actual genre, not title
                const res = await mediaService.search(activeGenre, { type: activeType, with_genres: true })
                setItems(res?.results || res || [])
            } catch (err) {
                console.error(err)
                setItems([])
            } finally {
                setLoading(false)
            }
        }
        fetchGenreItems()
    }, [activeGenre, activeType])

    return (
        <div className="space-y-6">
            <GenreTabs
                genres={config.tabGenres}
                activeGenre={activeGenre}
                onGenreClick={setActiveGenre}
            />

            <div className={`transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <HorizontalCarousel
                    media={items}
                    showArrows={true}
                />
            </div>
        </div>
    )
}

export default GenreSection
