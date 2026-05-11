const express = require('express');
const router = express.Router();
const animeService = require('../services/animeService');
const nyaa = require('../services/nyaa');
const { scrapeLatest } = require('../services/scraper');

const SCRAPER_KEY = process.env.SCRAPER_KEY || 'default_key';

router.get('/scrape', async (req, res) => {
  const { key } = req.query;
  if (key !== SCRAPER_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Manual scrape triggered via API');
    // Run in background
    scrapeLatest();
    res.json({ message: 'Scraper started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const data = await animeService.fetchTrending();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await animeService.searchAnime(q);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/anime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const details = await animeService.fetchDetails(parseInt(id));
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/torrents', async (req, res) => {
  const { title, episode } = req.query;
  try {
    const torrents = await nyaa.searchTorrents(title, episode);
    res.json(torrents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
