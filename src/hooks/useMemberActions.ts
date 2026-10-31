import { showDialog, type DialogButton } from '@/components/ui';
import { removeMember, setMemberRole, type Member } from '@/lib/db';

import { useRunAction } from './useRunAction';

type Params = { partyId: string; userId: string; isHost: boolean; reload: () => Promise<unknown> };

// Ações de um host sobre as pessoas da festa: promover, rebaixar, remover ou deixar de ser host.
export function useMemberActions({ partyId, userId, isHost, reload }: Params) {
  const run = useRunAction(reload);
  const setRole = (m: Member, role: Member['role']) => run(() => setMemberRole(partyId, m.user_id, role));

  function confirmRemove(m: Member, name: string) {
    showDialog(`Remover ${name} da festa?`, 'A pessoa pode voltar depois com o código.', [
      { text: 'Remover', style: 'destructive', onPress: () => run(() => removeMember(partyId, m.user_id)) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function buttonsFor(m: Member, name: string): DialogButton[] {
    if (m.user_id === userId) {
      return m.role === 'host' ? [{ text: 'Deixar de ser DJ', onPress: () => setRole(m, 'guest') }] : [];
    }
    const roleButton: DialogButton =
      m.role === 'host'
        ? { text: 'Tirar de DJ', onPress: () => setRole(m, 'guest') }
        : { text: 'Tornar DJ', onPress: () => setRole(m, 'host') };
    return [roleButton, { text: 'Remover da festa', style: 'destructive', onPress: () => confirmRemove(m, name) }];
  }

  // Só hosts têm ações; convidados apenas veem a lista.
  function canPress(m: Member) {
    return isHost && (m.user_id !== userId || m.role === 'host');
  }

  function pressMember(m: Member) {
    const name = m.profile?.name ?? 'Esta pessoa';
    showDialog(name, m.role === 'host' ? 'DJ da festa' : 'Convidado', [
      ...buttonsFor(m, name),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return { canPress, pressMember };
}
