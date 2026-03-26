-- user_settings
create table user_settings (
  id             uuid primary key references auth.users on delete cascade,
  gemini_api_key text,
  school_name    text,
  grade          text,
  exam_date      date,
  created_at     timestamptz default now()
);
alter table user_settings enable row level security;
create policy "본인만" on user_settings using (id = auth.uid());

-- subjects
create table subjects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  name       text not null,
  teacher    text not null,
  color_hex  text not null default '#4A90D9',
  created_at timestamptz default now()
);
alter table subjects enable row level security;
create policy "본인만" on subjects using (user_id = auth.uid());

-- materials
create table materials (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid references subjects on delete cascade not null,
  title          text not null,
  type           text not null default 'pdf' check (type = 'pdf'),
  extracted_text text,
  summary        text,
  highlights     text[] default '{}',
  file_path      text,
  created_at     timestamptz default now()
);
alter table materials enable row level security;
create policy "본인만" on materials
  using (subject_id in (select id from subjects where user_id = auth.uid()));

-- quiz_sessions
create table quiz_sessions (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid references subjects on delete cascade not null,
  questions     jsonb not null default '[]',
  score_percent float check (score_percent between 0 and 100),
  completed_at  timestamptz,
  created_at    timestamptz default now()
);
alter table quiz_sessions enable row level security;
create policy "본인만" on quiz_sessions
  using (subject_id in (select id from subjects where user_id = auth.uid()));

-- plan_entries
create table plan_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  subject_name text not null,
  topic        text not null,
  date         date not null,
  completed    boolean not null default false,
  created_at   timestamptz default now()
);
alter table plan_entries enable row level security;
create policy "본인만" on plan_entries using (user_id = auth.uid());

-- Storage 버킷
insert into storage.buckets (id, name, public) values ('materials', 'materials', false);
create policy "본인만 업로드" on storage.objects for insert
  with check (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "본인만 조회" on storage.objects for select
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "본인만 삭제" on storage.objects for delete
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
