-- Quick setup for content_history table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.content_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    output_data TEXT NOT NULL,
    file_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own content history" ON public.content_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content history" ON public.content_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content history" ON public.content_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content history" ON public.content_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_history_user_created 
ON public.content_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_history_type 
ON public.content_history(content_type);

-- Grant permissions
GRANT ALL ON public.content_history TO authenticated;
GRANT ALL ON public.content_history TO service_role;
