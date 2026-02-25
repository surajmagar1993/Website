-- Check counts of products for the client
DO $$
DECLARE
    v_client_id uuid;
    v_count integer;
BEGIN
    SELECT id INTO v_client_id FROM public.profiles WHERE email = 'client@test.com';
    
    SELECT count(*) INTO v_count 
    FROM public.products 
    WHERE current_client_id = v_client_id AND status = 'rented';
    
    RAISE NOTICE 'Client ID: %', v_client_id;
    RAISE NOTICE 'Rented Product Count: %', v_count;
END $$;

-- Also select raw data for visibility
SELECT p.email, prod.name, prod.status 
FROM profiles p
JOIN products prod ON prod.current_client_id = p.id
WHERE p.email = 'client@test.com'
LIMIT 5;
