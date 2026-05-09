const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  watchlist: [Number], // Array of anilistIds
  watchedEpisodes: [{
    anilistId: Number,
    episodes: [Number]
  }],
  preferences: {
    theme: { type: String, default: 'dark' },
    defaultQuality: { type: String, default: '1080p' },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
