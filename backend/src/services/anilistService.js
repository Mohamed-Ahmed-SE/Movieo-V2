import axios from 'axios'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour cache

const ANILIST_API_URL = 'https://graphql.anilist.co'

const searchQuery = `
  query ($search: String, $type: MediaType, $countryOfOrigin: CountryCode) {
    Page(page: 1, perPage: 20) {
      media(search: $search, type: $type, sort: POPULARITY_DESC, countryOfOrigin: $countryOfOrigin) {
        id
        title {
          romaji
          english
          native
        }
        type
        format
        status
        description
        startDate {
          year
          month
          day
        }
        coverImage {
          large
          extraLarge
        }
        bannerImage
        meanScore
        episodes
        chapters
        genres
        isAdult
      }
    }
  }
`

const trendingQuery = `
  query ($type: MediaType, $countryOfOrigin: CountryCode) {
    Page(perPage: 20) {
      media(type: $type, sort: TRENDING_DESC, countryOfOrigin: $countryOfOrigin) {
        id
        title {
          romaji
          english
          native
        }
        type
        description
        episodes
        chapters
        volumes
        coverImage {
          large
          extraLarge
        }
        bannerImage
        meanScore
        genres
        isAdult
      }
    }
  }
`

const detailsQuery = `
  query ($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      title {
        romaji
        english
        native
      }
      type
      format
      status
      description
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      coverImage {
        large
        extraLarge
      }
      bannerImage
      meanScore
      popularity
      favourites
      episodes
      chapters
      volumes
      nextAiringEpisode {
        episode
        timeUntilAiring
      }
      genres
      tags {
        name
      }
      characters(sort: ROLE, perPage: 12) {
        edges {
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
          role
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            type
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`

