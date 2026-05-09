const express = require('express');
const router = express.Router();
const anilist = require('../services/anilist');
const jikan = require('../services/jikan');
const nyaa = require('../services/nyaa');

router.get('/trending', async (req, res) => {
  try {
    const data = await anilist.fetchTrending();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await anilist.searchAnime(q);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/anime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const details = await anilist.fetchDetails(parseInt(id));
    // Note: AniList ID is not always the same as MAL ID, but Jikan uses MAL ID.
    // For simplicity in this prototype, we'll try to use the AniList ID or handle mapping if needed.
    // Most popular shows have same/linked IDs or we can fetch MAL ID from AniList.
    const episodes = await jikan.fetchEpisodes(id); 
    res.json({ ...details, episodes });
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
