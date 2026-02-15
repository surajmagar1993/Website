ALTER TABLE services 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the first service again to verify
UPDATE services 
SET image_url = 'https://placehold.co/600x400/orange/white?text=Service+Test' 
WHERE id = (SELECT id FROM services ORDER BY created_at LIMIT 1);
