-- Create storage bucket for publication images
INSERT INTO storage.buckets (id, name, public)
VALUES ('publication-images', 'publication-images', true);

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload their own publication images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'publication-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own publication images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'publication-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own publication images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'publication-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access (images are public)
CREATE POLICY "Publication images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'publication-images');