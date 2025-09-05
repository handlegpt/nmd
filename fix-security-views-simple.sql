-- Simple Fix for Supabase Security Advisor Issues
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
-- FIX SECURITY DEFINER ISSUES
-- =====================================================

-- Fix 1: community_messages_with_user_info view
CREATE OR REPLACE VIEW public.community_messages_with_user_info
AS
SELECT 
    cm.*,
    u.username,
    u.avatar_url,
    u.created_at as user_created_at
FROM public.community_messages cm
JOIN public.users u ON cm.user_id = u.id
WITH SECURITY INVOKER;

-- Fix 2: meetup_stats view
CREATE OR REPLACE VIEW public.meetup_stats
AS
SELECT 
    COUNT(*) as total_meetups,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_meetups,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetups,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_meetups
FROM public.meetups
WITH SECURITY INVOKER;

-- =====================================================
-- VERIFY CHANGES
-- =====================================================

-- Check security types
SELECT 
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY INVOKER%' THEN 'SECURITY INVOKER ✅'
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER ❌'
        ELSE 'No security specified ⚠️'
    END as security_type
FROM pg_views 
WHERE viewname IN ('community_messages_with_user_info', 'meetup_stats');
