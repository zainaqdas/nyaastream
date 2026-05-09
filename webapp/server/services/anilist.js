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
    media(search: $search, type: ANIME) {
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
  const cacheKey = `trending:${page}:${perPage}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('Redis error:', err);
  }

  const response = await axios.post(ANILIST_URL, {
    query: trendingQuery,
    variables: { page, perPage }
  });
  const data = response.data.data.Page.media;

  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
  } catch (err) {
    console.error('Redis error:', err);
  }

  return data;
}

async function searchAnime(search, page = 1, perPage = 20) {
  const cacheKey = `search:${search}:${page}:${perPage}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('Redis error:', err);
  }

  const response = await axios.post(ANILIST_URL, {
    query: searchQuery,
    variables: { search, page, perPage }
  });
  const data = response.data.data.Page.media;

  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
  } catch (err) {
    console.error('Redis error:', err);
  }

  return data;
}

async function fetchDetails(id) {
  const cacheKey = `details:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error('Redis error:', err);
  }

  const response = await axios.post(ANILIST_URL, {
    query: detailsQuery,
    variables: { id }
  });
  const data = response.data.data.Media;

  try {
    await redisClient.setEx(cacheKey, CACHE_TTL * 24, JSON.stringify(data)); // Cache details for 24h
  } catch (err) {
    console.error('Redis error:', err);
  }

  return data;
}

module.exports = {
  fetchTrending,
  searchAnime,
  fetchDetails
};
