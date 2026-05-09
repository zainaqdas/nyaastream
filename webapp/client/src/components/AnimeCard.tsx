import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimeCardProps {
  anime: {
    anilistId: number;
    metadata: {
      titles: {
        romaji: string;
        english: string;
      };
      coverImage: string;
      averageScore?: number;
      genres?: string[];
    };
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { anilistId, metadata } = anime;
  const title = metadata.titles.english || metadata.titles.romaji;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all border border-white/5"
    >
      <Link to={`/anime/${anilistId}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={metadata.coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-yellow-400 border border-white/10">
            <Star size={10} fill="currentColor" />
            {metadata.averageScore ? (metadata.averageScore / 10).toFixed(1) : 'N/A'}
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary p-3 rounded-full shadow-xl shadow-primary/40 transform scale-75 group-hover:scale-100 transition-transform">
              <Play size={24} fill="white" className="text-white ml-1" />
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-bold line-clamp-2 text-slate-100 group-hover:text-primary transition-colors min-h-[40px]">
            {title}
          </h3>
          {metadata.genres && (
            <div className="flex gap-2 mt-2 overflow-hidden">
              {metadata.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="text-[10px] text-slate-400 font-medium">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
