const Anime = require('../models/Anime');
const Episode = require('../models/Episode');
const anilist = require('../services/anilist');
const nyaa = require('../services/nyaa');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      console.log(`[Resolver] searchAnime called with query: "${query}", page: ${page}, perPage: ${perPage}`);
      const mediaList = await anilist.searchAnime(query, page, perPage);
      console.log(`[Resolver] searchAnime returned ${mediaList?.length || 0} results`);
      
      if (!mediaList) return [];
      
      return mediaList.map(media => ({
        anilistId: media.id,
        metadata: {
          titles: media.title,
          description: media.description,
          coverImage: media.coverImage?.large,
          averageScore: media.averageScore
        }
      }));
    },
    getAnimeDetails: async (_, { id }) => {
      let anime = await Anime.findOne({ anilistId: id });
      if (!anime) {
        const details = await anilist.fetchDetails(id);
        anime = new Anime({
          anilistId: details.id,
          nyaaTitle: details.title.romaji,
          metadata: {
            titles: details.title,
            description: details.description,
            coverImage: details.coverImage.extraLarge,
            bannerImage: details.bannerImage,
            genres: details.genres,
            studios: details.studios.nodes,
            status: details.status,
            averageScore: details.averageScore,
          },
          totalEpisodes: details.episodes
        });
        await anime.save(); // Log to DB on first view
      }
      return anime;
    },
    getEpisodeTorrents: async (_, { anilistId, episodeNumber }) => {
      let anime = await Anime.findOne({ anilistId });
      if (!anime) {
        // If not in DB, trigger metadata fetch and log first
        anime = await resolvers.Query.getAnimeDetails(null, { id: anilistId });
      }

      const title = anime.metadata.titles.romaji || anime.metadata.titles.english;
      return await nyaa.ensureEpisodeIndexed(anilistId, title, episodeNumber);
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
        return await resolvers.Query.getAnimeDetails(null, { id });
      }));
    }
  }
};

module.exports = resolvers;
