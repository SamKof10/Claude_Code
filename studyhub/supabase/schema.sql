-- StudyHub — relational schema
--
-- This mirrors src/lib/types.ts one-to-one (snake_case here, camelCase there).
-- The app currently runs entirely client-side against a Zustand store backed by
-- localStorage (src/lib/store/index.ts); that store's actions were written with
-- the same shape as the tables below so they can be swapped for Supabase
-- queries without reshaping the UI layer.
--
-- Apply with: supabase db execute --file supabase/schema.sql
-- (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────────────────
-- One row per auth.users row. Populated by the handle_new_user trigger below.
create table if not exists profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  name                 text        not null default '',
  email                text        not null default '',
  school               text        not null default '',
  grade                text        not null default '',
  school_year          text        not null default '',
  learning_goals       text[]      not null default '{}',
  preferred_study_time text        not null default 'evening'
                       check (preferred_study_time in ('morning','afternoon','evening','night')),
  onboarded            boolean     not null default false,
  streak_days          integer     not null default 0,
  last_active_date     timestamptz,
  ai_usage_used        integer     not null default 0,
  ai_usage_limit       integer     not null default 500,
  created_at           timestamptz not null default now()
);

-- ── Subjects ────────────────────────────────────────────────────────────
create table if not exists subjects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles(id) on delete cascade,
  name       text        not null,
  icon       text        not null default 'BookOpen',
  color      text        not null default 'subj-1'
             check (color in ('subj-1','subj-2','subj-3','subj-4','subj-5','subj-6','subj-7','subj-8')),
  created_at timestamptz not null default now()
);
create index if not exists subjects_user_idx on subjects(user_id);

-- ── Documents ───────────────────────────────────────────────────────────
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles(id) on delete cascade,
  subject_id  uuid        references subjects(id) on delete cascade,
  name        text        not null,
  file_type   text        not null check (file_type in ('pdf','docx','image','text')),
  storage_path text,      -- Supabase Storage object path for the original file
  upload_date timestamptz not null default now(),
  size_bytes  bigint      not null default 0,
  pages       integer,
  status      text        not null default 'processing'
              check (status in ('processing','ready','error')),
  tags        text[]      not null default '{}',
  content     text        not null default '',  -- extracted text, used as AI context
  summary     text,
  starred     boolean     not null default false
);
create index if not exists documents_user_idx    on documents(user_id);
create index if not exists documents_subject_idx on documents(subject_id);

-- ── Notes ───────────────────────────────────────────────────────────────
create table if not exists notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references profiles(id) on delete cascade,
  subject_id   uuid        references subjects(id) on delete set null,
  title        text        not null default '',
  content_html text        not null default '',
  tags         text[]      not null default '{}',
  pinned       boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists notes_user_idx on notes(user_id);

-- ── Flashcards ──────────────────────────────────────────────────────────
create table if not exists flashcard_decks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid        not null references profiles(id) on delete cascade,
  subject_id         uuid        references subjects(id) on delete cascade,
  name               text        not null,
  description        text        not null default '',
  source_document_id uuid        references documents(id) on delete set null,
  source_note_id     uuid        references notes(id) on delete set null,
  created_at         timestamptz not null default now()
);
create index if not exists decks_user_idx on flashcard_decks(user_id);

create table if not exists flashcards (
  id              uuid primary key default gen_random_uuid(),
  deck_id         uuid        not null references flashcard_decks(id) on delete cascade,
  front           text        not null,
  back            text        not null,
  correct_count   integer     not null default 0,
  incorrect_count integer     not null default 0,
  ease_factor     numeric     not null default 2.5,   -- SM-2 style, floor 1.3
  interval_days   numeric     not null default 0,
  next_review     timestamptz not null default now(),
  last_reviewed   timestamptz
);
create index if not exists flashcards_deck_idx on flashcards(deck_id);
create index if not exists flashcards_due_idx  on flashcards(next_review);

-- ── Quizzes ─────────────────────────────────────────────────────────────
create table if not exists quizzes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid        not null references profiles(id) on delete cascade,
  subject_id        uuid        references subjects(id) on delete set null,
  document_id       uuid        references documents(id) on delete set null,
  title             text        not null,
  topics            text[]      not null default '{}',
  difficulty        text        not null default 'medium'
                    check (difficulty in ('easy','medium','hard')),
  question_types    text[]      not null default '{}',
  time_limit_minutes integer,
  status            text        not null default 'draft'
                    check (status in ('draft','in-progress','completed')),
  answers           jsonb       not null default '{}'::jsonb,  -- { [question_id]: answer }
  score             integer,
  weak_topics       text[]      not null default '{}',
  created_at        timestamptz not null default now(),
  started_at        timestamptz,
  completed_at      timestamptz
);
create index if not exists quizzes_user_idx on quizzes(user_id);

