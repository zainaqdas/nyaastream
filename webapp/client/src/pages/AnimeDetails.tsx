import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ANIME_DETAILS } from '../graphql/queries';
import Navbar from '../components/Navbar';
import { Loader2, Star, Calendar, Clock, Film, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, {
    variables: { id: parseInt(id || '0') },
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

  const anime = data.getAnimeDetails;
  const { metadata } = anime;
  const title = metadata.titles.english || metadata.titles.romaji;

  const handleCopy = (magnet: string) => {
    navigator.clipboard.writeText(magnet);
    setCopiedHash(magnet);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const currentEpisodeData = anime.episodes.find((e: any) => e.episodeNumber === selectedEpisode);

  return (
    <div className="min-h-screen bg-background text-slate-100 pb-20">
      <Navbar />

      {/* Banner Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <img
          src={metadata.bannerImage || metadata.coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-64">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={metadata.coverImage}
              alt={title}
              className="w-full rounded-2xl shadow-2xl border border-white/10"
            />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Score</div>
                <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {(metadata.averageScore / 10).toFixed(1)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Status</div>
                <div className="text-sm font-bold text-slate-200">{metadata.status}</div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow pt-8 md:pt-32">
            <motion.h1 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-5xl font-extrabold mb-4"
            >
              {title}
            </motion.h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Calendar size={14} /> {metadata.season} {metadata.year}
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Clock size={14} /> {metadata.status === 'FINISHED' ? 'Completed' : 'Airing'}
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Film size={14} /> {anime.totalEpisodes || '?'} Episodes
              </div>
            </div>

            <p 
              className="text-slate-300 leading-relaxed mb-8 text-lg line-clamp-6 md:line-clamp-none"
              dangerouslySetInnerHTML={{ __html: metadata.description }}
            />

            <div className="flex flex-wrap gap-2">
              {metadata.genres.map((genre: string) => (
                <span key={genre} className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-primary/20">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Episode List */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Episodes
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-3">
              {Array.from({ length: anime.totalEpisodes || 12 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedEpisode(num)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    selectedEpisode === num
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-primary/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Torrent List */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-secondary rounded-full" />
                Torrents for Episode {selectedEpisode}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                Source: Nyaa.si
              </div>
            </h3>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {currentEpisodeData?.torrents.length > 0 ? (
                  currentEpisodeData.torrents.map((torrent: any, idx: number) => (
                    <motion.div
                      key={torrent.magnet}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-200 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                            {torrent.title}
                          </h4>
                          <div className="flex flex-wrap gap-3 text-xs">
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase">
                              {torrent.quality || 'Unknown'}
                            </span>
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                              {torrent.releaseGroup || 'N/A'}
                            </span>
                            <span className="text-slate-500">{torrent.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="flex gap-4">
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase font-bold">Seed</div>
                              <div className="text-green-400 font-bold">{torrent.seeders}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase font-bold">Leech</div>
                              <div className="text-red-400 font-bold">{torrent.leechers}</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(torrent.magnet)}
                              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                              title="Copy Magnet Link"
                            >
                              {copiedHash === torrent.magnet ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            </button>
                            <a
                              href={torrent.magnet}
                              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/10"
                            >
                              <Download size={18} />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <p className="text-slate-400 font-medium">No torrents indexed for this episode yet.</p>
                    <button className="mt-4 text-primary font-bold hover:underline">
                      Trigger Manual Scrape
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
