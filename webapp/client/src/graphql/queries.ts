import { gql } from '@apollo/client';

export const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime($page: Int, $perPage: Int) {
    getTrendingAnime(page: $page, perPage: $perPage) {
      anilistId
      metadata {
        titles {
          romaji
          english
        }
        coverImage
        averageScore
        genres
      }
    }
  }
`;

export const SEARCH_ANIME = gql`
  query SearchAnime($query: String!, $page: Int, $perPage: Int) {
    searchAnime(query: $query, page: $page, perPage: $perPage) {
      anilistId
      metadata {
        titles {
          romaji
          english
        }
        coverImage
        averageScore
      }
    }
  }
`;

export const GET_ANIME_DETAILS = gql`
  query GetAnimeDetails($id: Int!) {
    getAnimeDetails(id: $id) {
      anilistId
      metadata {
        titles {
          romaji
          english
          native
        }
        description
        coverImage
        bannerImage
        genres
        studios {
          name
        }
        status
        averageScore
        season
        year
        trailer {
          id
          site
        }
      }
      totalEpisodes
      episodes {
        episodeNumber
        torrents {
          title
          releaseGroup
          quality
          seeders
          leechers
          magnet
          size
        }
      }
    }
  }
`;

export const GET_EPISODE_TORRENTS = gql`
  query GetEpisodeTorrents($anilistId: Int!, $episodeNumber: Int!) {
    getEpisodeTorrents(anilistId: $anilistId, episodeNumber: $episodeNumber) {
      episodeNumber
      torrents {
        title
        releaseGroup
        quality
        seeders
        leechers
        magnet
        size
      }
    }
  }
`;
