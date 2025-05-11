
CREATE OR REPLACE FUNCTION public.get_users_data()
RETURNS TABLE (
  id UUID,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has admin or god role
  IF (SELECT EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'god')
  )) THEN
    -- Return a limited set of user data for admins only
    RETURN QUERY
      SELECT au.id, au.email 
      FROM auth.users au
      ORDER BY au.created_at DESC;
  ELSE
    -- Non-admins get no data
    RETURN QUERY
      SELECT au.id, au.email 
      FROM auth.users au
      WHERE 1=0; -- Empty result set
  END IF;
END;
$$;
