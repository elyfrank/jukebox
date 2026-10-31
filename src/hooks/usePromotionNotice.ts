import { useEffect, useRef } from 'react';

import { showDialog } from '@/components/ui';

// Avisa o usuário quando ele vira host durante a festa (não avisa ao abrir a tela já sendo host).
export function usePromotionNotice(isHost: boolean, loaded: boolean) {
  const wasHost = useRef<boolean | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (wasHost.current === false && isHost) {
      showDialog('Você agora é host desta festa 🎧', 'Conecte seu celular no som e gerencie a fila com o seu player favorito.');
    }
    wasHost.current = isHost;
  }, [isHost, loaded]);
}
