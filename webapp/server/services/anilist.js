const axios = require('axios');
const { redisClient } = require('../config/db');

const ANILIST_URL = 'https://graphql.anilist.co';
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

const searchQuery = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, isAdult: false, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      averageScore
      description
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

  const cacheKey = `search:${cleanSearch}:${p}:${pp}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Anilist] Cache hit for search: ${cleanSearch} (${parsed.length} results)`);
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Anilist] Redis error:', err);
  }

  console.log(`[Anilist] Fetching search from API: "${cleanSearch}" (page: ${p}, perPage: ${pp})`);
  try {
    const response = await axios.post(ANILIST_URL, {
      query: searchQuery,
      variables: { search: cleanSearch, page: p, perPage: pp }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (response.data.errors) {
      console.error('[Anilist] API errors:', JSON.stringify(response.data.errors));
      return [];
    }

    const data = response.data.data?.Page?.media || [];
    console.log(`[Anilist] API returned ${data.length} results for: ${cleanSearch}`);
    
    if (data.length > 0) {
      try {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
      } catch (err) {
        console.error('[Anilist] Redis cache set error:', err);
      }
    } else {
      console.log('[Anilist] Empty response data:', JSON.stringify(response.data));
    }

    return data;
  } catch (err) {
    console.error('[Anilist] API request failed:', err.message);
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
    });
    const data = response.data.data.Media;

    try {
      await redisClient.setEx(cacheKey, CACHE_TTL * 24, JSON.stringify(data));
    } catch (err) {
      console.error('[Anilist] Redis error:', err);
    }

    return data;
  } catch (err) {
    console.error('[Anilist] Fetch Details failed:', err.message);
    return null;
  }
}

module.exports = {
  fetchTrending,
  searchAnime,
  fetchDetails
};