create table if not exists quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid    not null references quizzes(id) on delete cascade,
  position       integer not null default 0,
  type           text    not null check (type in ('mcq','true-false','short-answer','fill-blank')),
  prompt         text    not null,
  options        text[],
  correct_answer text    not null,
  explanation    text    not null default '',
  topic          text    not null default '',
  difficulty     text    not null default 'medium'
);
create index if not exists quiz_questions_quiz_idx on quiz_questions(quiz_id, position);

-- ── Tasks ───────────────────────────────────────────────────────────────
create table if not exists tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid        not null references profiles(id) on delete cascade,
  subject_id        uuid        references subjects(id) on delete set null,
  title             text        not null,
  description       text        not null default '',
  deadline          timestamptz,
  priority          text        not null default 'medium' check (priority in ('low','medium','high')),
  status            text        not null default 'todo'   check (status in ('todo','in-progress','done')),
  estimated_minutes integer,
  recurring         text        check (recurring in ('daily','weekly','monthly')),
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);
create index if not exists tasks_user_idx     on tasks(user_id);
create index if not exists tasks_deadline_idx on tasks(deadline);

-- ── Exams & study plans ─────────────────────────────────────────────────
create table if not exists exams (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid        not null references profiles(id) on delete cascade,
  subject_id               uuid        not null references subjects(id) on delete cascade,
  title                    text        not null,
  date                     timestamptz not null,
  topics                   text[]      not null default '{}',
  current_level            text        not null default 'intermediate'
                           check (current_level in ('beginner','intermediate','advanced')),
  available_hours_per_week integer     not null default 3,
  created_at               timestamptz not null default now()
);
create index if not exists exams_user_idx on exams(user_id);

create table if not exists study_plan_weeks (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid        not null references exams(id) on delete cascade,
  week_number integer     not null,
  label       text        not null,
  start_date  timestamptz not null,
  end_date    timestamptz not null,
  topics      text[]      not null default '{}',
  focus       text        not null default '',
  done        boolean     not null default false,
  unique (exam_id, week_number)
);

-- ── Study sessions (drives every chart and the streak) ──────────────────
create table if not exists study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid        not null references profiles(id) on delete cascade,
  subject_id       uuid        references subjects(id) on delete set null,
  date             timestamptz not null default now(),
  duration_minutes integer     not null default 0,
  type             text        not null
                   check (type in ('flashcards','quiz','reading','notes','ai-tutor','document','focus')),
  related_id       uuid
);
create index if not exists sessions_user_date_idx on study_sessions(user_id, date desc);

-- ── AI Tutor ────────────────────────────────────────────────────────────
create table if not exists ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles(id) on delete cascade,
  subject_id  uuid        references subjects(id) on delete set null,
  document_id uuid        references documents(id) on delete set null,
  mode        text        not null default 'explain'
              check (mode in ('explain','socratic','exam','simplify','practice','review')),
  title       text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists conversations_user_idx on ai_conversations(user_id, updated_at desc);

create table if not exists ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid        not null references ai_conversations(id) on delete cascade,
  role            text        not null check (role in ('user','assistant')),
  content         text        not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx on ai_messages(conversation_id, created_at);

-- ── Row level security ──────────────────────────────────────────────────
-- Every table is private to its owner. Child tables (flashcards,
-- quiz_questions, study_plan_weeks, ai_messages) inherit ownership through
-- their parent.
alter table profiles          enable row level security;
alter table subjects          enable row level security;
alter table documents         enable row level security;
alter table notes             enable row level security;
alter table flashcard_decks   enable row level security;
alter table flashcards        enable row level security;
alter table quizzes           enable row level security;
alter table quiz_questions    enable row level security;
alter table tasks             enable row level security;
alter table exams             enable row level security;
alter table study_plan_weeks  enable row level security;
alter table study_sessions    enable row level security;
alter table ai_conversations  enable row level security;
alter table ai_messages       enable row level security;

create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'subjects','documents','notes','flashcard_decks','quizzes',
    'tasks','exams','study_sessions','ai_conversations'
  ] loop
    execute format(
      'create policy %I on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      'own_' || t, t
    );
  end loop;
end $$;

create policy own_flashcards on flashcards for all
  using (exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid()))
  with check (exists (select 1 from flashcard_decks d where d.id = deck_id and d.user_id = auth.uid()));

create policy own_quiz_questions on quiz_questions for all
  using (exists (select 1 from quizzes q where q.id = quiz_id and q.user_id = auth.uid()))
  with check (exists (select 1 from quizzes q where q.id = quiz_id and q.user_id = auth.uid()));

create policy own_study_plan_weeks on study_plan_weeks for all
  using (exists (select 1 from exams e where e.id = exam_id and e.user_id = auth.uid()))
  with check (exists (select 1 from exams e where e.id = exam_id and e.user_id = auth.uid()));

create policy own_ai_messages on ai_messages for all
  using (exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- ── Create a profile row on signup ──────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, coalesce(new.email, ''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
