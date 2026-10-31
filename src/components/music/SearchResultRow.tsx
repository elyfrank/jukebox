import { Text, View } from 'react-native';

import type { SearchResult } from '@/lib/itunes';
import { useTheme } from '@/lib/theme';

import { PreviewButton } from './PreviewButton';
import { SongRow } from './SongRow';

type Props = {
  song: SearchResult;
  requested: boolean;
  previewPlaying: boolean;
  previewLoading: boolean;
  onRequest: () => void;
  onTogglePreview: () => void;
};

// Resultado da busca: toque na linha para pedir; botão à direita para ouvir a prévia.
export function SearchResultRow({ song, requested, previewPlaying, previewLoading, onRequest, onTogglePreview }: Props) {
  const { colors } = useTheme();
  return (
    <SongRow
      title={song.title}
      artist={song.artist}
      artworkUrl={song.artwork_url}
      detail={song.album ?? undefined}
      onPress={requested ? undefined : onRequest}
      right={
        <View style={{ alignItems: 'center', gap: 4 }}>
          {song.preview_url && (
            <PreviewButton playing={previewPlaying} loading={previewLoading} onPress={onTogglePreview} />
          )}
          {requested && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Na fila ✓</Text>}
        </View>
      }
    />
  );
}
