-- A função do trigger de cadastro não deve ser chamável pela API (/rest/v1/rpc).
-- O trigger continua funcionando, pois roda com os privilégios do dono da função.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