export const anilistService = {
  search: async (query, type = 'ANIME', countryOfOrigin = undefined) => {
    const cacheKey = `anilist_search_${type}_${countryOfOrigin || 'ALL'}_${query}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.post(ANILIST_API_URL, {
        query: searchQuery,
        variables: {
          search: query,
          type: type.toUpperCase(),
          countryOfOrigin,
        },
      })

      if (response.data.errors) {
        console.error('AniList search internal errors:', response.data.errors)
        throw new Error(response.data.errors[0].message || 'AniList API error')
      }

      if (!response.data.data || !response.data.data.Page) {
        throw new Error('Invalid response from AniList API')
      }

      const results = response.data.data.Page.media
        .filter((item) => {
          // Filter out 18+ content
          if (item.isAdult) return false

          // Filter out Ecchi genre
          const genres = item.genres || []
          if (genres.some(g => g.toLowerCase() === 'ecchi')) return false

          // Filter out items without posters
          if (!item.coverImage?.large && !item.coverImage?.extraLarge) return false

          return true
        })
        .map((item) => ({
          id: item.id.toString(),
          type: type.toLowerCase(),
          title: item.title.english || item.title.romaji || item.title.native,
          overview: item.description?.replace(/<[^>]*>/g, '') || '',
          poster: item.coverImage?.large || item.coverImage?.extraLarge || null,
          backdrop: item.bannerImage || null,
          releaseDate: item.startDate?.year
            ? `${item.startDate.year}-${String(item.startDate.month || 1).padStart(2, '0')}-${String(item.startDate.day || 1).padStart(2, '0')}`
            : null,
          rating: item.meanScore ? item.meanScore / 10 : null,
          vote_average: item.meanScore ? item.meanScore / 10 : null,
          totalEpisodes: item.episodes,
          episodes: item.episodes,
          number_of_episodes: item.episodes,
          totalChapters: item.chapters,
          chapters: item.chapters,
          totalVolumes: item.volumes,
          volumes: item.volumes,
          genres: item.genres || [],
        }))

      cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error('AniList search error:', error)
      return []
    }
  },

  getDetails: async (id, type = 'ANIME') => {
    const cacheKey = `anilist_details_${type}_${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.post(ANILIST_API_URL, {
        query: detailsQuery,
        variables: {
          id: parseInt(id),
          type: type.toUpperCase(),
        },
      })

      const data = response.data.data.Media
      if (!data) {
        throw new Error('Media not found')
      }


      const result = {
        id: data.id.toString(),
        type: type.toLowerCase(),
        title: data.title.english || data.title.romaji || data.title.native,
        name: data.title.english || data.title.romaji || data.title.native,
        overview: data.description?.replace(/<[^>]*>/g, '') || '',
        description: data.description?.replace(/<[^>]*>/g, '') || '',
        poster: data.coverImage?.large || data.coverImage?.extraLarge || null,
        backdrop: data.bannerImage || null,
        releaseDate: data.startDate?.year
          ? `${data.startDate.year}-${String(data.startDate.month || 1).padStart(2, '0')}-${String(data.startDate.day || 1).padStart(2, '0')}`
          : null,
        release_date: data.startDate?.year
          ? `${data.startDate.year}-${String(data.startDate.month || 1).padStart(2, '0')}-${String(data.startDate.day || 1).padStart(2, '0')}`
          : null,
        rating: data.meanScore ? data.meanScore / 10 : null,
        vote_average: data.meanScore ? data.meanScore / 10 : null,
        popularity: data.popularity,
        favourites: data.favourites,
        status: data.status || null,
        original_language: 'Japanese', // AniList is primarily Japanese content
        runtime: null, // AniList doesn't have runtime, use episode count instead
        totalEpisodes: data.episodes,
        episodes: data.episodes,
        number_of_episodes: data.episodes,
        totalChapters: data.chapters ?? null,
        chapters: data.chapters ?? null,
        totalVolumes: data.volumes,
        volumes: data.volumes,
        genres: data.genres || [],
        tags: data.tags?.map((tag) => tag.name) || [],
        characters: data.characters?.edges?.map((edge) => ({
          id: edge.node.id,
          name: edge.node.name.full,
          image: edge.node.image?.large || null,
          role: edge.role,
        })) || [],
        relations: data.relations?.edges?.map((edge) => ({
          id: edge.node.id.toString(),
          type: edge.node.type.toLowerCase(),
          title: edge.node.title.english || edge.node.title.romaji,
          poster: edge.node.coverImage?.large || null,
          relationType: edge.relationType,
        })) || [],
        images: data.bannerImage ? [data.bannerImage] : [],
        posters: data.coverImage ? [data.coverImage.large || data.coverImage.extraLarge] : [],
      }

      cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('AniList getDetails error:', error)
      throw error
    }
  },

  getTrending: async (type = 'ANIME', countryOfOrigin = undefined) => {
    const cacheKey = `anilist_trending_${type}_${countryOfOrigin || 'ALL'}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.post(ANILIST_API_URL, {
        query: trendingQuery,
        variables: {
          type: type.toUpperCase(),
          countryOfOrigin,
        },
      })

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message || 'AniList API error')
      }

      if (!response.data.data || !response.data.data.Page) {
        throw new Error('Invalid response from AniList API')
      }

      const results = response.data.data.Page.media
        .filter((item) => {
          // Filter out 18+ content
          if (item.isAdult) return false

          // Filter out Ecchi genre
          const genres = item.genres || []
          if (genres.some(g => g.toLowerCase() === 'ecchi')) return false

          // Filter out items without posters
          if (!item.coverImage?.large && !item.coverImage?.extraLarge) return false

          return true
        })
        .map((item) => ({
          id: item.id.toString(),
          type: type.toLowerCase(),
          title: item.title.english || item.title.romaji || item.title.native,
          overview: item.description?.replace(/<[^>]*>/g, '') || '',
          description: item.description?.replace(/<[^>]*>/g, '') || '',
          poster: item.coverImage?.large || item.coverImage?.extraLarge || null,
          backdrop: item.bannerImage || null,
          rating: item.meanScore ? item.meanScore / 10 : null,
          totalEpisodes: item.episodes,
          totalChapters: item.chapters,
          totalVolumes: item.volumes,
          episodes: item.episodes,
          chapters: item.chapters,
          volumes: item.volumes,
          genres: item.genres || [], // Include genres from AniList
          startDate: item.startDate || null,
        }))

      cache.set(cacheKey, results, 1800)
      return results
    } catch (error) {
      console.error('AniList getTrending error:', error)
      throw error
    }
  },
}
