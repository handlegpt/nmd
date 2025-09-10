-- Test creating storage bucket and policies
-- This will help us identify if the issue is in storage setup

-- Test 1: Create Supabase Storage bucket for place photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

SELECT 'Storage bucket created successfully' as status;

-- Test 2: Create RLS policy for public read access
CREATE POLICY "Public read access for place photos" ON storage.objects
FOR SELECT USING (bucket_id = 'place-photos');

SELECT 'Public read policy created successfully' as status;

-- Test 3: Create RLS policy for authenticated upload
CREATE POLICY "Authenticated users can upload place photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'place-photos' 
  AND auth.role() = 'authenticated'
);

SELECT 'Authenticated upload policy created successfully' as status;

-- Test 4: Create RLS policy for user update
CREATE POLICY "Users can update their own place photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'place-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

SELECT 'User update policy created successfully' as status;

-- Test 5: Create RLS policy for user delete
CREATE POLICY "Users can delete their own place photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'place-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

SELECT 'User delete policy created successfully' as status;

-- Final status
SELECT 'All storage policies created successfully' as final_status;
