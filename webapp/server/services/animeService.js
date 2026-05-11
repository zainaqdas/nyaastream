const axios = require('axios');
const { redisClient } = require('../config/db');

const JIKAN_URL = 'https://api.jikan.moe/v4';
const CACHE_TTL = 3600; // 1 hour

/**
 * Maps Jikan anime object to our internal Anime format
 */
function mapJikanToAnime(item) {
  return {
    id: item.mal_id,
    title: {
      romaji: item.title,
      english: item.title_english || item.title,
      native: item.title_japanese
    },
    coverImage: {
      large: item.images.jpg.large_image_url || item.images.jpg.image_url,
      extraLarge: item.images.jpg.large_image_url || item.images.jpg.image_url
    },
    bannerImage: item.images.jpg.large_image_url || item.images.jpg.image_url, // Jikan doesn't provide banners
    description: item.synopsis,
    averageScore: Math.round(item.score * 10) || 0,
    genres: item.genres?.map(g => g.name) || [],
    episodes: item.episodes,
    season: item.season,
    seasonYear: item.year,
    status: item.status,
    studios: {
      nodes: item.studios?.map(s => ({ name: s.name })) || []
    }
  };
}

async function fetchTrending(page = 1, perPage = 20) {
  const p = parseInt(page) || 1;
  const pp = parseInt(perPage) || 20;
  const cacheKey = `trending:jikan:${p}:${pp}`;
  
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('[Jikan] Redis error:', err);
  }

  try {
    const response = await axios.get(`${JIKAN_URL}/top/anime`, {
      params: { page: p, limit: pp, filter: 'bypopularity' }
    });
    
    const data = response.data.data.map(mapJikanToAnime);

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch (err) {
      console.error('[Jikan] Redis error:', err);
    }

    return data;
  } catch (err) {
    console.error('[Jikan] Fetch Trending failed:', err.message);
    return [];
  }
}

async function searchAnime(search, page = 1, perPage = 20) {
  const cleanSearch = (search || '').trim();
  const p = parseInt(page) || 1;
  const pp = parseInt(perPage) || 20;
  
  if (!cleanSearch) return [];

  const cacheKey = `search:jikan:${cleanSearch}:${p}:${pp}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('[Jikan] Redis error:', err);
  }

  try {
    const response = await axios.get(`${JIKAN_URL}/anime`, {
      params: {
        q: cleanSearch,
        page: p,
        limit: pp,
        sfw: true
      }
    });

    const data = response.data.data.map(mapJikanToAnime);

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch (err) {
      console.error('[Jikan] Redis cache error:', err);
    }

    return data;
  } catch (err) {
    console.error('[Jikan] Search API failed:', err.message);
    return [];
  }
}

async function fetchDetails(id) {
  const cacheKey = `details:jikan:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('[Jikan] Redis error:', err);
  }

  try {
    const response = await axios.get(`${JIKAN_URL}/anime/${id}/full`);
    const data = mapJikanToAnime(response.data.data);

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL * 24, JSON.stringify(data));
    } catch (err) {
      console.error('[Jikan] Redis error:', err);
    }

    return data;
  } catch (err) {
    console.error('[Jikan] Fetch Details failed:', err.message);
    return null;
  }
}

module.exports = {
  fetchTrending,
  searchAnime,
  fetchDetails
};
