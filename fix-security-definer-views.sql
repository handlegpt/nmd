-- Fix Supabase Security Advisor Issues
-- Resolves SECURITY DEFINER view security risks
-- Created: 2025-01-03

-- =====================================================
-- BACKUP EXISTING VIEWS (Safety First)
-- =====================================================

-- Backup community_messages_with_user_info view
CREATE OR REPLACE VIEW public.community_messages_with_user_info_backup AS 
SELECT * FROM public.community_messages_with_user_info;

-- Backup meetup_stats view  
CREATE OR REPLACE VIEW public.meetup_stats_backup AS 
SELECT * FROM public.meetup_stats;

-- =====================================================
-- FIX SECURITY DEFINER ISSUES
-- =====================================================

-- Fix 1: community_messages_with_user_info view
-- Change from SECURITY DEFINER to SECURITY INVOKER
CREATE OR REPLACE VIEW public.community_messages_with_user_info
AS
SELECT 
    cm.*,
    u.username,
    u.avatar_url,
    u.created_at as user_created_at
FROM public.community_messages cm
JOIN public.users u ON cm.user_id = u.id
WITH SECURITY INVOKER; -- Changed from DEFINER to INVOKER

-- Fix 2: meetup_stats view
-- Change from SECURITY DEFINER to SECURITY INVOKER
CREATE OR REPLACE VIEW public.meetup_stats
AS
SELECT 
    -- Add your actual meetup statistics query here
    -- This is a template - you may need to adjust based on your actual view
    COUNT(*) as total_meetups,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_meetups,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetups,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_meetups,
    AVG(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_activity_rate
FROM public.meetups
WITH SECURITY INVOKER; -- Changed from DEFINER to INVOKER

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if views are now using SECURITY INVOKER
SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY INVOKER%' THEN 'SECURITY INVOKER ✅'
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER ❌'
        ELSE 'No security specified ⚠️'
    END as security_type,
    definition
FROM pg_views 
WHERE viewname IN ('community_messages_with_user_info', 'meetup_stats')
ORDER BY viewname;

-- Check if backup views were created successfully
SELECT 
    schemaname,
    viewname,
    'BACKUP' as view_type
FROM pg_views 
WHERE viewname IN ('community_messages_with_user_info_backup', 'meetup_stats_backup')
ORDER BY viewname;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (If needed)
-- =====================================================

/*
-- If you need to rollback, use these commands:

-- Rollback community_messages_with_user_info
DROP VIEW IF EXISTS public.community_messages_with_user_info;
CREATE OR REPLACE VIEW public.community_messages_with_user_info AS 
SELECT * FROM public.community_messages_with_user_info_backup;

-- Rollback meetup_stats  
DROP VIEW IF EXISTS public.meetup_stats;
CREATE OR REPLACE VIEW public.meetup_stats AS 
SELECT * FROM public.meetup_stats_backup;

-- Remove backup views
DROP VIEW IF EXISTS public.community_messages_with_user_info_backup;
DROP VIEW IF EXISTS public.meetup_stats_backup;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
SECURITY INVOKER vs SECURITY DEFINER:

- SECURITY INVOKER: View runs with caller's permissions (recommended)
- SECURITY DEFINER: View runs with creator's permissions (security risk)

Benefits of SECURITY INVOKER:
✅ Respects Row Level Security (RLS) policies
✅ User can only see data they have permission to access
✅ More secure and follows principle of least privilege
✅ Easier to maintain and audit

After applying this fix:
1. Run the verification queries to confirm changes
2. Test your application functionality
3. Check Supabase Security Advisor again
4. The security warnings should be resolved
*/
