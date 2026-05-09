import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { SEARCH_ANIME } from '../graphql/queries';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import { Loader2, Search } from 'lucide-react';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const { loading, error, data } = useQuery(SEARCH_ANIME, {
    variables: { query, page: 1, perPage: 24 },
    skip: !query,
  });

  return (
    <div className="min-h-screen bg-background text-slate-100 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Search size={24} />
          </div>
          <h2 className="text-2xl font-bold">
            {query ? `Search Results for "${query}"` : 'Start searching for anime'}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            Error: {error.message}
          </div>
        ) : data?.searchAnime?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {data.searchAnime.map((anime: any) => (
              <AnimeCard key={anime.anilistId} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            {query ? 'No anime found matching your search.' : 'Type something in the search bar to find your favorite anime.'}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
