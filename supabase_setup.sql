-- Create issues table
CREATE TABLE public.issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('waste', 'roads', 'streetlights', 'water', 'other')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'inProgress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    photo_url TEXT,
    voice_note_url TEXT,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    assigned_to TEXT,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    before_photo_url TEXT,
    after_photo_url TEXT
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    issue_id UUID REFERENCES public.issues(id),
    type TEXT NOT NULL CHECK (type IN ('status_update', 'assignment', 'resolution')),
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_hi TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES public.issues(id),
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policies for issues
CREATE POLICY "Anyone can view issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create issues" ON public.issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own issues" ON public.issues FOR UPDATE USING (user_email = auth.jwt() ->> 'email');

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Policies for feedback
CREATE POLICY "Anyone can view feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();