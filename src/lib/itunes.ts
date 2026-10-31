import { Linking, Platform } from 'react-native';

import type { NewQueueItem } from './db';

type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
};

// Resultado da busca: dados que vão para a fila + prévia de 30 s (só para ouvir antes de pedir).
export type SearchResult = NewQueueItem & { preview_url: string | null };

// Busca músicas no catálogo público do iTunes (gratuito, sem chave).
export async function searchSongs(term: string): Promise<SearchResult[]> {
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
    preview_url: t.previewUrl ?? null,
  }));
}

// Players onde o host pode abrir a busca da música: link do app (abre o aplicativo já na busca)
// e link do site, usado no navegador ou quando o app não está instalado.
export function playerLinks(song: { title: string; artist: string }) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  return [
    { label: 'Spotify', appUrl: `spotify:search:${q}`, webUrl: `https://open.spotify.com/search/${q}` },
    // O app do YouTube Music atende os links de music.youtube.com (não tem link próprio de busca).
    { label: 'YouTube Music', appUrl: null, webUrl: `https://music.youtube.com/search?q=${q}` },
    { label: 'Deezer', appUrl: `deezer://www.deezer.com/search/${q}`, webUrl: `https://www.deezer.com/search/${q}` },
  ];
}

export async function openInPlayer(link: { appUrl: string | null; webUrl: string }) {
  if (link.appUrl && Platform.OS !== 'web') {
    try {
      return await Linking.openURL(link.appUrl);
    } catch {
      // App não instalado: segue para o site.
    }
  }
  await Linking.openURL(link.webUrl);
}
