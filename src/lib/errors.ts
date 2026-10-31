// Mensagem de erro legível a partir do que o Supabase (ou outra API) devolve.
export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : ((e as { message?: string })?.message ?? 'Algo deu errado');
}
