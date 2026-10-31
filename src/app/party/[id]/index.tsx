import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import {
  countMembers,
  endParty,
  getParty,
  leaveParty,
  listQueue,
  removeFromQueue,
  setQueueStatus,
  subscribeToParty,
  type Party,
  type QueueItem,
  type QueueStatus,
} from '@/lib/db';
import { openInPlayer, playerLinks } from '@/lib/itunes';
import { Button, Segmented, SongRow, errorMessage, showDialog, useTheme } from '@/lib/ui';

type Tab = 'queue' | 'history';

export default function PartyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors, styles } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = session!.user.id;
  const [party, setParty] = useState<Party | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [members, setMembers] = useState(0);
  const [tab, setTab] = useState<Tab>('queue');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([getParty(id), listQueue(id), countMembers(id)]).then(
        ([p, q, m]) => {
          setParty(p);
          setQueue(q);
          setMembers(m);
          setError('');
        },
        (e) => setError(errorMessage(e)),
      ),
    [id],
  );

  // Carrega e passa a ouvir mudanças da fila em tempo real.
  useEffect(() => {
    load();
    return subscribeToParty(id, load);
  }, [id, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function run(action: () => Promise<void>) {
    try {
      await action();
      await load();
    } catch (e) {
      showDialog('Erro', errorMessage(e));
    }
  }

  if (!party) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Stack.Screen options={{ title: 'Festa' }} />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  const isHost = party.host_id === userId;
  const ended = !!party.ended_at;
  const playing = queue.find((q) => q.status === 'playing');
  const queued = queue.filter((q) => q.status === 'queued');
  const history = queue.filter((q) => q.status === 'played' || q.status === 'skipped').reverse();

  function choosePlayer(item: QueueItem) {
    showDialog('Abrir em qual player?', `${item.title} — ${item.artist}`, [
      ...playerLinks(item).map((p) => ({ text: p.label, onPress: () => openInPlayer(p) })),
      { text: 'Agora não', style: 'cancel' },
    ]);
  }

  function setStatus(item: QueueItem, status: QueueStatus) {
    return run(() => setQueueStatus(item.id, status));
  }

  async function play(item: QueueItem) {
    await setStatus(item, 'playing');
    choosePlayer(item);
  }

  // Toca a primeira da fila (a que está tocando vira "tocou" no banco); sem fila, só encerra a atual.
  function playNext() {
    if (queued[0]) play(queued[0]);
    else if (playing) setStatus(playing, 'played');
  }

  function onPressQueued(item: QueueItem) {
    if (ended) return;
    if (isHost) {
      showDialog(item.title, item.artist, [
        { text: 'Tocar agora', onPress: () => play(item) },
        { text: 'Pular', style: 'destructive', onPress: () => setStatus(item, 'skipped') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else if (item.requested_by === userId) {
      showDialog('Tirar da fila?', `${item.title} — ${item.artist}`, [
        { text: 'Tirar', style: 'destructive', onPress: () => run(() => removeFromQueue(item.id)) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  }

  function openMenu() {
    showDialog(party!.name, isHost ? `Código ${party!.code}` : `Host: ${party!.host?.name ?? '—'}`, [
      isHost
        ? { text: 'Encerrar festa', style: 'destructive', onPress: confirmEnd }
        : { text: 'Sair da festa', style: 'destructive', onPress: confirmLeave },
      { text: 'Fechar', style: 'cancel' },
    ]);
  }

  function confirmEnd() {
    showDialog('Encerrar a festa?', 'Ninguém mais poderá entrar nem pedir músicas.', [
      { text: 'Encerrar', style: 'destructive', onPress: () => run(() => endParty(party!.id)) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function confirmLeave() {
    showDialog('Sair da festa?', 'Você pode voltar depois com o código.', [
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveParty(party!.id, userId);
            router.back();
          } catch (e) {
            showDialog('Erro', errorMessage(e));
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function requesterName(item: QueueItem) {
    return item.requested_by === userId ? 'você' : (item.requester?.name ?? 'alguém');
  }

  const list = tab === 'queue' ? queued : history;
  const showRequestButton = !ended;

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: party.name,
          headerRight: () => (
            <View style={[styles.row, { gap: 16 }]}>
              <View style={[styles.row, { gap: 4 }]} accessibilityLabel={`${members} pessoas na festa`}>
                <MaterialIcons name="group" size={20} color={colors.muted} />
                <Text style={styles.muted}>{members}</Text>
              </View>
              {!ended && (
                <Pressable
                  hitSlop={8}
                  accessibilityLabel="Convidar"
                  onPress={() => router.push({ pathname: '/party/[id]/invite', params: { id: party.id } })}
                >
                  <MaterialIcons name="qr-code-2" size={24} color={colors.primary} />
                </Pressable>
              )}
              <Pressable hitSlop={8} accessibilityLabel="Mais opções" onPress={openMenu}>
                <MaterialIcons name="more-vert" size={24} color={colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      {/* Parte fixa: o que está tocando + abas. Só a lista abaixo rola. */}
      <View style={[styles.content, { paddingBottom: 8 }]}>
        {ended && (
          <View style={[styles.card, { padding: 12 }]}>
            <Text style={styles.subtitle}>Festa encerrada</Text>
            <Text style={styles.muted}>Não dá mais para pedir músicas.</Text>
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={{ gap: 8 }}>
          <Text style={[styles.muted, { fontSize: 12, fontWeight: '700', letterSpacing: 1 }]}>TOCANDO AGORA</Text>
          {playing ? (
            <SongRow
              title={playing.title}
              artist={playing.artist}
              artworkUrl={playing.artwork_url}
              detail={`Pedida por ${requesterName(playing)}`}
              highlight
            />
          ) : (
            <View style={[styles.card, { padding: 12 }]}>
              <Text style={styles.muted}>
                {isHost && queued.length > 0 ? 'Nada tocando. Toque em "Tocar a primeira".' : 'Nada tocando no momento.'}
              </Text>
            </View>
          )}
          {isHost && !ended && (playing || queued.length > 0) && (
            <View style={styles.row}>
              {playing && (
                <View style={{ flex: 1 }}>
                  <Button title="Abrir no player" variant="secondary" onPress={() => choosePlayer(playing)} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Button
                  title={!playing ? 'Tocar a primeira' : queued.length > 0 ? 'Próxima' : 'Já tocou'}
                  onPress={playNext}
                />
              </View>
            </View>
          )}
        </View>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'queue', label: `Fila (${queued.length})` },
            { value: 'history', label: `Já tocaram (${history.length})` },
          ]}
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 8, gap: 8, paddingBottom: (showRequestButton ? 96 : 16) + insets.bottom },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          tab === 'queue' && queued.length > 0 && !ended ? (
            <Text style={styles.muted}>
              {isHost ? 'Toque numa música para tocar ou pular.' : 'Toque numa música sua para tirar da fila.'}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={[styles.muted, { textAlign: 'center', marginTop: 16 }]}>
            {tab === 'queue' ? 'A fila está vazia. Peça a primeira música!' : 'Nenhuma música tocou ainda.'}
          </Text>
        }
        renderItem={({ item, index }) =>
          tab === 'queue' ? (
            <SongRow
              title={item.title}
              artist={item.artist}
              artworkUrl={item.artwork_url}
              detail={`${index + 1}º · pedida por ${requesterName(item)}`}
              onPress={!ended && (isHost || item.requested_by === userId) ? () => onPressQueued(item) : undefined}
            />
          ) : (
            <SongRow
              title={item.title}
              artist={item.artist}
              artworkUrl={item.artwork_url}
              detail={`${item.status === 'skipped' ? 'Pulada' : 'Tocou'} · pedida por ${requesterName(item)}`}
            />
          )
        }
      />

      {/* Botão fixo embaixo, sempre ao alcance do polegar. */}
      {showRequestButton && (
        <Pressable
          onPress={() => router.push({ pathname: '/party/[id]/search', params: { id: party.id } })}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.row,
            {
              position: 'absolute',
              right: 16,
              bottom: 16 + insets.bottom,
              gap: 8,
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 28,
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000000',
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <MaterialIcons name="add" size={22} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>Pedir música</Text>
        </Pressable>
      )}
    </View>
  );
}
