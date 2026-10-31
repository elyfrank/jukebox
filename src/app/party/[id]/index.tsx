import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HostControls,
  NowPlaying,
  PartyEndedBanner,
  PartyHeaderActions,
  QueueList,
  RemovedNotice,
  RequestSongButton,
} from '@/components/party';
import { Segmented } from '@/components/ui';
import { useParty } from '@/hooks/useParty';
import { usePartyMenu } from '@/hooks/usePartyMenu';
import { usePromotionNotice } from '@/hooks/usePromotionNotice';
import { useQueueActions } from '@/hooks/useQueueActions';
import { useAuth } from '@/lib/auth';
import type { QueueItem } from '@/lib/db';
import { useTheme } from '@/lib/theme';

type Tab = 'queue' | 'history';

export default function PartyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuth().session!.user.id;
  const { styles } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('queue');
  const { party, members, removed, isHost, error, refreshing, refresh, reload, playing, queued, history } = useParty(
    id,
    userId,
  );
  usePromotionNotice(isHost, !!party);
  const actions = useQueueActions({ isHost, userId, playing, queued, reload });
  const { openMenu } = usePartyMenu({ party, isHost, userId, reload });

  if (removed) return <RemovedNotice />;
  if (!party) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Stack.Screen options={{ title: 'Festa' }} />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  const open = !party.ended_at;
  const requesterName = (item: QueueItem) =>
    item.requested_by === userId ? 'você' : (item.requester?.name ?? 'alguém');
  const goTo = (pathname: '/party/[id]/invite' | '/party/[id]/search' | '/party/[id]/members') =>
    router.push({ pathname, params: { id: party.id } });

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: party.name,
          headerRight: () => (
            <PartyHeaderActions
              members={members.length}
              onMembers={() => goTo('/party/[id]/members')}
              onInvite={open ? () => goTo('/party/[id]/invite') : undefined}
              onMenu={openMenu}
            />
          ),
        }}
      />

      {/* Parte fixa: o que está tocando + abas. Só a lista abaixo rola. */}
      <View style={[styles.content, { paddingBottom: 8 }]}>
        {!open && <PartyEndedBanner />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <NowPlaying
          playing={playing}
          requesterName={requesterName}
          emptyHint={isHost && queued.length > 0 ? 'Nada tocando. Toque em "Tocar a primeira".' : 'Nada tocando no momento.'}
        />
        {isHost && open && <HostControls playing={playing} hasQueue={queued.length > 0} onNext={actions.playNext} />}
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'queue', label: `Fila (${queued.length})` },
            { value: 'history', label: `Já tocaram (${history.length})` },
          ]}
        />
      </View>

      {tab === 'queue' ? (
        <QueueList
          items={queued}
          detail={(item, i) => `${i + 1}º · pedida por ${requesterName(item)}`}
          onPressItem={(item) => (open && actions.canPress(item) ? () => actions.pressQueued(item) : undefined)}
          hint={open && queued.length > 0 ? queueHint(isHost) : undefined}
          emptyText="A fila está vazia. Peça a primeira música!"
          refreshing={refreshing}
          onRefresh={refresh}
          bottomSpace={(open ? 96 : 16) + insets.bottom}
        />
      ) : (
        <QueueList
          items={history}
          detail={(item) => `${item.status === 'skipped' ? 'Pulada' : 'Tocou'} · pedida por ${requesterName(item)}`}
          emptyText="Nenhuma música tocou ainda."
          refreshing={refreshing}
          onRefresh={refresh}
          bottomSpace={16 + insets.bottom}
        />
      )}

      {open && <RequestSongButton onPress={() => goTo('/party/[id]/search')} bottom={16 + insets.bottom} />}
    </View>
  );
}

function queueHint(isHost: boolean) {
  return isHost ? 'Toque numa música para tocar ou pular.' : 'Toque numa música sua para tirar da fila.';
}
