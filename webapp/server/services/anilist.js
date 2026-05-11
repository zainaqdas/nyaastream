const axios = require('axios');
const { redisClient } = require('../config/db');

const ANILIST_URL = 'https://graphql.anilist.co';
const JIKAN_URL = 'https://api.jikan.moe/v4';
const CACHE_TTL = 3600; // 1 hour

const trendingQuery = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        extraLarge
      }
      bannerImage
      description
      averageScore
      genres
      episodes
      season
      seasonYear
    }
  }
}
`;

const detailsQuery = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
    }
    bannerImage
    description
    averageScore
    genres
    episodes
    status
    startDate {
      year
      month
      day
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
  }
}
`;

async function fetchTrending(page = 1, perPage = 20) {
  const p = parseInt(page) || 1;
  const pp = parseInt(perPage) || 20;
  const cacheKey = `trending:${p}:${pp}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('[Anilist] Redis error:', err);
  }

  try {
    const response = await axios.post(ANILIST_URL, {
      query: trendingQuery,
      variables: { page: p, perPage: pp }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NyaaStream/1.0.0'
      }
    });
    const data = response.data.data.Page.media;

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch (err) {
      console.error('[Anilist] Redis error:', err);
    }

    return data;
  } catch (err) {
    console.error('[Anilist] Fetch Trending failed:', err.message);
    return [];
  }
}

async function searchAnime(search, page = 1, perPage = 20) {
  const cleanSearch = (search || '').trim();
  const p = parseInt(page) || 1;
  const pp = parseInt(perPage) || 20;
  
  if (!cleanSearch) return [];

  const cacheKey = `search:v2:${cleanSearch}:${p}:${pp}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Search] Cache hit for: ${cleanSearch}`);
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Search] Redis error:', err);
  }

  console.log(`[Search] Falling back to Jikan API for: "${cleanSearch}"`);
  try {
    // Jikan API search
    const response = await axios.get(`${JIKAN_URL}/anime`, {
      params: {
        q: cleanSearch,
        page: p,
        limit: pp,
        type: 'tv',
        sfw: true
      }
    });

    const data = response.data.data.map(item => ({
      id: item.mal_id, // We'll use MAL ID as a fallback, but note that it's NOT the same as AniList ID
      title: {
        romaji: item.title,
        english: item.title_english,
        native: item.title_japanese
      },
      coverImage: {
        large: item.images.jpg.large_image_url || item.images.jpg.image_url
      },
      averageScore: item.score * 10,
      description: item.synopsis
    }));

    console.log(`[Search] Jikan returned ${data.length} results`);
    
    if (data.length > 0) {
      try {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
      } catch (err) {
        console.error('[Search] Redis cache error:', err);
      }
    }

    return data;
  } catch (err) {
    console.error('[Search] Jikan API failed:', err.message);
    return [];
  }
}

async function fetchDetails(id) {
  const cacheKey = `details:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('[Anilist] Redis error:', err);
  }

  try {
    const response = await axios.post(ANILIST_URL, {
      query: detailsQuery,
      variables: { id }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NyaaStream/1.0.0'
      }
    });
    const data = response.data.data.Media;

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL * 24, JSON.stringify(data));
    } catch (err) {
      console.error('[Anilist] Redis error:', err);
    }

    return data;
  } catch (err) {
    // If AniList ID fails (could be a MAL ID from Jikan), try fetching by ID or something else?
    // For now, just return null and let the frontend handle it
    console.error('[Anilist] Fetch Details failed:', err.message);
    return null;
  }
}

module.exports = {
  fetchTrending,
  searchAnime,
  fetchDetails
};
