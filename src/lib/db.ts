import { supabase } from './supabase';

export type Profile = { name: string };

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('name').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateName(userId: string, name: string) {
  const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', userId);
  if (error) throw error;
}
