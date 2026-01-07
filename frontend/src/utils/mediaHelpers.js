/**
 * Normalize media data from API responses
 * @param {Object|Array} data - Raw API data
 * @returns {Array} Normalized media array
 */
export const normalizeMediaData = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeMediaItem)
  }
  if (data?.results) {
    return data.results.map(normalizeMediaItem)
  }
  return []
}

/**
 * Helper to determine real media type
 */
export const getRealMediaType = (item) => {
  let type = item.media_type || item.mediaType || item.type || 'movie'

  // Normalize basic types
  if (type === 'series') type = 'tv'

  // IMPORTANT: Movies always stay as movies, regardless of language
  // Only TV series can be converted to anime
  if (type === 'movie') {
    return 'movie'
  }

  // Get language information - check multiple sources
  const lang = item.original_language || item.originalLanguage
  const spokenLanguages = item.spoken_languages || item.spokenLanguages || []
  const isJapanese = lang === 'ja' || 
    (Array.isArray(spokenLanguages) && spokenLanguages.some(l => 
      (typeof l === 'string' ? l === 'ja' : (l.iso_639_1 === 'ja' || l.code === 'ja'))
    ))

  // Anime Detection: ONLY TV Series + Japanese Language (NOT movies)
  // Movies with Japanese language remain as movies (already handled above)
  if (type === 'tv' && isJapanese) {
    type = 'anime'
  }

  // Manhwa Detection: Manga + (Korean Language OR Origin Country KR)
  const origin = item.origin_country || item.countryOfOrigin || []
  const isKorean = lang === 'ko' || 
    (Array.isArray(spokenLanguages) && spokenLanguages.some(l => 
      (typeof l === 'string' ? l === 'ko' : (l.iso_639_1 === 'ko' || l.code === 'ko'))
    )) ||
    (Array.isArray(origin) ? origin.includes('KR') : origin === 'KR')
  
  // Only convert manga to manhwa if it's Korean, not if it's already manhwa
  if (type === 'manga' && isKorean) {
    type = 'manhwa'
  }

  return type
}

/**
 * Normalize a single media item
 * @param {Object} item - Media item
 * @returns {Object} Normalized media item
 */
export const normalizeMediaItem = (item) => {
  const type = getRealMediaType(item)

  // Get description from multiple sources (important for anime from AniList)
  // Try multiple sources - AniList uses 'description' field with HTML
  let description = item.overview || 
    item.description || 
    item.entry?.description ||
    item.entry?.descriptionHtml ||
    null
  
  // Strip HTML tags if description exists and is a string
  if (description && typeof description === 'string') {
    // Remove HTML tags and clean up
    description = description.replace(/<[^>]+>/g, '').replace(/\n\s*\n/g, '\n').trim()
  }
  
  // Fallback if no description found
  if (!description || description === '') {
    description = 'No description available.'
  }

  return {
    ...item,
    id: item.id?.toString() || item.mediaId,
    mediaId: item.mediaId || item.id,
    type,
    mediaType: type,
    title: item.title || item.name || item.entry?.title?.userPreferred || item.entry?.title?.romaji || item.entry?.title || 'Untitled',
    name: item.name || item.title || item.entry?.title?.userPreferred || item.entry?.title?.romaji || item.entry?.title || 'Untitled',
    overview: description,
    description: description,
    poster: (item.poster && item.poster.startsWith('http')) ? item.poster : (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : (item.coverImage?.large || item.coverImage?.medium || item.coverImage)),
    poster_path: item.poster_path || item.poster,
    backdrop: (item.backdrop && item.backdrop.startsWith('http')) ? item.backdrop : (item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : item.bannerImage || item.coverImage?.extraLarge),
    backdrop_path: item.backdrop_path || item.backdrop,
    releaseDate: item.releaseDate || item.release_date || item.first_air_date || item.startDate?.year, // AniList fallback
    rating: item.rating || item.vote_average || (item.averageScore ? item.averageScore / 10 : 0),
    // Preserve language info for type detection
    original_language: item.original_language || item.originalLanguage,
    spoken_languages: item.spoken_languages || item.spokenLanguages,
    origin_country: item.origin_country || item.countryOfOrigin,
    // Preserve episode/chapter info for anime/manga/manhwa
    episodes: item.episodes,
    totalEpisodes: item.totalEpisodes || item.episodes || item.number_of_episodes,
    number_of_episodes: item.number_of_episodes || item.episodes || item.totalEpisodes,
    chapters: item.chapters,
    totalChapters: item.totalChapters || item.chapters,
    volumes: item.volumes,
    totalVolumes: item.totalVolumes || item.volumes,
    // Preserve characters for anime/manga/manhwa
    characters: item.characters || [],
  }
}

/**
 * Get media image with fallbacks
 * @param {Object} media - Media object
 * @param {string} type - Image type ('poster' or 'backdrop')
 * @returns {string|null} Image URL
 */
export const getMediaImage = (media, type = 'poster') => {
  if (!media) return null

  if (type === 'poster') {
    return media.poster ||
      (media.poster_path ? (media.poster_path.startsWith('http') ? media.poster_path : `https://image.tmdb.org/t/p/w500${media.poster_path}`) : null) ||
      media.coverImage?.large ||
      media.coverImage ||
      media.posterUrl || // Fallback
      null
  } else {
    return media.backdrop ||
      (media.backdrop_path ? (media.backdrop_path.startsWith('http') ? media.backdrop_path : `https://image.tmdb.org/t/p/original${media.backdrop_path}`) : null) ||
      media.bannerImage ||
      media.banner || // Fallback
      null
  }
}

/**
 * Build media detail URL
 * @param {string} type - Media type
 * @param {string} id - Media ID
 * @returns {string} Media detail URL
 */
export const getMediaUrl = (type, id) => {
  return `/${type}/${id}`
}

/**
 * Format media type label
 * @param {string} type - Media type
 * @returns {string} Formatted type label
 */
export const formatMediaType = (type) => {
  const typeMap = {
    movie: 'Movie',
    tv: 'TV',
    anime: 'Anime',
    manga: 'Manga',
    manhwa: 'Manhwa',
    series: 'TV',
  }
  return typeMap[type?.toLowerCase()] || type
}

/**
 * Type checkers
 */
export const isMovie = (media) => getRealMediaType(media) === 'movie'
export const isTV = (media) => getRealMediaType(media) === 'tv'
export const isAnime = (media) => getRealMediaType(media) === 'anime'
export const isManga = (media) => getRealMediaType(media) === 'manga'
export const isManhwa = (media) => getRealMediaType(media) === 'manhwa'

