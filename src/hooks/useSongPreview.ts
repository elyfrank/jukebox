import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';

// Prévia de 30 s das músicas. Um único player: tocar outra música troca a que está tocando.
export function useSongPreview() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [currentId, setCurrentId] = useState<number | null>(null);

  function toggle(id: number, url: string) {
    if (currentId !== id) {
      player.replace(url);
      player.play();
      setCurrentId(id);
    } else if (status.playing) {
      player.pause();
    } else {
      // Recomeça se a prévia já tinha terminado.
      if (status.didJustFinish || status.currentTime >= status.duration - 0.5) player.seekTo(0);
      player.play();
    }
  }

  return {
    toggle,
    isPlaying: (id: number) => currentId === id && status.playing,
    isLoading: (id: number) => currentId === id && !status.isLoaded,
  };
}
