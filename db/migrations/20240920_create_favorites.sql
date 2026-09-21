-- CREATE FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('repository', 'developer')),
    target TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, type, target)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
