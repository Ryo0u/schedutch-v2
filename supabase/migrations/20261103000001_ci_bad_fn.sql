create or replace function public.bad_fn() returns int language plpgsql as $$
begin
  return (select no_such_column from public.events limit 1);
end;
$$;
