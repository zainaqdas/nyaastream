const si = require('../../../src/si');
const { parseTitle } = require('../utils/torrentParser');
const Episode = require('../models/Episode');

async function searchTorrents(title, episode) {
  const query = `${title} ${episode}`.trim();
  try {
    const results = await si.search(query, 10, { category: '1_0' });
    return results;
  } catch (error) {
    console.error('Error searching Nyaa:', error.message);
    return [];
  }
}

/**
 * Ensures an episode is indexed in our database.
 * If not found or outdated, performs a live scrape and saves to MongoDB.
 */
async function ensureEpisodeIndexed(anilistId, animeTitle, episodeNumber) {
  // 1. Check DB first
  let episode = await Episode.findOne({ anilistId, episodeNumber });
  
  // 2. If found and recent (e.g. less than 12h old), return it
  const cacheLimit = 12 * 60 * 60 * 1000;
  if (episode && (Date.now() - new Date(episode.lastUpdated).getTime() < cacheLimit) && episode.torrents.length > 0) {
    return episode;
  }

  // 3. Otherwise, live scrape from Nyaa
  const paddedEpisode = episodeNumber < 10 ? `0${episodeNumber}` : episodeNumber;
  console.log(`On-demand scrape for: ${animeTitle} Ep ${episodeNumber} (Query: ${paddedEpisode})`);
  
  // Use padded episode for precision, but avoid quotes for title to be less restrictive
  const query = `${animeTitle} ${paddedEpisode}`.trim();
  
  try {
    // Increase limit to 30 to have more chances of finding the right torrent
    const results = await si.search(query, 30, { category: '1_0' });
    
    if (!episode) {
      episode = new Episode({ anilistId, episodeNumber, torrents: [] });
    } else {
      episode.torrents = []; // Refresh torrents
    }

    for (const torrent of results) {
      const parsed = parseTitle(torrent.name);
      
      // Basic check: if we searched for episode 5, ensure the title doesn't clearly state another episode
      // (Nyaa search can be fuzzy)
      if (parsed.episodeNumber !== null && parsed.episodeNumber !== episodeNumber) continue;

      episode.torrents.push({
        title: torrent.name,
        releaseGroup: parsed.releaseGroup,
        quality: parsed.quality,
        codec: parsed.codec,
        seeders: parseInt(torrent.seeders) || 0,
        leechers: parseInt(torrent.leechers) || 0,
        completed: parseInt(torrent.completed) || 0,
        magnet: torrent.magnet,
        hash: torrent.hash,
        nyaaUrl: torrent.url,
        uploadedAt: new Date(torrent.date),
        size: torrent.filesize
      });
    }

    // Sort torrents by seeders (best first)
    episode.torrents.sort((a, b) => b.seeders - a.seeders);
    
    episode.lastUpdated = new Date();
    await episode.save();
    return episode;

  } catch (error) {
    console.error('On-demand scrape error:', error.message);
    return episode || null;
  }
}

module.exports = {
  searchTorrents,
  ensureEpisodeIndexed
};
