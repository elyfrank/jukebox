import { router } from 'expo-router';

import { showDialog, type DialogButton } from '@/components/ui';
import { endParty, removeMember, type Party } from '@/lib/db';

import { useRunAction } from './useRunAction';

type Params = { party: Party | null; isHost: boolean; userId: string; reload: () => Promise<unknown> };

// Menu "⋮" da festa: hosts encerram a festa; todos podem sair (o último host precisa promover alguém antes).
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
        onPress: () => run(() => removeMember(p.id, userId).then(() => router.back())),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function openMenu() {
    if (!party) return;
    const buttons: DialogButton[] = [];
    if (isHost) buttons.push({ text: 'Encerrar festa', style: 'destructive', onPress: () => confirmEnd(party) });
    buttons.push({ text: 'Sair da festa', style: 'destructive', onPress: () => confirmLeave(party) });
    buttons.push({ text: 'Fechar', style: 'cancel' });
    showDialog(party.name, `Código ${party.code} · criada por ${party.creator?.name ?? '—'}`, buttons);
  }

  return { openMenu };
}
