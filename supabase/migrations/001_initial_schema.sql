-- ============================================
-- NutriSports - Schema Inicial
-- ============================================

-- 1. Profiles (dados pessoais do usuario)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null default '',
  data_nascimento date,
  sexo text check (sexo in ('M', 'F')),
  objetivo text check (objetivo in ('performance', 'emagrecimento', 'manutencao', 'clinico')),
  condicoes_clinicas text[] default '{}',
  restricoes_alimentares text[] default '{}',
  nivel_atividade text check (nivel_atividade in ('sedentario', 'leve', 'moderado', 'intenso')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Measurements (historico de medidas corporais)
create table public.measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  data date not null default current_date,
  peso_kg numeric not null,
  altura_cm numeric not null,
  circ_abdominal_cm numeric,
  circ_coxa_cm numeric,
  circ_braco_cm numeric,
  circ_tornozelo_cm numeric,
  gordura_percentual numeric,
  created_at timestamptz default now()
);

-- 3. Training Plans (plano de treino importado)
create table public.training_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nome text not null default 'Meu Plano',
  arquivo_original_url text,
  dados_parseados jsonb default '[]',
  gasto_basal_kcal numeric,
  gasto_total_estimado jsonb default '{}',
  created_at timestamptz default now()
);

-- 4. Training Days (dias de treino extraidos da planilha)
create table public.training_days (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.training_plans(id) on delete cascade not null,
  dia_semana int not null check (dia_semana between 0 and 6),
  grupo_muscular text not null default '',
  exercicios jsonb default '[]',
  gasto_estimado_kcal numeric default 0,
  duracao_min int default 0,
  intensidade text check (intensidade in ('leve', 'moderada', 'intensa')),
  eh_descanso boolean default false
);

-- 5. Training Logs (registro diario: treinou ou nao)
create table public.training_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  data date not null default current_date,
  treinou boolean not null default false,
  training_plan_id uuid references public.training_plans(id) on delete set null,
  notas text,
  unique(user_id, data)
);

-- 6. Diet Plans (dietas geradas pela IA)
create table public.diet_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  semana_inicio date not null,
  dieta_treino jsonb not null default '[]',
  dieta_descanso jsonb not null default '[]',
  calorias_treino int,
  calorias_descanso int,
  prompt_usado text,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_measurements_user_data on public.measurements(user_id, data desc);
create index idx_training_logs_user_data on public.training_logs(user_id, data desc);
create index idx_diet_plans_user_semana on public.diet_plans(user_id, semana_inicio desc);
create index idx_training_days_plan on public.training_days(plan_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.measurements enable row level security;
alter table public.training_plans enable row level security;
alter table public.training_days enable row level security;
alter table public.training_logs enable row level security;
alter table public.diet_plans enable row level security;

-- Profiles: users can only CRUD their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Measurements: users can only CRUD their own measurements
create policy "Users can view own measurements"
  on public.measurements for select using (auth.uid() = user_id);
create policy "Users can insert own measurements"
  on public.measurements for insert with check (auth.uid() = user_id);
create policy "Users can delete own measurements"
  on public.measurements for delete using (auth.uid() = user_id);

-- Training Plans: users can only CRUD their own plans
create policy "Users can view own training plans"
  on public.training_plans for select using (auth.uid() = user_id);
create policy "Users can insert own training plans"
  on public.training_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own training plans"
  on public.training_plans for update using (auth.uid() = user_id);
create policy "Users can delete own training plans"
  on public.training_plans for delete using (auth.uid() = user_id);

-- Training Days: access via training plan ownership
create policy "Users can view own training days"
  on public.training_days for select
  using (exists (
    select 1 from public.training_plans
    where training_plans.id = training_days.plan_id
    and training_plans.user_id = auth.uid()
  ));
create policy "Users can insert own training days"
  on public.training_days for insert
  with check (exists (
    select 1 from public.training_plans
    where training_plans.id = training_days.plan_id
    and training_plans.user_id = auth.uid()
  ));
create policy "Users can delete own training days"
  on public.training_days for delete
  using (exists (
    select 1 from public.training_plans
    where training_plans.id = training_days.plan_id
    and training_plans.user_id = auth.uid()
  ));

-- Training Logs: users can only CRUD their own logs
create policy "Users can view own training logs"
  on public.training_logs for select using (auth.uid() = user_id);
create policy "Users can insert own training logs"
  on public.training_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own training logs"
  on public.training_logs for update using (auth.uid() = user_id);

-- Diet Plans: users can only CRUD their own diets
create policy "Users can view own diet plans"
  on public.diet_plans for select using (auth.uid() = user_id);
create policy "Users can insert own diet plans"
  on public.diet_plans for insert with check (auth.uid() = user_id);
create policy "Users can delete own diet plans"
  on public.diet_plans for delete using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
