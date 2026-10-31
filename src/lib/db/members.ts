import { supabase } from '../supabase';

import type { Profile } from './profiles';

export type MemberRole = 'host' | 'guest';

export type Member = {
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile: Profile | null;
};

// Pessoas da festa em ordem de chegada.
export async function listMembers(partyId: string) {
  const { data, error } = await supabase
    .from('party_members')
    .select('user_id, role, joined_at, profile:profiles!party_members_user_id_fkey(name)')
    .eq('party_id', partyId)
    .order('joined_at');
  if (error) throw error;
  return data as unknown as Member[];
}

// Só hosts conseguem. O banco recusa se a festa ficaria sem host.
export async function setMemberRole(partyId: string, userId: string, role: MemberRole) {
  const { error } = await supabase.from('party_members').update({ role }).eq('party_id', partyId).eq('user_id', userId);
  if (error) throw error;
}

// Sair da festa (o próprio usuário) ou remover alguém (host). A pessoa pode voltar com o código.
export async function removeMember(partyId: string, userId: string) {
  const { error } = await supabase.from('party_members').delete().eq('party_id', partyId).eq('user_id', userId);
  if (error) throw error;
}
