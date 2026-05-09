import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRENDING_ANIME } from '../graphql/queries';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { Loader2, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const { loading, error, data } = useQuery(GET_TRENDING_ANIME, {
    variables: { page: 1, perPage: 20 },
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-white">
        Error: {error.message}
      </div>
    );
  }

  const trendingAnime = data.getTrendingAnime;
  const featured = trendingAnime[0];

  return (
    <div className="min-h-screen bg-background text-slate-100 pb-20">
      <Navbar />
      
      {featured && <Hero anime={featured} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-lg">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Trending Anime</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {trendingAnime.map((anime: any) => (
            <AnimeCard key={anime.anilistId} anime={anime} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
