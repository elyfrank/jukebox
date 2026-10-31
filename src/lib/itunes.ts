import type { NewQueueItem } from './db';

type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
};

// Busca músicas no catálogo público do iTunes (gratuito, sem chave).
export async function searchSongs(term: string): Promise<NewQueueItem[]> {
  const params = new URLSearchParams({ term, media: 'music', entity: 'song', limit: '25', country: 'BR' });
  const res = await fetch(`https://itunes.apple.com/search?${params}`);
  if (!res.ok) throw new Error('Não foi possível buscar as músicas agora');
  const { results } = (await res.json()) as { results: ITunesTrack[] };
  return results.map((t) => ({
    track_id: t.trackId,
    title: t.trackName.slice(0, 200),
    artist: t.artistName.slice(0, 200),
    album: t.collectionName?.slice(0, 200) ?? null,
    // Capa maior que a de 100px que a API devolve.
    artwork_url: t.artworkUrl100?.replace('100x100bb', '300x300bb') ?? null,
  }));
}

// Links de busca para o host abrir a música no player que preferir.
export function playerLinks(song: { title: string; artist: string }) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  return [
    { label: 'Spotify', url: `https://open.spotify.com/search/${q}` },
    { label: 'YouTube Music', url: `https://music.youtube.com/search?q=${q}` },
    { label: 'Deezer', url: `https://www.deezer.com/search/${q}` },
  ];
}
