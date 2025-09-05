-- Compatible Fix for Supabase Security Advisor Issues
-- Works with older PostgreSQL versions
-- Execute this script in your Supabase SQL Editor

-- =====================================================
-- BACKUP EXISTING VIEWS
-- =====================================================

-- Backup community_messages_with_user_info view
CREATE OR REPLACE VIEW public.community_messages_with_user_info_backup AS 
SELECT * FROM public.community_messages_with_user_info;

-- Backup meetup_stats view  
CREATE OR REPLACE VIEW public.meetup_stats_backup AS 
SELECT * FROM public.meetup_stats;

-- =====================================================
-- FIX SECURITY DEFINER ISSUES (Compatible Method)
-- =====================================================

-- Method 1: Drop and recreate views without SECURITY DEFINER
-- This will default to SECURITY INVOKER behavior

-- Fix 1: community_messages_with_user_info view
DROP VIEW IF EXISTS public.community_messages_with_user_info CASCADE;

CREATE VIEW public.community_messages_with_user_info
AS
SELECT 
    cm.*,
    u.username,
    u.avatar_url,
    u.created_at as user_created_at
FROM public.community_messages cm
JOIN public.users u ON cm.user_id = u.id;

-- Fix 2: meetup_stats view
DROP VIEW IF EXISTS public.meetup_stats CASCADE;

CREATE VIEW public.meetup_stats
AS
SELECT 
    COUNT(*) as total_meetups,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_meetups,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetups,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_meetups
FROM public.meetups;

-- =====================================================
-- VERIFY CHANGES
-- =====================================================

-- Check if views exist and their definitions
SELECT 
    schemaname,
    viewname,
    'VIEW EXISTS' as status
FROM pg_views 
WHERE viewname IN ('community_messages_with_user_info', 'meetup_stats')
ORDER BY viewname;

-- Check if backup views were created
SELECT 
    schemaname,
    viewname,
    'BACKUP' as view_type
FROM pg_views 
WHERE viewname IN ('community_messages_with_user_info_backup', 'meetup_stats_backup')
ORDER BY viewname;

-- =====================================================
-- ALTERNATIVE METHOD (If above doesn't work)
-- =====================================================

/*
-- If the above method doesn't work, try this alternative approach:

-- Alternative 1: Create new views with different names
CREATE VIEW public.community_messages_secure AS
SELECT 
    cm.*,
    u.username,
    u.avatar_url,
    u.created_at as user_created_at
FROM public.community_messages cm
JOIN public.users u ON cm.user_id = u.id;

CREATE VIEW public.meetup_stats_secure AS
SELECT 
    COUNT(*) as total_meetups,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_meetups,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetups,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_meetups
FROM public.meetups;

-- Then update your application code to use the new view names
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================

/*
-- If you need to rollback:

-- Restore original views from backup
DROP VIEW IF EXISTS public.community_messages_with_user_info;
CREATE VIEW public.community_messages_with_user_info AS 
SELECT * FROM public.community_messages_with_user_info_backup;

DROP VIEW IF EXISTS public.meetup_stats;
CREATE VIEW public.meetup_stats AS 
SELECT * FROM public.meetup_stats_backup;

-- Remove backup views
DROP VIEW IF EXISTS public.community_messages_with_user_info_backup;
DROP VIEW IF EXISTS public.meetup_stats_backup;
*/
