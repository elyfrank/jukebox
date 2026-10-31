import { useEffect, useState } from 'react';

import { getProfile } from '@/lib/db';

// Primeiro nome do usuário, para saudações ("Oi, Ely").
export function useFirstName(userId: string) {
  const [name, setName] = useState('');

  useEffect(() => {
    getProfile(userId)
      .then((p) => setName(p.name.trim().split(/\s+/)[0] ?? ''))
      .catch(() => setName(''));
  }, [userId]);

  return name;
}
