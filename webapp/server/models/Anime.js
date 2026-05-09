const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
  anilistId: { type: Number, required: true, unique: true },
  nyaaTitle: String,
  metadata: {
    titles: {
      romaji: String,
      english: String,
      native: String
    },
    description: String,
    coverImage: String,
    bannerImage: String,
    genres: [String],
    studios: [{ name: String }],
    season: String,
    year: Number,
    status: String,
    averageScore: Number,
    popularity: Number,
    trailer: {
      id: String,
      site: String
    }
  },
  totalEpisodes: Number,
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

AnimeSchema.index({ 'metadata.titles.romaji': 'text', 'metadata.titles.english': 'text' });

module.exports = mongoose.model('Anime', AnimeSchema);
