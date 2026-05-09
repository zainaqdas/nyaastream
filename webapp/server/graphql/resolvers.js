const jwt = require('jsonwebtoken');
const Anime = require('../models/Anime');
const Episode = require('../models/Episode');
const User = require('../models/User');
const anilist = require('../services/anilist');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const resolvers = {
  Query: {
    getTrendingAnime: async (_, { page, perPage }) => {
      const mediaList = await anilist.fetchTrending(page, perPage);
      return mediaList.map(media => ({
        anilistId: media.id,
        metadata: {
          titles: media.title,
          description: media.description,
          coverImage: media.coverImage.extraLarge || media.coverImage.large,
          bannerImage: media.bannerImage,
          genres: media.genres,
          averageScore: media.averageScore,
          season: media.season,
          year: media.seasonYear
        },
        totalEpisodes: media.episodes
      }));
    },
    searchAnime: async (_, { query, page, perPage }) => {
      const mediaList = await anilist.searchAnime(query, page, perPage);
      return mediaList.map(media => ({
        anilistId: media.id,
        metadata: {
          titles: media.title,
          description: media.description,
          coverImage: media.coverImage.large,
          averageScore: media.averageScore
        }
      }));
    },
    getAnimeDetails: async (_, { id }) => {
      let anime = await Anime.findOne({ anilistId: id });
      if (!anime) {
        const details = await anilist.fetchDetails(id);
        anime = {
          anilistId: details.id,
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
        };
      }
      return anime;
    },
    getEpisodeTorrents: async (_, { anilistId, episodeNumber }) => {
      return await Episode.findOne({ anilistId, episodeNumber });
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await User.findById(user.id);
    }
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) throw new Error('User already exists');
      const user = await User.create({ username, email, passwordHash: password });
      return {
        token: generateToken(user._id),
        user
      };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }
      return {
        token: generateToken(user._id),
        user
      };
    },
    addToWatchlist: async (_, { anilistId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.id);
      if (!dbUser.watchlist.includes(anilistId)) {
        dbUser.watchlist.push(anilistId);
        await dbUser.save();
      }
      return dbUser;
    },
    removeFromWatchlist: async (_, { anilistId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.id);
      dbUser.watchlist = dbUser.watchlist.filter(id => id !== anilistId);
      await dbUser.save();
      return dbUser;
    },
    markEpisodeWatched: async (_, { anilistId, episodeNumber }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.id);
      const watchEntry = dbUser.watchedEpisodes.find(e => e.anilistId === anilistId);
      if (watchEntry) {
        if (!watchEntry.episodes.includes(episodeNumber)) {
          watchEntry.episodes.push(episodeNumber);
        }
      } else {
        dbUser.watchedEpisodes.push({ anilistId, episodes: [episodeNumber] });
      }
      await dbUser.save();
      return dbUser;
    }
  },
  Anime: {
    episodes: async (parent) => {
      return await Episode.find({ anilistId: parent.anilistId }).sort({ episodeNumber: 1 });
    }
  },
  User: {
    watchlist: async (parent) => {
      return await Promise.all(parent.watchlist.map(async id => {
        let anime = await Anime.findOne({ anilistId: id });
        if (!anime) {
          const details = await anilist.fetchDetails(id);
          return { anilistId: id, metadata: { titles: details.title, coverImage: details.coverImage.large } };
        }
        return anime;
      }));
    }
  }
};

module.exports = resolvers;
