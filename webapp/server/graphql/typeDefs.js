const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Title {
    romaji: String
    english: String
    native: String
  }

  type Studio {
    name: String
  }

  type Trailer {
    id: String
    site: String
  }

  type Metadata {
    titles: Title
    description: String
    coverImage: String
    bannerImage: String
    genres: [String]
    studios: [Studio]
    season: String
    year: Int
    status: String
    averageScore: Int
    popularity: Int
    trailer: Trailer
  }

  type Torrent {
    id: ID
    title: String
    releaseGroup: String
    quality: String
    codec: String
    audio: [String]
    seeders: Int
    leechers: Int
    completed: Int
    magnet: String
    hash: String
    source: String
    nyaaUrl: String
    uploadedAt: String
    size: String
  }

  type Episode {
    id: ID
    anilistId: Int
    episodeNumber: Int
    title: String
    torrents: [Torrent]
    lastUpdated: String
  }

  type Anime {
    id: ID
    anilistId: Int
    nyaaTitle: String
    metadata: Metadata
    totalEpisodes: Int
    episodes: [Episode]
    lastUpdated: String
  }

  type User {
    id: ID
    username: String
    email: String
    watchlist: [Anime]
    watchedEpisodes: [WatchedAnime]
  }

  type WatchedAnime {
    anime: Anime
    episodes: [Int]
  }

  type AuthResponse {
    token: String
    user: User
  }

  type Query {
    getTrendingAnime(page: Int, perPage: Int): [Anime]
    searchAnime(query: String!, page: Int, perPage: Int): [Anime]
    getAnimeDetails(id: Int!): Anime
    getEpisodeTorrents(anilistId: Int!, episodeNumber: Int!): Episode
    me: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthResponse
    login(email: String!, password: String!): AuthResponse
    addToWatchlist(anilistId: Int!): User
    removeFromWatchlist(anilistId: Int!): User
    markEpisodeWatched(anilistId: Int!, episodeNumber: Int!): User
  }
`;

module.exports = typeDefs;
