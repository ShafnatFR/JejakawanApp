-- Jejakawan Database Schema
-- Run on Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL DEFAULT 'Traveler',
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  current_mode VARCHAR(10) DEFAULT 'tourist' CHECK (current_mode IN ('tourist','explorer')),
  preferred_interests TEXT[] DEFAULT '{}',
  budget_min INT DEFAULT 0,
  budget_max INT DEFAULT 10000000,
  transport_modes TEXT[] DEFAULT '{}',
  home_lat DOUBLE PRECISION,
  home_lng DOUBLE PRECISION,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  ktp_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  ktp_hash TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  xp_total INT DEFAULT 0,
  level INT DEFAULT 1,
  badge_count INT DEFAULT 0,
  subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free','weekly','monthly','exclusive')),
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Destinations
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  category TEXT[] DEFAULT '{}',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  province VARCHAR(100),
  regency VARCHAR(100),
  cover_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  is_underrated BOOLEAN DEFAULT FALSE,
  entry_fee_min INT DEFAULT 0,
  entry_fee_max INT DEFAULT 0,
  signal_strength VARCHAR(10) CHECK (signal_strength IN ('strong','moderate','weak','none')),
  best_season TEXT[] DEFAULT '{}',
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  visit_count INT DEFAULT 0,
  curated_by UUID REFERENCES public.user_profiles(id),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_destinations_underrated ON public.destinations(is_underrated) WHERE is_underrated = TRUE;
CREATE INDEX IF NOT EXISTS idx_destinations_province ON public.destinations(province);

-- 3. Trip Requests
CREATE TABLE IF NOT EXISTS public.trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.user_profiles(id),
  destination_id UUID REFERENCES public.destinations(id),
  destination_name VARCHAR(200),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  duration_days INT,
  budget_min INT DEFAULT 0,
  budget_max INT DEFAULT 10000000,
  transport_modes TEXT[] DEFAULT '{}',
  max_members INT DEFAULT 4 CHECK (max_members BETWEEN 1 AND 10),
  current_members INT DEFAULT 1,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','matched','in_progress','completed','cancelled')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trip Matches
CREATE TABLE IF NOT EXISTS public.trip_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_request_id UUID NOT NULL REFERENCES public.trip_requests(id),
  inviter_id UUID NOT NULL REFERENCES public.user_profiles(id),
  invitee_id UUID NOT NULL REFERENCES public.user_profiles(id),
  compatibility DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trip Groups
CREATE TABLE IF NOT EXISTS public.trip_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_request_id UUID NOT NULL REFERENCES public.trip_requests(id),
  name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning','active','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trip_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.trip_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  role VARCHAR(10) DEFAULT 'member' CHECK (role IN ('host','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 6. Agency Profiles
CREATE TABLE IF NOT EXISTS public.agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id),
  agency_name VARCHAR(200) NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(200),
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Open Trips
CREATE TABLE IF NOT EXISTS public.open_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agency_profiles(id),
  destination_id UUID REFERENCES public.destinations(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INT DEFAULT 20,
  current_participants INT DEFAULT 0,
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  itinerary JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Open Trip Bookings
CREATE TABLE IF NOT EXISTS public.open_trip_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.open_trips(id),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('destination','user','agency')),
  target_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  trip_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50),
  xp_required INT DEFAULT 0,
  condition_type VARCHAR(50),
  condition_value INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 12. User XP Logs
CREATE TABLE IF NOT EXISTS public.user_xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  action VARCHAR(50) NOT NULL,
  xp_amount INT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  destination_id UUID REFERENCES public.destinations(id),
  xp_reward INT DEFAULT 100,
  badge_reward_id UUID REFERENCES public.badges(id),
  start_date DATE,
  end_date DATE,
  max_claims INT,
  current_claims INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Mission Claims
CREATE TABLE IF NOT EXISTS public.mission_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  status VARCHAR(20) DEFAULT 'claimed' CHECK (status IN ('claimed','in_progress','completed','rejected')),
  proof_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, user_id)
);

-- 15. User Reports
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.user_profiles(id),
  reported_type VARCHAR(20) NOT NULL CHECK (reported_type IN ('user','content')),
  reported_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Trust Score Logs
CREATE TABLE IF NOT EXISTS public.trust_score_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  change_amount INT NOT NULL,
  reason VARCHAR(200),
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  plan VARCHAR(20) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_id VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  type VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  payment_method VARCHAR(50),
  midtrans_order_id VARCHAR(200),
  midtrans_transaction_id VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. User Recommendation Limits
CREATE TABLE IF NOT EXISTS public.user_recommendation_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- 20. Chat Rooms
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) DEFAULT 'direct' CHECK (type IN ('direct','group')),
  trip_group_id UUID REFERENCES public.trip_groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Chat Room Members
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 22. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id),
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id),
  content TEXT NOT NULL,
  type VARCHAR(10) DEFAULT 'text' CHECK (type IN ('text','image','system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. User Content
CREATE TABLE IF NOT EXISTS public.user_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  destination_id UUID REFERENCES public.destinations(id),
  type VARCHAR(20) CHECK (type IN ('photo','video','review')),
  url TEXT,
  caption TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. User Blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  blocked_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- 26. User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id),
  notification_settings JSONB DEFAULT '{"push":true,"email":true,"match_alerts":true,"trip_updates":true}',
  privacy_settings JSONB DEFAULT '{"show_location":true,"show_profile":true,"show_trips":true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.user_profiles(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- User profiles: public read, own write
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Destinations: public read
CREATE POLICY "Destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);

-- Trip requests: public read, own write
CREATE POLICY "Trip requests are viewable by everyone" ON public.trip_requests FOR SELECT USING (true);
CREATE POLICY "Users can create trip requests" ON public.trip_requests FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own trip requests" ON public.trip_requests FOR UPDATE USING (auth.uid() = creator_id);

-- Trip matches: involved users can read
CREATE POLICY "Users can view their matches" ON public.trip_matches FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can create matches" ON public.trip_matches FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Invitees can update match status" ON public.trip_matches FOR UPDATE USING (auth.uid() = invitee_id);

-- Reviews: public read, own write
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Badges: public read
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges: public read
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);

-- Missions: public read
CREATE POLICY "Missions are viewable by everyone" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Users can claim missions" ON public.mission_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own claims" ON public.mission_claims FOR SELECT USING (auth.uid() = user_id);

-- Notifications: own read
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Chat rooms: members only
CREATE POLICY "Members can view chat rooms" ON public.chat_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = id AND user_id = auth.uid())
);
CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
);
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
);

-- User content: public read, own write
CREATE POLICY "Content is viewable by everyone" ON public.user_content FOR SELECT USING (true);
CREATE POLICY "Users can create content" ON public.user_content FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences: own only
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Traveler'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_trip_requests_updated_at BEFORE UPDATE ON public.trip_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
