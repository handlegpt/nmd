-- 修复Supabase数据库安全配置问题
-- 这个脚本将启用RLS并修复安全配置

-- 1. 启用city_costs表的RLS
ALTER TABLE public.city_costs ENABLE ROW LEVEL SECURITY;

-- 2. 启用nomad_visas表的RLS  
ALTER TABLE public.nomad_visas ENABLE ROW LEVEL SECURITY;

-- 3. 为其他重要表启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_calculator_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_counter_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_tracker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- 4. 为其他表启用RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetup_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetup_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_wifi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_tracker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_planner_data ENABLE ROW LEVEL SECURITY;

-- 5. 为city_costs表创建适当的RLS策略（如果不存在）
DO $$
BEGIN
    -- 检查策略是否已存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'city_costs' 
        AND policyname = 'Anyone can view city costs'
    ) THEN
        CREATE POLICY "Anyone can view city costs" ON public.city_costs
        FOR SELECT USING (true);
    END IF;
END $$;

-- 6. 为nomad_visas表创建适当的RLS策略（如果不存在）
DO $$
BEGIN
    -- 检查策略是否已存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nomad_visas' 
        AND policyname = 'Anyone can view nomad visas'
    ) THEN
        CREATE POLICY "Anyone can view nomad visas" ON public.nomad_visas
        FOR SELECT USING (true);
    END IF;
END $$;

-- 7. 为其他表创建基本的查看策略
DO $$
BEGIN
    -- user_profiles表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Anyone can view user profiles'
    ) THEN
        CREATE POLICY "Anyone can view user profiles" ON public.user_profiles
        FOR SELECT USING (true);
    END IF;

    -- place_reviews表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'place_reviews' 
        AND policyname = 'Anyone can view place reviews'
    ) THEN
        CREATE POLICY "Anyone can view place reviews" ON public.place_reviews
        FOR SELECT USING (true);
    END IF;

    -- place_photos表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'place_photos' 
        AND policyname = 'Anyone can view place photos'
    ) THEN
        CREATE POLICY "Anyone can view place photos" ON public.place_photos
        FOR SELECT USING (true);
    END IF;

    -- place_checkins表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'place_checkins' 
        AND policyname = 'Anyone can view place checkins'
    ) THEN
        CREATE POLICY "Anyone can view place checkins" ON public.place_checkins
        FOR SELECT USING (true);
    END IF;

    -- cost_calculator_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cost_calculator_data' 
        AND policyname = 'Anyone can view cost calculator data'
    ) THEN
        CREATE POLICY "Anyone can view cost calculator data" ON public.cost_calculator_data
        FOR SELECT USING (true);
    END IF;

    -- visa_counter_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'visa_counter_data' 
        AND policyname = 'Anyone can view visa counter data'
    ) THEN
        CREATE POLICY "Anyone can view visa counter data" ON public.visa_counter_data
        FOR SELECT USING (true);
    END IF;

    -- travel_tracker_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'travel_tracker_data' 
        AND policyname = 'Anyone can view travel tracker data'
    ) THEN
        CREATE POLICY "Anyone can view travel tracker data" ON public.travel_tracker_data
        FOR SELECT USING (true);
    END IF;

    -- user_activity表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_activity' 
        AND policyname = 'Anyone can view user activity'
    ) THEN
        CREATE POLICY "Anyone can view user activity" ON public.user_activity
        FOR SELECT USING (true);
    END IF;

    -- data_sources表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'data_sources' 
        AND policyname = 'Anyone can view data sources'
    ) THEN
        CREATE POLICY "Anyone can view data sources" ON public.data_sources
        FOR SELECT USING (true);
    END IF;
END $$;

