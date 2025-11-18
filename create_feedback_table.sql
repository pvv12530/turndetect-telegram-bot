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

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own feedback (optional - adjust based on your needs)
CREATE POLICY "Users can view their own feedback"
    ON public.feedback
    FOR SELECT
    USING (auth.uid()::text = (SELECT telegram_id::text FROM public.users WHERE id = user_id));

-- Policy: Users can insert their own feedback (optional - adjust based on your needs)
-- Note: This assumes you have a way to authenticate users via telegram_id
-- If using service role key in your bot, you may not need RLS policies
-- You can comment out or delete the RLS policies if using service role key

-- Grant necessary permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
-- GRANT USAGE, SELECT ON SEQUENCE public.feedback_id_seq TO authenticated;

