import { router } from 'expo-router';

import { showDialog } from '@/components/ui';
import { endParty, leaveParty, type Party } from '@/lib/db';

import { useRunAction } from './useRunAction';

type Params = { party: Party | null; isHost: boolean; userId: string; reload: () => Promise<unknown> };

// Menu "⋮" da festa: o host encerra a festa, o convidado sai dela.
export function usePartyMenu({ party, isHost, userId, reload }: Params) {
  const run = useRunAction(reload);

  function confirmEnd(p: Party) {
    showDialog('Encerrar a festa?', 'Ninguém mais poderá entrar nem pedir músicas.', [
      { text: 'Encerrar', style: 'destructive', onPress: () => run(() => endParty(p.id)) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function confirmLeave(p: Party) {
    showDialog('Sair da festa?', 'Você pode voltar depois com o código.', [
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => run(() => leaveParty(p.id, userId).then(() => router.back())),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function openMenu() {
    if (!party) return;
    showDialog(party.name, isHost ? `Código ${party.code}` : `Host: ${party.host?.name ?? '—'}`, [
      isHost
        ? { text: 'Encerrar festa', style: 'destructive', onPress: () => confirmEnd(party) }
        : { text: 'Sair da festa', style: 'destructive', onPress: () => confirmLeave(party) },
      { text: 'Fechar', style: 'cancel' },
    ]);
  }

  return { openMenu };
}