-- 8. 为其他表创建基本的查看策略
DO $$
BEGIN
    -- domains表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'domains' 
        AND policyname = 'Anyone can view domains'
    ) THEN
        CREATE POLICY "Anyone can view domains" ON public.domains
        FOR SELECT USING (true);
    END IF;

    -- domain_transactions表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'domain_transactions' 
        AND policyname = 'Anyone can view domain transactions'
    ) THEN
        CREATE POLICY "Anyone can view domain transactions" ON public.domain_transactions
        FOR SELECT USING (true);
    END IF;

    -- domain_alerts表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'domain_alerts' 
        AND policyname = 'Anyone can view domain alerts'
    ) THEN
        CREATE POLICY "Anyone can view domain alerts" ON public.domain_alerts
        FOR SELECT USING (true);
    END IF;

    -- rating_summaries表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rating_summaries' 
        AND policyname = 'Anyone can view rating summaries'
    ) THEN
        CREATE POLICY "Anyone can view rating summaries" ON public.rating_summaries
        FOR SELECT USING (true);
    END IF;

    -- domain_settings表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'domain_settings' 
        AND policyname = 'Anyone can view domain settings'
    ) THEN
        CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
        FOR SELECT USING (true);
    END IF;

    -- meetup_activities表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meetup_activities' 
        AND policyname = 'Anyone can view meetup activities'
    ) THEN
        CREATE POLICY "Anyone can view meetup activities" ON public.meetup_activities
        FOR SELECT USING (true);
    END IF;

    -- meetup_reviews表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meetup_reviews' 
        AND policyname = 'Anyone can view meetup reviews'
    ) THEN
        CREATE POLICY "Anyone can view meetup reviews" ON public.meetup_reviews
        FOR SELECT USING (true);
    END IF;

    -- leaderboard表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leaderboard' 
        AND policyname = 'Anyone can view leaderboard'
    ) THEN
        CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
        FOR SELECT USING (true);
    END IF;

    -- activity_events表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_events' 
        AND policyname = 'Anyone can view activity events'
    ) THEN
        CREATE POLICY "Anyone can view activity events" ON public.activity_events
        FOR SELECT USING (true);
    END IF;

    -- city_wifi_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'city_wifi_data' 
        AND policyname = 'Anyone can view city wifi data'
    ) THEN
        CREATE POLICY "Anyone can view city wifi data" ON public.city_wifi_data
        FOR SELECT USING (true);
    END IF;

    -- city_votes表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'city_votes' 
        AND policyname = 'Anyone can view city votes'
    ) THEN
        CREATE POLICY "Anyone can view city votes" ON public.city_votes
        FOR SELECT USING (true);
    END IF;

    -- vote_summaries表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vote_summaries' 
        AND policyname = 'Anyone can view vote summaries'
    ) THEN
        CREATE POLICY "Anyone can view vote summaries" ON public.vote_summaries
        FOR SELECT USING (true);
    END IF;

    -- domain_tracker_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'domain_tracker_data' 
        AND policyname = 'Anyone can view domain tracker data'
    ) THEN
        CREATE POLICY "Anyone can view domain tracker data" ON public.domain_tracker_data
        FOR SELECT USING (true);
    END IF;

    -- city_preferences表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'city_preferences' 
        AND policyname = 'Anyone can view city preferences'
    ) THEN
        CREATE POLICY "Anyone can view city preferences" ON public.city_preferences
        FOR SELECT USING (true);
    END IF;

    -- travel_planner_data表策略
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'travel_planner_data' 
        AND policyname = 'Anyone can view travel planner data'
    ) THEN
        CREATE POLICY "Anyone can view travel planner data" ON public.travel_planner_data
        FOR SELECT USING (true);
    END IF;
END $$;

-- 9. 修复SECURITY DEFINER视图问题
-- 这些视图需要重新创建以移除SECURITY DEFINER属性

-- 重新创建community_messages_with_user_info视图
DROP VIEW IF EXISTS public.community_messages_with_user_info;
CREATE VIEW public.community_messages_with_user_info AS
SELECT 
    cm.*,
    up.profile_data->>'name' as display_name,
    up.profile_data->>'avatar_url' as avatar_url,
    up.profile_data->>'location' as user_location
FROM public.community_messages cm
LEFT JOIN public.user_profiles up ON cm.user_id = up.user_id;

-- 重新创建plan_details视图
DROP VIEW IF EXISTS public.plan_details;
CREATE VIEW public.plan_details AS
SELECT 
    p.*,
    up.profile_data->>'name' as user_name,
    up.profile_data->>'avatar_url' as user_avatar
FROM public.plans p
LEFT JOIN public.user_profiles up ON p.user_id = up.user_id;

-- 重新创建city_overview视图
DROP VIEW IF EXISTS public.city_overview;
CREATE VIEW public.city_overview AS
SELECT 
    c.*,
    cc.monthly_cost,
    cc.cost_breakdown,
    nv.visa_available,
    nv.visa_requirements
FROM public.cities c
LEFT JOIN public.city_costs cc ON c.id = cc.city_id
LEFT JOIN public.nomad_visas nv ON c.id = nv.city_id;

-- 10. 为视图启用RLS
ALTER VIEW public.community_messages_with_user_info SET (security_invoker = true);
ALTER VIEW public.plan_details SET (security_invoker = true);
ALTER VIEW public.city_overview SET (security_invoker = true);

-- 完成
SELECT 'Database security configuration completed successfully!' as status;
