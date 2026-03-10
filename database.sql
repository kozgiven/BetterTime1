-- Existing tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users on delete cascade,
  name TEXT,
  sleep_time TIME,
  wake_time TIME,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users on delete cascade,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  parent_task_id UUID REFERENCES public.tasks(id) on delete cascade,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users on delete cascade,
  task_id UUID REFERENCES public.tasks(id) on delete cascade,
  block_type TEXT NOT NULL, -- 'task', 'focus_buffer', 'sleep', 'class'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- New tables for 10x features
CREATE TABLE public.energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users on delete cascade,
  energy_level INTEGER NOT NULL, -- 1 to 5
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.calendar_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users on delete cascade,
  platform TEXT NOT NULL, -- 'google', 'outlook', 'ics'
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users on delete cascade,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.group_members (
  group_id UUID REFERENCES public.study_groups(id) on delete cascade,
  user_id UUID REFERENCES auth.users on delete cascade,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users on delete cascade,
  event_type TEXT NOT NULL, -- 'sleep', 'wake'
  actual_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own sleep logs." ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep logs." ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own tasks." ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks." ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks." ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks." ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedule blocks." ON public.schedule_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule blocks." ON public.schedule_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule blocks." ON public.schedule_blocks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own energy logs." ON public.energy_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy logs." ON public.energy_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar syncs." ON public.calendar_syncs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar syncs." ON public.calendar_syncs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study Groups Policies
CREATE POLICY "Anyone can view study groups." ON public.study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create study groups." ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update their study groups." ON public.study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Owners can delete their study groups." ON public.study_groups FOR DELETE USING (auth.uid() = created_by);

-- Group Members Policies
CREATE POLICY "Members can view study groups memberships." ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join groups." ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups." ON public.group_members FOR DELETE USING (auth.uid() = user_id);
