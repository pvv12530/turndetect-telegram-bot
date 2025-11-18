-- Simple version for feedback table (if using service role key, RLS not needed)
-- Use this version if your bot uses service role key for database access

-- Create feedback table for storing user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('good', 'bad')),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT feedback_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE
);

-- Create index on user_id for faster queries when fetching feedback by user
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Create index on created_at for faster sorting and filtering by date
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Note: RLS (Row Level Security) is disabled by default
-- If you need RLS, use the create_feedback_table.sql file instead

