-- Update location history view to show last 12 hours instead of 4 hours
-- Run this in Supabase SQL editor to update the breadcrumb trail timeframe

-- Drop existing view if it exists
DROP VIEW IF EXISTS recent_location_history;

-- Create updated view showing last 12 hours of location data
CREATE VIEW recent_location_history AS
SELECT 
    id,
    kick_username,
    display_name,
    lat,
    lng,
    recorded_at
FROM location_history
WHERE recorded_at >= NOW() - INTERVAL '12 hours'
ORDER BY kick_username, recorded_at ASC;

-- Add RLS policy for the view (allow public read access)
ALTER VIEW recent_location_history SET (security_invoker = true);

-- Grant read access
GRANT SELECT ON recent_location_history TO public;