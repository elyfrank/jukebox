import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';

import { requestSong, type NewQueueItem } from '@/lib/db';
import { searchSongs } from '@/lib/itunes';
import { Input, SongRow, errorMessage, useTheme } from '@/lib/ui';

export default function SearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, styles } = useTheme();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<NewQueueItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState<Set<number>>(new Set());

  // Busca enquanto a pessoa digita, esperando ela parar por um instante.
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const songs = await searchSongs(q);
        if (!cancelled) {
          setResults(songs);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  function confirmRequest(song: NewQueueItem) {
    Alert.alert('Pedir esta música?', `${song.title} — ${song.artist}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Pedir',
        onPress: async () => {
          try {
            await requestSong(id, song);
            setRequested((prev) => new Set(prev).add(song.track_id));
          } catch (e) {
            Alert.alert('Erro', errorMessage(e));
          }
        },
      },
    ]);
  }

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
        data={term.trim().length < 2 ? [] : results}
        keyExtractor={(s) => String(s.track_id)}
        contentContainerStyle={[styles.content, { gap: 8 }]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          searching ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.muted, { textAlign: 'center' }]}>
              {term.trim().length < 2 ? 'Digite para buscar.' : 'Nenhuma música encontrada.'}
            </Text>
          )
        }
        renderItem={({ item }) => {
          const done = requested.has(item.track_id);
          return (
            <SongRow
              title={item.title}
              artist={item.artist}
              artworkUrl={item.artwork_url}
              detail={item.album ?? undefined}
              onPress={done ? undefined : () => confirmRequest(item)}
              right={done ? <Text style={{ color: colors.primary, fontWeight: '600' }}>Na fila ✓</Text> : null}
            />
          );
        }}
      />
    </View>
  );
}
