import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { SearchResultRow } from '@/components/music';
import { Input } from '@/components/ui';
import { useRequestSong } from '@/hooks/useRequestSong';
import { useSongPreview } from '@/hooks/useSongPreview';
import { useSongSearch } from '@/hooks/useSongSearch';
import { useTheme } from '@/lib/theme';

export default function SearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, styles } = useTheme();
  const [term, setTerm] = useState('');
  const { results, searching, error, active } = useSongSearch(term);
  const preview = useSongPreview();
  const request = useRequestSong(id);

  const emptyState = searching ? (
    <ActivityIndicator color={colors.primary} />
  ) : (
    <Text style={[styles.muted, { textAlign: 'center' }]}>
      {active ? 'Nenhuma música encontrada.' : 'Digite para buscar.'}
    </Text>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingBottom: 0 }]}>
        <Input
          placeholder="Busque por música ou artista"
          value={term}
          onChangeText={setTerm}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
      <FlatList
        data={results}
        keyExtractor={(s) => String(s.track_id)}
        contentContainerStyle={[styles.content, { gap: 8 }]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={emptyState}
        renderItem={({ item }) => (
          <SearchResultRow
            song={item}
            requested={request.wasRequested(item.track_id)}
            previewPlaying={preview.isPlaying(item.track_id)}
            previewLoading={preview.isLoading(item.track_id)}
            onRequest={() => request.confirm(item)}
            onTogglePreview={() => item.preview_url && preview.toggle(item.track_id, item.preview_url)}
          />
        )}
      />
    </View>
  );
}
