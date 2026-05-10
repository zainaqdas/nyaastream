import React, { useState } from 'react';
import { Loader2, Info, AlertTriangle, MonitorPlay, ShieldAlert, Download } from 'lucide-react';

interface StreamPlayerProps {
  magnet: string;
  title: string;
  poster?: string;
  onClose: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ magnet, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const proxyUrl = `https://webtor.io/show?magnet=${encodeURIComponent(magnet)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="p-4 bg-slate-800/50 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <MonitorPlay className="text-primary" size={20} />
            <h3 className="font-bold text-slate-200 line-clamp-1">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400"
          >
            ✕
          </button>
        </div>

        {/* Video Area */}
        <div className="aspect-video bg-black relative group">
          <div className="w-full h-full relative">
            <iframe 
              src={proxyUrl}
              title="Video Player Proxy"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              onLoad={() => setLoading(false)}
              onError={() => setError('Failed to load the video player.')}
            />
            
            {loading && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-slate-300 font-medium">Loading Webtor Player...</p>
                <p className="text-slate-500 text-sm mt-2 text-center px-4">
                  Connecting to torrent network... <br/> 
                  If this takes too long, check if your <b>Ad-blocker</b> or <b>Brave Shields</b> is blocking the player.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-30 p-8 text-center">
              <AlertTriangle className="text-red-500 mb-4" size={48} />
              <h4 className="text-xl font-bold text-white mb-2">Streaming Failed</h4>
              <p className="text-slate-400 mb-6 max-w-md">{error}</p>
              <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold transition-all">
                Close Player
              </button>
            </div>
          )}
        </div>

        {/* Brave / Shield Warning */}
        <div className="bg-orange-500/10 border-y border-orange-500/20 px-4 py-2 flex items-center gap-3 text-xs text-orange-400">
          <ShieldAlert size={14} />
          <span><b>Brave Users:</b> If the player is stuck, click the <b>Lion Icon</b> in the URL bar and <b>Disable Shields</b> for this site.</span>
        </div>

        {/* Info Bar */}
        <div className="p-4 bg-blue-500/10 flex items-center gap-3 text-sm text-blue-300">
          <Info size={16} />
          <span>Streaming via <b>Webtor.io Proxy</b>. This method is the most compatible with mobile and Brave browsers.</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="text-slate-500 text-xs text-center max-w-lg">
          If the video fails to load or remains stuck on the spinner, the torrent might have very few seeders or is being blocked by your browser settings.
        </div>
        <a 
          href={magnet}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-xs font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5"
        >
          <Download size={14} />
          Can't stream? Download Magnet Directly
        </a>
      </div>
    </div>
  );
};

export default StreamPlayer;
