const si = require('../../../src/si');

// We need to bind si to its own cli because it uses 'this.cli'
const siApi = {
  ...si,
  cli: si.cli || require('../../../src/si/helpers/config').cli
};

async function searchTorrents(title, episode) {
  const query = `${title} ${episode}`.trim();
  try {
    // Search for the specific episode, prefer 1080p or 720p
    const results = await siApi.search(query, 10, { category: '1_0' });
    return results;
  } catch (error) {
    console.error('Error searching Nyaa:', error.message);
    return [];
  }
}

module.exports = {
  searchTorrents
};
