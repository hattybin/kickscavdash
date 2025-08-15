-- Supabase setup for Kick Scavenger Hunt Dashboard
-- Run these commands in the Supabase SQL editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-secret';

-- 1. RFID Locations Table
CREATE TABLE rfid_locations (
    id BIGSERIAL PRIMARY KEY,
    rfid_number INTEGER UNIQUE NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    discovery_method TEXT NOT NULL DEFAULT 'unknown', -- 'auto', 'manual', 'viewer_guess'
    discovered_by TEXT,
    discovered_by_username TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    guess_count INTEGER DEFAULT 1,
    confirmed BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contestant Positions Table
CREATE TABLE contestant_positions (
    kick_username TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    points INTEGER DEFAULT 0,
    rfid_count INTEGER DEFAULT 0,
    is_cached BOOLEAN DEFAULT false,
    gps_state TEXT DEFAULT 'unknown', -- 'on', 'off', 'clustered'
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activity Log Table (for tracking changes)
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    activity_type TEXT NOT NULL, -- 'rfid_discovered', 'position_updated', 'new_contestant'
    kick_username TEXT,
    display_name TEXT,
    rfid_number INTEGER,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (all tables publicly readable for dashboard)
ALTER TABLE rfid_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contestant_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since this is a public scavenger hunt)
CREATE POLICY "Public read access" ON rfid_locations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON contestant_positions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON activity_log FOR SELECT USING (true);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_rfid_locations_updated_at
    BEFORE UPDATE ON rfid_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contestant_positions_updated_at
    BEFORE UPDATE ON contestant_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_rfid_locations_number ON rfid_locations(rfid_number);
CREATE INDEX idx_contestant_positions_username ON contestant_positions(kick_username);
CREATE INDEX idx_contestant_positions_rfid_count ON contestant_positions(rfid_count DESC);
CREATE INDEX idx_contestant_positions_points ON contestant_positions(points DESC);
CREATE INDEX idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Views for common queries
CREATE VIEW leaderboard AS
SELECT 
    kick_username,
    display_name,
    points,
    rfid_count,
    lat,
    lng,
    is_cached,
    last_updated,
    ROW_NUMBER() OVER (ORDER BY rfid_count DESC, points DESC) as rank
FROM contestant_positions
ORDER BY rfid_count DESC, points DESC;

-- Recent activity view
CREATE VIEW recent_activity AS
SELECT 
    id,
    activity_type,
    kick_username,
    display_name,
    rfid_number,
    details,
    created_at
FROM activity_log
ORDER BY created_at DESC
LIMIT 50;