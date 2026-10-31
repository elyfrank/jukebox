import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

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
import { Button, Card, SongRow, errorMessage, showDialog, useTheme } from '@/lib/ui';

export default function PartyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors, styles } = useTheme();
  const userId = session!.user.id;
  const [party, setParty] = useState<Party | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [members, setMembers] = useState(0);
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
    showDialog(
      'Abrir em qual player?',
      `${item.title} — ${item.artist}`,
      [
        ...playerLinks(item).map((p) => ({ text: p.label, onPress: () => openInPlayer(p) })),
        { text: 'Agora não', style: 'cancel' },
      ],
    );
  }

  function setStatus(item: QueueItem, status: QueueStatus) {
    return run(() => setQueueStatus(item.id, status));
  }

  function onPressItem(item: QueueItem) {
    if (ended) return;
    if (isHost && item.status === 'queued') {
      showDialog(item.title, item.artist, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pular', style: 'destructive', onPress: () => setStatus(item, 'skipped') },
        {
          text: 'Tocar agora',
          onPress: async () => {
            await setStatus(item, 'playing');
            choosePlayer(item);
          },
        },
      ]);
    } else if (isHost && item.status === 'playing') {
      showDialog(item.title, item.artist, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir no player', onPress: () => choosePlayer(item) },
        { text: 'Já tocou', onPress: () => setStatus(item, 'played') },
      ]);
    } else if (item.requested_by === userId && item.status === 'queued') {
      showDialog('Tirar da fila?', `${item.title} — ${item.artist}`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tirar', style: 'destructive', onPress: () => run(() => removeFromQueue(item.id)) },
      ]);
    }
  }

  function confirmEnd() {
    showDialog('Encerrar a festa?', 'Ninguém mais poderá entrar nem pedir músicas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Encerrar', style: 'destructive', onPress: () => run(() => endParty(party!.id)) },
    ]);
  }

  function confirmLeave() {
    showDialog('Sair da festa?', 'Você pode voltar depois com o código.', [
      { text: 'Cancelar', style: 'cancel' },
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
    ]);
  }

  function requesterName(item: QueueItem) {
    return item.requested_by === userId ? 'você' : (item.requester?.name ?? 'alguém');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      <Stack.Screen options={{ title: party.name }} />

      <Card>
        {ended ? (
          <Text style={styles.subtitle}>Festa encerrada</Text>
        ) : (
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View>
              <Text style={styles.muted}>Código</Text>
              <Text style={[styles.bigNumber, { fontSize: 28, letterSpacing: 3 }]}>{party.code}</Text>
            </View>
            <Text style={styles.muted}>
              {members} {members === 1 ? 'pessoa' : 'pessoas'}
            </Text>
          </View>
        )}
        <Text style={styles.muted}>
          {isHost ? 'Você é o host.' : `Host: ${party.host?.name ?? '—'}`}
          {isHost && !ended ? ' Toque numa música para tocar, pular ou abrir no player.' : ''}
        </Text>
        {!ended && (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Button
                title="Pedir música"
                onPress={() => router.push({ pathname: '/party/[id]/search', params: { id: party.id } })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Convidar"
                variant="secondary"
                onPress={() => router.push({ pathname: '/party/[id]/invite', params: { id: party.id } })}
              />
            </View>
          </View>
        )}
      </Card>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.subtitle}>Tocando agora</Text>
      {playing ? (
        <SongRow
          title={playing.title}
          artist={playing.artist}
          artworkUrl={playing.artwork_url}
          detail={`Pedida por ${requesterName(playing)}`}
          highlight
          onPress={isHost ? () => onPressItem(playing) : undefined}
        />
      ) : (
        <Text style={styles.muted}>Nada tocando no momento.</Text>
      )}

      <Text style={styles.subtitle}>Na fila ({queued.length})</Text>
      {queued.length === 0 && <Text style={styles.muted}>A fila está vazia. Peça a primeira música!</Text>}
      {queued.map((item, i) => (
        <SongRow
          key={item.id}
          title={item.title}
          artist={item.artist}
          artworkUrl={item.artwork_url}
          detail={`${i + 1}º · pedida por ${requesterName(item)}`}
          onPress={isHost || item.requested_by === userId ? () => onPressItem(item) : undefined}
        />
      ))}

      {history.length > 0 && (
        <>
          <Text style={styles.subtitle}>Já tocaram</Text>
          {history.map((item) => (
            <SongRow
              key={item.id}
              title={item.title}
              artist={item.artist}
              artworkUrl={item.artwork_url}
              detail={`${item.status === 'skipped' ? 'Pulada' : 'Tocou'} · pedida por ${requesterName(item)}`}
            />
          ))}
        </>
      )}

      {isHost && !ended && <Button title="Encerrar festa" variant="danger" onPress={confirmEnd} />}
      {!isHost && <Button title="Sair da festa" variant="danger" onPress={confirmLeave} />}
    </ScrollView>
  );
}
