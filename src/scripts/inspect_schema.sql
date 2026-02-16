SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'clients')
ORDER BY table_name, ordinal_position;
