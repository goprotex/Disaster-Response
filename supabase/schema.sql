-- DISASTER COORDINATION APP DATABASE SCHEMA
-- Copy-paste this into Supabase SQL Editor and run

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- USERS table is handled by Supabase auth.users
-- Create a profile table to extend user information if needed
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('victim', 'volunteer', 'org_admin', 'admin')) DEFAULT 'victim',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REQUESTS table for disaster assistance requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Meals','Water','Equipment','Shelter','Medical','Other')) DEFAULT 'Other',
  urgency TEXT CHECK (urgency IN ('Low','Medium','High')) DEFAULT 'Low',
  status TEXT CHECK (status IN ('Open','Claimed','Fulfilled')) DEFAULT 'Open',
  contact_name TEXT,
  contact_phone TEXT,
  is_contact_shared BOOLEAN DEFAULT true,
  photo_urls TEXT[],
  exif_data JSONB[],
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  photo_taken_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create spatial index for requests
CREATE INDEX requests_gix ON public.requests USING GIST (ST_Point(gps_lng, gps_lat));

-- OFFERS table for assistance offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create spatial index for offers  
CREATE INDEX offers_gix ON public.offers USING GIST (ST_Point(gps_lng, gps_lat));

-- ZONES table for resource zones (WiFi, Shelter, etc.)
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('Starlink','WiFi','Church','Shelter','Fuel','Other')) DEFAULT 'Other',
  description TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  polygon GEOMETRY,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create spatial index for zones
CREATE INDEX zones_gix ON public.zones USING GIST (ST_Point(gps_lng, gps_lat));

-- FLAGS table for content moderation
CREATE TABLE public.flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  reason TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Requests policies
CREATE POLICY "Anyone can view open requests" ON public.requests
  FOR SELECT USING (status != 'Hidden');

CREATE POLICY "Authenticated users can create requests" ON public.requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own requests" ON public.requests
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = claimed_by);

-- Offers policies  
CREATE POLICY "Anyone can view offers" ON public.offers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create offers" ON public.offers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own offers" ON public.offers
  FOR UPDATE USING (auth.uid() = created_by);

-- Zones policies
CREATE POLICY "Anyone can view zones" ON public.zones
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create zones" ON public.zones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own zones" ON public.zones
  FOR UPDATE USING (auth.uid() = created_by);

-- Flags policies
CREATE POLICY "Authenticated users can create flags" ON public.flags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own flags" ON public.flags
  FOR SELECT USING (auth.uid() = created_by);

-- TRIGGERS for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_requests
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_offers
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_zones
  BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- STORAGE BUCKETS for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policies for photos
CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
