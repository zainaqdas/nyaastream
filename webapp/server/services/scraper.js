const cron = require('node-cron');
const si = require('../../../src/si');
const { parseTitle } = require('../utils/torrentParser');
const anilist = require('./anilist');
const Anime = require('../models/Anime');
const Episode = require('../models/Episode');

const startScraper = () => {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled Nyaa scraper...');
    await scrapeLatest();
  });
};

const scrapeLatest = async () => {
  try {
    // Search for latest English-translated anime (Category 1_2)
    const results = await si.search('', 50, { category: '1_2' });
    
    for (const torrent of results) {
      const parsed = parseTitle(torrent.name);
      if (!parsed.title || parsed.episodeNumber === null) continue;

      // Try to find matching anime in AniList
      const searchResults = await anilist.searchAnime(parsed.title, 1, 1);
      if (searchResults.length === 0) continue;

      const media = searchResults[0];
      
      // Update or create Anime record
      let anime = await Anime.findOne({ anilistId: media.id });
      if (!anime) {
        const details = await anilist.fetchDetails(media.id);
        anime = new Anime({
          anilistId: media.id,
          nyaaTitle: parsed.title,
          metadata: {
            titles: details.title,
            description: details.description,
            coverImage: details.coverImage.extraLarge,
            bannerImage: details.bannerImage,
            genres: details.genres,
            studios: details.studios.nodes,
            status: details.status,
            averageScore: details.averageScore,
            episodes: details.episodes
          },
          totalEpisodes: details.episodes
        });
        await anime.save();
      }

      // Update or create Episode record
      let episode = await Episode.findOne({ anilistId: media.id, episodeNumber: parsed.episodeNumber });
      if (!episode) {
        episode = new Episode({
          anilistId: media.id,
          episodeNumber: parsed.episodeNumber,
          torrents: []
        });
      }

      // Check if this specific torrent already exists (by hash)
      const exists = episode.torrents.some(t => t.hash === torrent.hash);
      if (!exists) {
        episode.torrents.push({
          title: torrent.name,
          releaseGroup: parsed.releaseGroup,
          quality: parsed.quality,
          codec: parsed.codec,
          seeders: parseInt(torrent.seeders),
          leechers: parseInt(torrent.leechers),
          completed: parseInt(torrent.completed),
          magnet: torrent.magnet,
          hash: torrent.hash,
          nyaaUrl: torrent.url,
          uploadedAt: new Date(torrent.date),
          size: torrent.filesize
        });
        await episode.save();
        console.log(`Added torrent for ${media.title.romaji} Ep ${parsed.episodeNumber}`);
      }
    }
  } catch (err) {
    console.error('Scraper error:', err.message);
  }
};

module.exports = { startScraper, scrapeLatest };
