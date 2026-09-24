-- ADD github_access_token COLUMN TO USERS TABLE
-- This column stores the encrypted GitHub OAuth access token for authenticated user API calls

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'github_access_token'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN github_access_token TEXT;

        COMMENT ON COLUMN public.users.github_access_token IS 'Encrypted GitHub OAuth access token for user-specific API calls';
    END IF;
END $$;