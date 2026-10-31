import { supabase } from './supabase';

export const REACTION_EMOJIS = ['🔥', '❤️', '🙌', '😂', '💃'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

const isReaction = (value: unknown): value is ReactionEmoji => REACTION_EMOJIS.includes(value as ReactionEmoji);

// Canal privado de reações da festa (Broadcast do Realtime; nada é salvo). As regras da migração 006
// só deixam membros da festa enviar e receber. self: true para quem envia também ver a própria reação.
export function connectReactions(partyId: string, onReaction: (emoji: ReactionEmoji) => void) {
  const channel = supabase
    .channel(`reactions:${partyId}`, { config: { private: true, broadcast: { self: true } } })
    .on('broadcast', { event: 'reaction' }, (message) => {
      const emoji = (message.payload as { emoji?: unknown })?.emoji;
      if (isReaction(emoji)) onReaction(emoji);
    })
    .subscribe();

  return {
    send: (emoji: ReactionEmoji) => channel.send({ type: 'broadcast', event: 'reaction', payload: { emoji } }),
    close: () => {
      supabase.removeChannel(channel);
    },
  };
}
