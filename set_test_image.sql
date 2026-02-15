UPDATE services 
SET image_url = 'https://placehold.co/600x400/orange/white?text=Service+Test' 
WHERE id = (SELECT id FROM services ORDER BY created_at LIMIT 1);
