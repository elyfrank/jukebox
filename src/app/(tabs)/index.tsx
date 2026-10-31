import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyParties, Greeting, QuickActions } from '@/components/home';
import { PartyCard } from '@/components/party';
import { SectionLabel } from '@/components/ui';
import { useFirstName } from '@/hooks/useFirstName';
import { useMyParties } from '@/hooks/useMyParties';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function HomeScreen() {
  const userId = useAuth().session!.user.id;
  const { colors, styles } = useTheme();
  const insets = useSafeAreaInsets();
  const firstName = useFirstName(userId);
  const { parties, error, refreshing, refresh } = useMyParties(userId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, gap: 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
    >
      <Greeting name={firstName} />
      <QuickActions onCreate={() => router.push('/create-party')} onJoin={() => router.push('/join')} />

      {!!error && <Text style={styles.error}>{error}</Text>}

      {parties && (
        <View style={{ gap: 8 }}>
          <SectionLabel>{`SUAS FESTAS${parties.length ? ` (${parties.length})` : ''}`}</SectionLabel>
          {parties.length === 0 && <EmptyParties />}
          {parties.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              nowPlaying={p.nowPlaying}
              onPress={() => router.push({ pathname: '/party/[id]', params: { id: p.id } })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
