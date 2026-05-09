const axios = require('axios');

const JIKAN_URL = 'https://api.jikan.moe/v4';

async function fetchEpisodes(malId) {
  try {
    const response = await axios.get(`${JIKAN_URL}/anime/${malId}/episodes`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching episodes from Jikan:', error.message);
    return [];
  }
}

module.exports = {
  fetchEpisodes
};
