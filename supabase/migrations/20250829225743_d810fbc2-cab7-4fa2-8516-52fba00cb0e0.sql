-- Create A/B testing tables
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[]', -- Array of variant configurations
  traffic_split JSONB NOT NULL DEFAULT '{}', -- Percentage split between variants
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused, completed
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT, -- For anonymous users
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bot packages table
CREATE TABLE public.bot_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user bot subscriptions table
CREATE TABLE public.user_bot_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_package_id UUID REFERENCES public.bot_packages(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL, -- monthly, yearly
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bot_subscriptions ENABLE ROW LEVEL SECURITY;

-- A/B Tests policies
CREATE POLICY "Admins can manage A/B tests" ON public.ab_tests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can read active tests" ON public.ab_tests
  FOR SELECT USING (status = 'active');

-- A/B Test assignments policies  
CREATE POLICY "Users can view their own assignments" ON public.ab_test_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage assignments" ON public.ab_test_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Bot packages policies
CREATE POLICY "Bot packages are publicly readable" ON public.bot_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage bot packages" ON public.bot_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User bot subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_bot_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_bot_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_bot_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_bot_subscriptions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample bot packages
INSERT INTO public.bot_packages (name, description, features, price_monthly, price_yearly, sort_order) VALUES
('Neon S.8 Bot', 'Essential protection with smart scanning capabilities', '["Real-time URL scanning", "Basic threat detection", "Email alerts", "24/7 monitoring"]', 9.99, 99.99, 1),
('Ultimate V.6 Bot', 'Advanced protection with AI-powered analysis', '["Advanced AI analysis", "Deep web scanning", "Social media monitoring", "Priority support", "Custom reports"]', 19.99, 199.99, 2),
('Omega X.0 Bot', 'Professional-grade security suite', '["Multi-layer protection", "Behavioral analysis", "Real-time blocking", "API access", "White-label options"]', 39.99, 399.99, 3),
('Alpha M.6 Bot', 'Enterprise solution with full customization', '["Enterprise dashboard", "Custom integrations", "Dedicated support", "Advanced analytics", "Unlimited scans"]', 79.99, 799.99, 4),
('Oracle A0.1 Bot', 'AI-driven predictive security', '["Predictive threat modeling", "Machine learning detection", "Automated responses", "Risk assessment", "Compliance reporting"]', 149.99, 1499.99, 5),
('Blister 0.9 Bot', 'Lightweight protection for personal use', '["Basic scanning", "Simple dashboard", "Mobile app", "Weekly reports"]', 4.99, 49.99, 0);

-- Create triggers for updated_at
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_packages_updated_at
  BEFORE UPDATE ON public.bot_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bot_subscriptions_updated_at
  BEFORE UPDATE ON public.user_bot_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();