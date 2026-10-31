import { StyleSheet, View, useWindowDimensions } from 'react-native';

import type { FloatingReaction } from '@/hooks/useReactions';

import { FloatingEmoji } from './FloatingEmoji';

type Props = { reactions: FloatingReaction[]; bottom: number; onDone: (id: number) => void };

// Camada por cima da tela da festa onde as reações sobem; não bloqueia toques.
export function ReactionOverlay({ reactions, bottom, onDone }: Props) {
  const { width } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom }]}>
      {reactions.map((r) => (
        <FloatingEmoji key={r.id} id={r.id} emoji={r.emoji} left={24 + r.x * (width - 80)} onDone={onDone} />
      ))}
    </View>
  );
}
