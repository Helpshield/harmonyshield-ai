-- Database Performance Optimizations: Add indexes on frequently queried columns

-- User-related indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- Scan results indexes (heavily queried table)
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON public.scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_created_at ON public.scan_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_results_status ON public.scan_results(scan_status);
CREATE INDEX IF NOT EXISTS idx_scan_results_risk_level ON public.scan_results(risk_level);
CREATE INDEX IF NOT EXISTS idx_scan_results_user_created ON public.scan_results(user_id, created_at DESC);

-- Scam reports indexes
CREATE INDEX IF NOT EXISTS idx_scam_reports_user_id ON public.scam_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created_at ON public.scam_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON public.scam_reports(status);
CREATE INDEX IF NOT EXISTS idx_scam_reports_severity ON public.scam_reports(severity);
CREATE INDEX IF NOT EXISTS idx_scam_reports_user_status ON public.scam_reports(user_id, status);

-- Recovery requests indexes
CREATE INDEX IF NOT EXISTS idx_recovery_requests_user_id ON public.recovery_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_requests_created_at ON public.recovery_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_requests_status ON public.recovery_requests(status);
CREATE INDEX IF NOT EXISTS idx_recovery_requests_user_status ON public.recovery_requests(user_id, status);

-- Deep search indexes
CREATE INDEX IF NOT EXISTS idx_deep_search_requests_user_id ON public.deep_search_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_search_requests_created_at ON public.deep_search_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deep_search_requests_status ON public.deep_search_requests(search_status);

-- Deep search results indexes
CREATE INDEX IF NOT EXISTS idx_deep_search_results_request_id ON public.deep_search_results(search_request_id);
CREATE INDEX IF NOT EXISTS idx_deep_search_results_created_at ON public.deep_search_results(created_at DESC);

-- User roles index for quick role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Bot subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_bot_subscriptions_user_id ON public.user_bot_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bot_subscriptions_status ON public.user_bot_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_bot_subscriptions_user_status ON public.user_bot_subscriptions(user_id, status);

-- Tracking links indexes
CREATE INDEX IF NOT EXISTS idx_tracking_links_user_id ON public.tracking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_short_code ON public.tracking_links(short_code);
CREATE INDEX IF NOT EXISTS idx_tracking_links_is_active ON public.tracking_links(is_active);

-- Visitor data indexes
CREATE INDEX IF NOT EXISTS idx_visitor_data_tracking_link_id ON public.visitor_data(tracking_link_id);
CREATE INDEX IF NOT EXISTS idx_visitor_data_visited_at ON public.visitor_data(visited_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- News articles indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_is_active ON public.news_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);

-- Threat reports indexes
CREATE INDEX IF NOT EXISTS idx_threat_reports_status ON public.threat_reports(status);
CREATE INDEX IF NOT EXISTS idx_threat_reports_severity ON public.threat_reports(severity);
CREATE INDEX IF NOT EXISTS idx_threat_reports_created_at ON public.threat_reports(created_at DESC);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON public.search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_type ON public.search_analytics(search_type);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_scan_results_user_status_created ON public.scan_results(user_id, scan_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status_created ON public.scam_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_requests_status_created ON public.recovery_requests(status, created_at DESC);