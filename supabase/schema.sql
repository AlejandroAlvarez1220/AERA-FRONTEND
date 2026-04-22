create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_user_id()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    raise exception 'Authenticated user required';
  end if;

  if new.user_id is null then
    new.user_id = auth.uid();
  end if;

  if new.user_id <> auth.uid() then
    raise exception 'User mismatch';
  end if;

  return new;
end;
$$;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stock numeric(14, 3) not null default 0 check (stock >= 0),
  unit text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  quantity_required numeric(14, 3) not null check (quantity_required > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (product_id, material_id)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  quantity numeric(14, 3) not null check (quantity > 0),
  cost numeric(12, 2) not null check (cost >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(12, 2) not null check (total >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_materials_user_id on public.materials(user_id);
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_product_materials_user_id on public.product_materials(user_id);
create index if not exists idx_product_materials_product_id on public.product_materials(product_id);
create index if not exists idx_product_materials_material_id on public.product_materials(material_id);
create index if not exists idx_purchases_user_id on public.purchases(user_id);
create index if not exists idx_purchases_material_id on public.purchases(material_id);
create index if not exists idx_sales_user_id on public.sales(user_id);
create index if not exists idx_sale_items_user_id on public.sale_items(user_id);
create index if not exists idx_sale_items_sale_id on public.sale_items(sale_id);
create index if not exists idx_sale_items_product_id on public.sale_items(product_id);

drop trigger if exists trg_products_set_updated_at on public.products;
create trigger trg_products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists trg_materials_set_user_id on public.materials;
create trigger trg_materials_set_user_id
before insert on public.materials
for each row
execute function public.set_user_id();

drop trigger if exists trg_products_set_user_id on public.products;
create trigger trg_products_set_user_id
before insert on public.products
for each row
execute function public.set_user_id();

drop trigger if exists trg_product_materials_set_user_id on public.product_materials;
create trigger trg_product_materials_set_user_id
before insert on public.product_materials
for each row
execute function public.set_user_id();

drop trigger if exists trg_purchases_set_user_id on public.purchases;
create trigger trg_purchases_set_user_id
before insert on public.purchases
for each row
execute function public.set_user_id();

drop trigger if exists trg_sales_set_user_id on public.sales;
create trigger trg_sales_set_user_id
before insert on public.sales
for each row
execute function public.set_user_id();

drop trigger if exists trg_sale_items_set_user_id on public.sale_items;
create trigger trg_sale_items_set_user_id
before insert on public.sale_items
for each row
execute function public.set_user_id();

alter table public.materials enable row level security;
alter table public.products enable row level security;
alter table public.product_materials enable row level security;
alter table public.purchases enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "materials_select_own" on public.materials;
drop policy if exists "materials_insert_own" on public.materials;
drop policy if exists "materials_update_own" on public.materials;
drop policy if exists "materials_delete_own" on public.materials;

create policy "materials_select_own" on public.materials
for select using (auth.uid() = user_id);

create policy "materials_insert_own" on public.materials
for insert with check (auth.uid() = user_id);

create policy "materials_update_own" on public.materials
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "materials_delete_own" on public.materials
for delete using (auth.uid() = user_id);

drop policy if exists "products_select_own" on public.products;
drop policy if exists "products_insert_own" on public.products;
drop policy if exists "products_update_own" on public.products;
drop policy if exists "products_delete_own" on public.products;

create policy "products_select_own" on public.products
for select using (auth.uid() = user_id);

create policy "products_insert_own" on public.products
for insert with check (auth.uid() = user_id);

create policy "products_update_own" on public.products
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "products_delete_own" on public.products
for delete using (auth.uid() = user_id);

drop policy if exists "product_materials_select_own" on public.product_materials;
drop policy if exists "product_materials_insert_own" on public.product_materials;
drop policy if exists "product_materials_update_own" on public.product_materials;
drop policy if exists "product_materials_delete_own" on public.product_materials;

create policy "product_materials_select_own" on public.product_materials
for select using (auth.uid() = user_id);

create policy "product_materials_insert_own" on public.product_materials
for insert with check (auth.uid() = user_id);

create policy "product_materials_update_own" on public.product_materials
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "product_materials_delete_own" on public.product_materials
for delete using (auth.uid() = user_id);

drop policy if exists "purchases_select_own" on public.purchases;
drop policy if exists "purchases_insert_own" on public.purchases;
drop policy if exists "purchases_update_own" on public.purchases;
drop policy if exists "purchases_delete_own" on public.purchases;

create policy "purchases_select_own" on public.purchases
for select using (auth.uid() = user_id);

create policy "purchases_insert_own" on public.purchases
for insert with check (auth.uid() = user_id);

create policy "purchases_update_own" on public.purchases
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "purchases_delete_own" on public.purchases
for delete using (auth.uid() = user_id);

drop policy if exists "sales_select_own" on public.sales;
drop policy if exists "sales_insert_own" on public.sales;
drop policy if exists "sales_update_own" on public.sales;
drop policy if exists "sales_delete_own" on public.sales;

create policy "sales_select_own" on public.sales
for select using (auth.uid() = user_id);

create policy "sales_insert_own" on public.sales
for insert with check (auth.uid() = user_id);

create policy "sales_update_own" on public.sales
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sales_delete_own" on public.sales
for delete using (auth.uid() = user_id);

drop policy if exists "sale_items_select_own" on public.sale_items;
drop policy if exists "sale_items_insert_own" on public.sale_items;
drop policy if exists "sale_items_update_own" on public.sale_items;
drop policy if exists "sale_items_delete_own" on public.sale_items;

create policy "sale_items_select_own" on public.sale_items
for select using (auth.uid() = user_id);

create policy "sale_items_insert_own" on public.sale_items
for insert with check (auth.uid() = user_id);

create policy "sale_items_update_own" on public.sale_items
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sale_items_delete_own" on public.sale_items
for delete using (auth.uid() = user_id);

create or replace function public.create_sale_with_consumption(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_sale_id uuid;
  v_total numeric(12, 2) := 0;
  v_missing_bom_count integer := 0;
  v_shortage_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authenticated user required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one sale item is required';
  end if;

  with parsed_items as (
    select
      (item ->> 'product_id')::uuid as product_id,
      (item ->> 'quantity')::integer as quantity,
      (item ->> 'price')::numeric(12, 2) as price
    from jsonb_array_elements(p_items) as item
  )
  select coalesce(sum(quantity * price), 0)
  into v_total
  from parsed_items;

  with parsed_items as (
    select
      (item ->> 'product_id')::uuid as product_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  )
  select count(*)
  into v_missing_bom_count
  from (
    select pi.product_id
    from parsed_items pi
    left join public.product_materials pm
      on pm.product_id = pi.product_id
      and pm.user_id = v_user_id
    group by pi.product_id
    having count(pm.id) = 0
  ) missing_bom;

  if v_missing_bom_count > 0 then
    raise exception 'Each sold product must have a material composition';
  end if;

  with parsed_items as (
    select
      (item ->> 'product_id')::uuid as product_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  ),
  material_usage as (
    select
      pm.material_id,
      sum(pm.quantity_required * pi.quantity) as required_quantity
    from parsed_items pi
    join public.product_materials pm
      on pm.product_id = pi.product_id
      and pm.user_id = v_user_id
    group by pm.material_id
  )
  select count(*)
  into v_shortage_count
  from material_usage mu
  join public.materials m on m.id = mu.material_id
  where m.user_id = v_user_id
    and m.stock < mu.required_quantity;

  if v_shortage_count > 0 then
    raise exception 'Insufficient materials';
  end if;

  insert into public.sales (user_id, total)
  values (v_user_id, v_total)
  returning id into v_sale_id;

  insert into public.sale_items (sale_id, product_id, quantity, price, user_id)
  select
    v_sale_id,
    (item ->> 'product_id')::uuid,
    (item ->> 'quantity')::integer,
    (item ->> 'price')::numeric(12, 2),
    v_user_id
  from jsonb_array_elements(p_items) as item;

  with parsed_items as (
    select
      (item ->> 'product_id')::uuid as product_id,
      (item ->> 'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  ),
  material_usage as (
    select
      pm.material_id,
      sum(pm.quantity_required * pi.quantity) as required_quantity
    from parsed_items pi
    join public.product_materials pm
      on pm.product_id = pi.product_id
      and pm.user_id = v_user_id
    group by pm.material_id
  )
  update public.materials m
  set stock = m.stock - mu.required_quantity
  from material_usage mu
  where m.id = mu.material_id
    and m.user_id = v_user_id;

  return v_sale_id;
end;
$$;

grant execute on function public.create_sale_with_consumption(jsonb) to authenticated;
