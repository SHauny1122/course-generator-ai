-- Create courses table
create table if not exists public.courses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    content text not null,
    lessons jsonb default '{}'::jsonb,
    shared boolean default false,
    share_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up RLS (Row Level Security)
alter table public.courses enable row level security;

-- Create policies
create policy "Users can view their own courses"
    on public.courses for select
    using (auth.uid() = user_id);

create policy "Users can insert their own courses"
    on public.courses for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own courses"
    on public.courses for update
    using (auth.uid() = user_id);

create policy "Users can delete their own courses"
    on public.courses for delete
    using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on public.courses
    for each row
    execute procedure public.handle_updated_at();
