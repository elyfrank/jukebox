import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

const DURATION_MS = 2600;
const RISE = 420;

type Props = { id: number; emoji: string; left: number; onDone: (id: number) => void };

// Um emoji que sobe balançando e some (animação na thread nativa).
export function FloatingEmoji({ id, emoji, left, onDone }: Props) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => onDone(id));
  }, [progress, id, onDone]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -RISE] });
  const translateX = progress.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 12, -10, 8, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.4, 1.3, 1] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        bottom: 0,
        left,
        fontSize: 34,
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}
