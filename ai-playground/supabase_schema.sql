-- Content Generation History Table
-- This table stores the history of all AI content generations

CREATE TABLE IF NOT EXISTS public.content_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'conversation', 'image', 'document', 'url'
    input_data JSONB NOT NULL, -- Store input prompt/data
    output_data TEXT NOT NULL, -- Store generated output
    file_info JSONB, -- For document analysis: {name, type, size}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id and created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_content_history_user_created 
ON public.content_history(user_id, created_at DESC);

-- Create index on content_type for filtering
CREATE INDEX IF NOT EXISTS idx_content_history_type 
ON public.content_history(content_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own content history
CREATE POLICY "Users can view their own content history" ON public.content_history
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own content history
CREATE POLICY "Users can insert their own content history" ON public.content_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own content history
CREATE POLICY "Users can update their own content history" ON public.content_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own content history
CREATE POLICY "Users can delete their own content history" ON public.content_history
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_content_history_updated_at
    BEFORE UPDATE ON public.content_history
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.content_history TO authenticated;
GRANT ALL ON public.content_history TO service_role;
