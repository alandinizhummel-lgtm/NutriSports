-- ============================================
-- NutriSports - Anamnese Nutricional
-- ============================================

create table public.anamneses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  nivel text not null check (nivel in ('basico', 'intermediario', 'ironman')),

  -- BASICO
  objetivo_detalhado text default '',
  historico_peso text default '',
  doencas text[] default '{}',
  outras_doencas text default '',
  usa_medicacao boolean default false,
  medicacoes text default '',
  refeicoes_por_dia int default 3,
  horario_primeira_refeicao text default '07:00',
  horario_ultima_refeicao text default '20:00',
  consumo_agua_litros numeric default 2,
  consome_alcool text default 'nunca',
  alergias_alimentares text[] default '{}',
  intolerancia_lactose boolean default false,
  intolerancia_gluten boolean default false,
  vegetariano_vegano text default 'nenhum',

  -- INTERMEDIARIO
  suplementos text[] default '{}',
  usa_suplemento boolean default false,
  horario_treino text default '',
  come_antes_treino boolean default false,
  come_apos_treino boolean default false,
  horas_sono numeric default 7,
  qualidade_sono text default 'regular',
  nivel_estresse text default 'medio',
  funcionamento_intestinal text default 'regular',
  alimentos_que_gosta text default '',
  alimentos_que_nao_gosta text default '',
  cozinha_propria boolean default true,
  tempo_preparo_refeicao text default 'medio',
  orcamento_alimentacao text default 'moderado',

  -- IRONMAN
  tempo_treino_anos numeric default 0,
  lesoes_anteriores text default '',
  objetivo_competicao text default '',
  frequencia_treino_semanal int default 0,
  tipo_periodizacao text default '',
  ja_fez_bioimpedancia boolean default false,
  percentual_gordura_conhecido numeric,
  meta_percentual_gordura numeric,
  ja_fez_dieta_antes boolean default false,
  tipo_dieta_anterior text default '',
  resultado_dieta_anterior text default '',
  ultimo_exame_sangue text default '',
  glicose_jejum numeric,
  colesterol_total numeric,
  triglicerideos numeric,
  hemoglobina numeric,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.anamneses enable row level security;

create policy "Users can view own anamnese"
  on public.anamneses for select using (auth.uid() = user_id);
create policy "Users can insert own anamnese"
  on public.anamneses for insert with check (auth.uid() = user_id);
create policy "Users can update own anamnese"
  on public.anamneses for update using (auth.uid() = user_id);
