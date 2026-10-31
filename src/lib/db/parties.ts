import { supabase } from '../supabase';

import type { Profile } from './profiles';
import type { MemberRole } from './members';

export type Party = {
  id: string;
  name: string;
  code: string;
  host_id: string; // quem criou a festa (não dá permissão; quem manda são os hosts em party_members)
  created_at: string;
  ended_at: string | null;
  creator: Profile | null;
};

export type MyParty = Party & { role: MemberRole; memberCount: number };

// parties e profiles se ligam por mais de um caminho (criador, membros, fila); "!fkey" diz qual usar.
const partyColumns = 'id, name, code, host_id, created_at, ended_at, creator:profiles!parties_host_id_fkey(name)';

type MyPartyRow = { role: MemberRole; party: Party & { members: { count: number }[] } };

// Festas abertas das quais o usuário é membro, com o papel dele e o nº de pessoas em cada uma.
export async function listMyParties(userId: string) {
  const { data, error } = await supabase
    .from('party_members')
    .select(`role, party:parties!inner(${partyColumns}, members:party_members(count))`)
    .eq('user_id', userId)
    .is('party.ended_at', null);
  if (error) throw error;
  return (data as unknown as MyPartyRow[])
    .map(({ role, party: { members, ...party } }): MyParty => ({ ...party, role, memberCount: members[0]?.count ?? 0 }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// null quando o usuário não enxerga a festa (ex.: foi removido dela).
export async function getParty(id: string) {
  const { data, error } = await supabase.from('parties').select(partyColumns).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown as Party | null;
}

// O código de convite e a entrada de quem criou como host são gerados pelo banco.
export async function createParty(name: string) {
  const { data, error } = await supabase.from('parties').insert({ name: name.trim() }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function joinParty(code: string) {
  const { data, error } = await supabase.rpc('join_party', { p_code: code });
  if (error) throw error;
  return data as string;
}

// Qualquer host pode encerrar (regra no banco).
export async function endParty(id: string) {
  const { error } = await supabase.from('parties').update({ ended_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
