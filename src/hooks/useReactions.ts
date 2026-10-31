import { useCallback, useEffect, useRef, useState } from 'react';

import { connectReactions, type ReactionEmoji } from '@/lib/reactions';

export type FloatingReaction = { id: number; emoji: ReactionEmoji; x: number };

const MIN_INTERVAL_MS = 250; // evita que um toque nervoso inunde a festa de emojis
const MAX_ON_SCREEN = 30;

// Reações ao vivo da festa: envia emojis e mantém a lista dos que estão subindo na tela.
export function useReactions(partyId: string, enabled: boolean) {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const connection = useRef<ReturnType<typeof connectReactions> | null>(null);
  const lastSent = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const conn = connectReactions(partyId, (emoji) => {
      const reaction = { id: nextId.current++, emoji, x: Math.random() };
      setFloating((list) => [...list.slice(-(MAX_ON_SCREEN - 1)), reaction]);
    });
    connection.current = conn;
    return () => {
      conn.close();
      connection.current = null;
    };
  }, [partyId, enabled]);

  const send = useCallback((emoji: ReactionEmoji) => {
    const now = Date.now();
    if (now - lastSent.current < MIN_INTERVAL_MS) return;
    lastSent.current = now;
    connection.current?.send(emoji);
  }, []);

  const remove = useCallback((id: number) => setFloating((list) => list.filter((r) => r.id !== id)), []);

  return { floating, send, remove };
}
