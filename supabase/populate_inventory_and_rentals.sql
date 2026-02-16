-- Function to generate random serial numbers
create or replace function random_string(length integer) returns text as
$$
declare
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer;
begin
  for i in 1..length loop
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  end loop;
  return result;
end;
$$ language plpgsql;

-- 1. Insert 100 Laptops
DO $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO public.products (name, category, model, serial_number, specs, status, created_at)
        VALUES (
            'Enterprise Laptop ' || i,
            'Laptop',
            'Dell Latitude ' || (5000 + i),
            'SN-L-' || random_string(8),
            '{"cpu": "i7", "ram": "16GB", "storage": "512GB SSD"}'::jsonb,
            'available',
            NOW()
        );
    END LOOP;
END $$;

-- 2. Insert 50 Desktops
DO $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO public.products (name, category, model, serial_number, specs, status, created_at)
        VALUES (
            'Office Desktop ' || i,
            'Desktop',
            'HP EliteDesk ' || (800 + i),
            'SN-D-' || random_string(8),
            '{"cpu": "i5", "ram": "32GB", "storage": "1TB SSD"}'::jsonb,
            'available',
            NOW()
        );
    END LOOP;
END $$;

-- 3. Rent out 70 Laptops to Client
DO $$
DECLARE
    v_client_id uuid;
    v_product_id uuid;
    v_cursor CURSOR FOR 
        SELECT id FROM public.products 
        WHERE category = 'Laptop' AND status = 'available' 
        LIMIT 70;
BEGIN
    -- Get Client ID
    SELECT id INTO v_client_id FROM public.profiles WHERE email = 'client@test.com';

    OPEN v_cursor;
    LOOP
        FETCH v_cursor INTO v_product_id;
        EXIT WHEN NOT FOUND;

        -- Update Product
        UPDATE public.products 
        SET status = 'rented', current_client_id = v_client_id 
        WHERE id = v_product_id;

        -- Create Assignment
        INSERT INTO public.assignments (product_id, client_id, assigned_date, status)
        VALUES (v_product_id, v_client_id, NOW(), 'active');
    END LOOP;
    CLOSE v_cursor;
END $$;

-- 4. Rent out 20 Desktops to Client
DO $$
DECLARE
    v_client_id uuid;
    v_product_id uuid;
    v_cursor CURSOR FOR 
        SELECT id FROM public.products 
        WHERE category = 'Desktop' AND status = 'available' 
        LIMIT 20;
BEGIN
    -- Get Client ID
    SELECT id INTO v_client_id FROM public.profiles WHERE email = 'client@test.com';

    OPEN v_cursor;
    LOOP
        FETCH v_cursor INTO v_product_id;
        EXIT WHEN NOT FOUND;

        -- Update Product
        UPDATE public.products 
        SET status = 'rented', current_client_id = v_client_id 
        WHERE id = v_product_id;

        -- Create Assignment
        INSERT INTO public.assignments (product_id, client_id, assigned_date, status)
        VALUES (v_product_id, v_client_id, NOW(), 'active');
    END LOOP;
    CLOSE v_cursor;
END $$;
