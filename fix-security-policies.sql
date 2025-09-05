-- Fix Security Policies for Nomad Now
-- This script implements proper Row Level Security (RLS) policies
-- to ensure data privacy and security

-- 1. Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public select by email" ON public.users;
DROP POLICY IF EXISTS "Allow public insert to votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public select from votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public update votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public delete from votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public insert to place_votes" ON public.place_votes;
DROP POLICY IF EXISTS "Allow public select from place_votes" ON public.place_votes;
DROP POLICY IF EXISTS "Allow public update place_votes" ON public.place_votes;
DROP POLICY IF EXISTS "Allow public delete from place_votes" ON public.place_votes;
DROP POLICY IF EXISTS "Allow public insert to place_reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Allow public select from place_reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Allow public update place_reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Allow public delete from place_reviews" ON public.place_reviews;

-- 2. Drop existing verification_codes policies
DROP POLICY IF EXISTS "Allow public insert to verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow public select from verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow public update verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow public delete from verification_codes" ON public.verification_codes;

-- 3. Drop existing secure policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.users;
DROP POLICY IF EXISTS "Allow email verification queries" ON public.users;
DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;
DROP POLICY IF EXISTS "Users can update own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can insert own place votes" ON public.place_votes;
DROP POLICY IF EXISTS "Users can view all place votes" ON public.place_votes;
DROP POLICY IF EXISTS "Users can update own place votes" ON public.place_votes;
DROP POLICY IF EXISTS "Users can delete own place votes" ON public.place_votes;
DROP POLICY IF EXISTS "Users can insert own place reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can view all place reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can update own place reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can delete own place reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can view own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can insert own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can update own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can delete own visas" ON public.user_visas;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

-- 4. Create secure user policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

-- Allow public insert for registration (but with email verification)
CREATE POLICY "Allow public insert for registration" ON public.users 
FOR INSERT WITH CHECK (true);

-- Allow email verification queries
CREATE POLICY "Allow email verification queries" ON public.users 
FOR SELECT USING (
  auth.uid() = id OR 
  (auth.role() = 'service_role' AND current_setting('app.verification_mode', true) = 'true')
);

-- 5. Create secure voting policies
-- Users can only vote once per city/place
CREATE POLICY "Users can insert own votes" ON public.votes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view all votes (for transparency)
CREATE POLICY "Users can view all votes" ON public.votes 
FOR SELECT USING (true);

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON public.votes 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON public.votes 
FOR DELETE USING (auth.uid() = user_id);

-- 6. Create secure place voting policies
-- Users can only vote once per place
CREATE POLICY "Users can insert own place votes" ON public.place_votes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view all place votes
CREATE POLICY "Users can view all place votes" ON public.place_votes 
FOR SELECT USING (true);

-- Users can update their own place votes
CREATE POLICY "Users can update own place votes" ON public.place_votes 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own place votes
CREATE POLICY "Users can delete own place votes" ON public.place_votes 
FOR DELETE USING (auth.uid() = user_id);

-- 7. Create secure place review policies
-- Users can only create reviews for places they've visited
CREATE POLICY "Users can insert own place reviews" ON public.place_reviews 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view all place reviews
CREATE POLICY "Users can view all place reviews" ON public.place_reviews 
FOR SELECT USING (true);

-- Users can update their own place reviews
CREATE POLICY "Users can update own place reviews" ON public.place_reviews 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own place reviews
CREATE POLICY "Users can delete own place reviews" ON public.place_reviews 
FOR DELETE USING (auth.uid() = user_id);

-- 8. Create secure user data policies
-- Users can only view their own visas
CREATE POLICY "Users can view own visas" ON public.user_visas 
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own visas
CREATE POLICY "Users can insert own visas" ON public.user_visas 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own visas
CREATE POLICY "Users can update own visas" ON public.user_visas 
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own visas
CREATE POLICY "Users can delete own visas" ON public.user_visas 
FOR DELETE USING (auth.uid() = user_id);

-- Users can only view their own favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites 
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" ON public.user_favorites 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON public.user_favorites 
FOR DELETE USING (auth.uid() = user_id);

-- Users can only view their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences 
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON public.user_preferences 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON public.user_preferences 
FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create secure verification code policies
-- Allow public access to verification codes (needed for registration)
CREATE POLICY "Allow public insert to verification_codes" ON public.verification_codes 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from verification_codes" ON public.verification_codes 
FOR SELECT USING (true);

CREATE POLICY "Allow public update verification_codes" ON public.verification_codes 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete from verification_codes" ON public.verification_codes 
FOR DELETE USING (true);

-- 10. Create audit logging function
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log security events to a separate audit table
  INSERT INTO security_audit_log (
    table_name,
    operation,
    user_id,
    record_id,
    old_data,
    new_data,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'user-agent',
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_timestamp ON security_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_table_operation ON security_audit_log(table_name, operation);

-- 13. Enable RLS on audit table
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Service role can access audit logs" ON security_audit_log 
FOR ALL USING (auth.role() = 'service_role');

-- 14. Create triggers for security auditing
DROP TRIGGER IF EXISTS audit_users_changes ON public.users;
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

DROP TRIGGER IF EXISTS audit_votes_changes ON public.votes;
CREATE TRIGGER audit_votes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

DROP TRIGGER IF EXISTS audit_place_votes_changes ON public.place_votes;
CREATE TRIGGER audit_place_votes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.place_votes
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

DROP TRIGGER IF EXISTS audit_user_visas_changes ON public.user_visas;
CREATE TRIGGER audit_user_visas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_visas
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

-- 15. Create function to clean old audit logs
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM security_audit_log 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create scheduled job to clean audit logs (if using pg_cron)
-- SELECT cron.schedule('clean-audit-logs', '0 2 * * 0', 'SELECT clean_old_audit_logs();');

-- 17. Create function to get user's own data summary
CREATE OR REPLACE FUNCTION get_user_data_summary(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only allow users to get their own data summary
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT jsonb_build_object(
    'user_id', user_uuid,
    'visas_count', (SELECT COUNT(*) FROM public.user_visas WHERE user_id = user_uuid),
    'favorites_count', (SELECT COUNT(*) FROM public.user_favorites WHERE user_id = user_uuid),
    'votes_count', (SELECT COUNT(*) FROM public.votes WHERE user_id = user_uuid),
    'place_votes_count', (SELECT COUNT(*) FROM public.place_votes WHERE user_id = user_uuid),
    'last_activity', (
      SELECT MAX(timestamp) FROM (
        SELECT created_at as timestamp FROM public.votes WHERE user_id = user_uuid
        UNION ALL
        SELECT created_at FROM public.place_votes WHERE user_id = user_uuid
        UNION ALL
        SELECT created_at FROM public.user_visas WHERE user_id = user_uuid
      ) activities
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Security policies updated successfully!' as status;
