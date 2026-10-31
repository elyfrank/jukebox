import { Stack, useLocalSearchParams } from 'expo-router';
import { SectionList, Text } from 'react-native';

import { MemberRow, RemovedNotice } from '@/components/party';
import { SectionLabel } from '@/components/ui';
import { useMemberActions } from '@/hooks/useMemberActions';
import { useParty } from '@/hooks/useParty';
import { useAuth } from '@/lib/auth';
import type { Member, Party } from '@/lib/db';
import { useTheme } from '@/lib/theme';

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuth().session!.user.id;
  const { styles } = useTheme();
  const { party, members, removed, isHost, error, reload } = useParty(id, userId);
  const actions = useMemberActions({ partyId: id, userId, isHost, reload });

  if (removed) return <RemovedNotice />;

  const hosts = members.filter((m) => m.role === 'host');
  const guests = members.filter((m) => m.role === 'guest');
  const tags = (m: Member) => memberTags(m, userId, party);

  return (
    <>
      <Stack.Screen options={{ title: `Pessoas (${members.length})` }} />
      <SectionList
        style={styles.screen}
        contentContainerStyle={[styles.content, { gap: 8 }]}
        sections={[
          { title: `DJS (${hosts.length})`, data: hosts },
          { title: `CONVIDADOS (${guests.length})`, data: guests },
        ]}
        keyExtractor={(m) => m.user_id}
        ListHeaderComponent={
          <Text style={styles.muted}>
            {isHost
              ? 'Toque numa pessoa para tornar DJ, tirar de DJ ou remover da festa.'
              : 'Os DJs controlam a fila e o que toca.'}
            {error ? `\n${error}` : ''}
          </Text>
        }
        renderSectionHeader={({ section }) => <SectionLabel>{section.title}</SectionLabel>}
        renderItem={({ item }) => (
          <MemberRow
            name={item.profile?.name ?? '—'}
            tags={tags(item)}
            isHost={item.role === 'host'}
            onPress={actions.canPress(item) ? () => actions.pressMember(item) : undefined}
          />
        )}
      />
    </>
  );
}

function memberTags(m: Member, userId: string, party: Party | null) {
  const tags: string[] = [];
  if (m.user_id === userId) tags.push('você');
  if (m.user_id === party?.host_id) tags.push('criou a festa');
  return tags;
}
