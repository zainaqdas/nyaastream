/**
 * TorrentParser Utility
 * Extracts information from Nyaa torrent titles.
 */

const parseTitle = (title) => {
  const result = {
    title: '',
    releaseGroup: '',
    episodeNumber: null,
    quality: '',
    codec: '',
    audio: []
  };

  // Extract release group (usually in brackets at the start)
  const groupMatch = title.match(/^\[(.*?)\]/);
  if (groupMatch) {
    result.releaseGroup = groupMatch[1];
  }

  // Extract quality
  const qualityMatch = title.match(/(480p|720p|1080p|2160p|4k)/i);
  if (qualityMatch) {
    result.quality = qualityMatch[0].toLowerCase();
  }

  // Extract codec
  const codecMatch = title.match(/(h264|h265|hevc|x264|x265)/i);
  if (codecMatch) {
    result.codec = codecMatch[0].toLowerCase();
  }

  // Extract episode number
  // Pattern 1: - 01 [
  // Pattern 2: E01
  // Pattern 3: _ 01 _
  const epMatch = title.match(/(?:\s-\s|E|S\d+E|_\s|episode\s)(\d+)(?:\s|\[|\.|\s-)/i);
  if (epMatch) {
    result.episodeNumber = parseInt(epMatch[1]);
  } else {
    // Fallback for simple space-separated episode number
    const simpleEpMatch = title.match(/\s(\d{2,3})\s/);
    if (simpleEpMatch) {
      result.episodeNumber = parseInt(simpleEpMatch[1]);
    }
  }

  // Extract normalized title
  // Remove group, quality, codec, episode number tags
  let normalized = title;
  if (groupMatch) normalized = normalized.replace(groupMatch[0], '');
  normalized = normalized.replace(/\[.*?\]/g, '');
  normalized = normalized.replace(/\(.*?\)/g, '');
  normalized = normalized.replace(/(480p|720p|1080p|2160p|4k|h264|h265|hevc|x264|x265)/gi, '');
  normalized = normalized.replace(/\s-\s\d+/g, '');
  normalized = normalized.replace(/\.mkv|\.mp4/g, '');
  
  result.title = normalized.trim();

  return result;
};

module.exports = { parseTitle };
