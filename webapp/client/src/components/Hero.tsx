import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  anime: {
    anilistId: number;
    metadata: {
      titles: {
        romaji: string;
        english: string;
      };
      bannerImage: string;
      coverImage: string;
      description: string;
      averageScore: number;
      genres: string[];
    };
  };
}

const Hero: React.FC<HeroProps> = ({ anime }) => {
  const { anilistId, metadata } = anime;
  const title = metadata.titles.english || metadata.titles.romaji;

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0">
        <img
          src={metadata.bannerImage || metadata.coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Trending Now
            </span>
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star size={16} fill="currentColor" />
              {(metadata.averageScore / 10).toFixed(1)}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            {title}
          </h1>

          <p 
            className="text-slate-300 text-lg mb-8 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: metadata.description }}
          />

          <div className="flex flex-wrap gap-4">
            <Link
              to={`/anime/${anilistId}`}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/20 transform hover:scale-105"
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </Link>
            <Link
              to={`/anime/${anilistId}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-3 rounded-full font-bold transition-all border border-white/10"
            >
              <Info size={20} />
              More Details
            </Link>
          </div>

          <div className="flex gap-4 mt-8">
            {metadata.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="text-slate-400 text-sm font-medium">
                • {genre}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
