import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { requestSong } from '@/lib/db';
import { searchSongs, type SearchResult } from '@/lib/itunes';
import { Input, SongRow, errorMessage, showDialog, useTheme } from '@/lib/ui';

export default function SearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, styles } = useTheme();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState<Set<number>>(new Set());
  // Um único player para as prévias: tocar outra música troca a que está tocando.
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [previewId, setPreviewId] = useState<number | null>(null);

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

  function togglePreview(song: SearchResult) {
    if (!song.preview_url) return;
    if (previewId !== song.track_id) {
      player.replace(song.preview_url);
      player.play();
      setPreviewId(song.track_id);
    } else if (status.playing) {
      player.pause();
    } else {
      // Recomeça se a prévia já tinha terminado.
      if (status.didJustFinish || status.currentTime >= status.duration - 0.5) player.seekTo(0);
      player.play();
    }
  }

  function previewButton(song: SearchResult) {
    if (!song.preview_url) return null;
    const active = previewId === song.track_id;
    return (
      <Pressable
        onPress={() => togglePreview(song)}
        hitSlop={8}
        accessibilityLabel={active && status.playing ? 'Pausar prévia' : 'Ouvir prévia'}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {active && !status.isLoaded ? (
          <ActivityIndicator color={colors.onPrimary} size="small" />
        ) : (
          <Text style={{ color: colors.onPrimary, fontSize: 16 }}>{active && status.playing ? '❚❚' : '▶'}</Text>
        )}
      </Pressable>
    );
  }

  function confirmRequest(song: SearchResult) {
    showDialog('Pedir esta música?', `${song.title} — ${song.artist}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Pedir',
        onPress: async () => {
          try {
            await requestSong(id, {
              track_id: song.track_id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              artwork_url: song.artwork_url,
            });
            setRequested((prev) => new Set(prev).add(song.track_id));
          } catch (e) {
            showDialog('Erro', errorMessage(e));
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
              right={
                <View style={{ alignItems: 'center', gap: 4 }}>
                  {previewButton(item)}
                  {done && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Na fila ✓</Text>}
                </View>
              }
            />
          );
        }}
      />
    </View>
  );
}
