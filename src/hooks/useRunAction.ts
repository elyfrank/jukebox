import { useCallback } from 'react';

import { showDialog } from '@/components/ui';
import { errorMessage } from '@/lib/errors';

// Executa uma ação no banco, recarrega a tela e mostra o erro num diálogo se falhar.
export function useRunAction(reload: () => Promise<unknown>) {
  return useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
        await reload();
      } catch (e) {
        showDialog('Erro', errorMessage(e));
      }
    },
    [reload],
  );
}
