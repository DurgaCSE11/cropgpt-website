-- Supabase Database Schema for CropGPT

-- 1. PROFILES TABLE (Linked to Auth.Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    farmer_scale TEXT NOT NULL CHECK (farmer_scale IN ('small', 'medium', 'large')),
    address TEXT NOT NULL,
    pincode TEXT NOT NULL CHECK (pincode ~ '^\d{6}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to insert/update their own profile" 
    ON public.profiles FOR ALL USING (auth.uid() = id);


-- 2. TRANSACTIONS TABLE
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own transactions" 
    ON public.transactions FOR ALL USING (auth.uid() = user_id);


-- 3. FORUM_POSTS TABLE
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for forum posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow everyone to read forum posts" 
    ON public.forum_posts FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum posts" 
    ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update/delete their own posts" 
    ON public.forum_posts FOR ALL USING (auth.uid() = user_id);


-- 4. FORUM_ANSWERS TABLE
CREATE TABLE public.forum_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for forum answers
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow everyone to read forum answers" 
    ON public.forum_answers FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create forum answers" 
    ON public.forum_answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update/delete their own answers" 
    ON public.forum_answers FOR ALL USING (auth.uid() = user_id);


-- 5. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view/manage their own notifications" 
    ON public.notifications FOR ALL USING (auth.uid() = user_id);


-- PROFILE AUTO-CREATION TRIGGER (Optional helper, but it's better to manage via frontend Auth registration)
-- We can sync user meta directly on sign up, but if we need auth trigger:
-- Note: Supabase custom sign-up metadata can also be handled on client side.
