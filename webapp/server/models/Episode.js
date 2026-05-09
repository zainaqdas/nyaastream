const mongoose = require('mongoose');

const TorrentSchema = new mongoose.Schema({
  title: String,
  releaseGroup: String,
  quality: String,
  codec: String,
  audio: [String],
  seeders: Number,
  leechers: Number,
  completed: Number,
  magnet: String,
  hash: String,
  source: { type: String, default: 'nyaa-si' },
  nyaaUrl: String,
  uploadedAt: Date,
  size: String
});

const EpisodeSchema = new mongoose.Schema({
  anilistId: { type: Number, required: true },
  episodeNumber: { type: Number, required: true },
  title: String,
  torrents: [TorrentSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

EpisodeSchema.index({ anilistId: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', EpisodeSchema);
