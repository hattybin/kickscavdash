// Supabase Configuration for Kick Scavenger Hunt Dashboard
// Add this to your HTML file after setting up the project

// 1. Add Supabase CDN to your HTML <head>:
/*
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
*/

// 2. Initialize Supabase (replace with your project URL and anon key)
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Database functions to replace your current localStorage/API calls

// Get all RFID locations from database
async function loadRfidLocationsFromDB() {
    try {
        const { data, error } = await supabase
            .from('rfid_locations')
            .select('*')
            .order('rfid_number');
        
        if (error) throw error;
        
        // Convert to your existing format
        rfidLocations.clear();
        data.forEach(location => {
            rfidLocations.set(location.rfid_number, {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lng),
                confirmed: location.confirmed,
                guessCount: location.guess_count,
                rfidId: location.rfid_number,
                manuallyRegistered: location.discovery_method === 'manual',
                autoRegistered: location.discovery_method === 'auto',
                discoveredBy: location.discovered_by,
                discoveredByUser: location.discovered_by_username,
                discoveredAt: location.discovered_at
            });
        });
        
        console.log(`Loaded ${data.length} RFID locations from database`);
        return true;
    } catch (error) {
        console.error('Error loading RFID locations:', error);
        return false;
    }
}

// Save RFID location to database
async function saveRfidLocationToDB(rfidNumber, location) {
    try {
        const dbLocation = {
            rfid_number: rfidNumber,
            lat: location.lat,
            lng: location.lng,
            discovery_method: location.manuallyRegistered ? 'manual' : 
                             location.autoRegistered ? 'auto' : 'viewer_guess',
            discovered_by: location.discoveredBy,
            discovered_by_username: location.discoveredByUser,
            guess_count: location.guessCount,
            confirmed: location.confirmed,
            metadata: {
                discoveredAt: location.discoveredAt
            }
        };

        const { data, error } = await supabase
            .from('rfid_locations')
            .upsert([dbLocation], { 
                onConflict: 'rfid_number',
                ignoreDuplicates: false 
            });

        if (error) throw error;
        
        // Log activity
        await logActivity('rfid_discovered', location.discoveredByUser, location.discoveredBy, rfidNumber, {
            method: dbLocation.discovery_method,
            coordinates: [location.lat, location.lng]
        });
        
        return true;
    } catch (error) {
        console.error('Error saving RFID location:', error);
        return false;
    }
}

// Update contestant positions in database
async function updateContestantPositionsInDB(contestants) {
    try {
        const dbContestants = contestants.map(contestant => {
            const [kickUser, displayName, lat, lng, points, rfids, isCached] = contestant;
            return {
                kick_username: kickUser,
                display_name: displayName,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                points: parseInt(points),
                rfid_count: parseInt(rfids),
                is_cached: Boolean(isCached),
                gps_state: detectGpsState(contestants)
            };
        });

        const { data, error } = await supabase
            .from('contestant_positions')
            .upsert(dbContestants, { 
                onConflict: 'kick_username',
                ignoreDuplicates: false 
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating contestant positions:', error);
        return false;
    }
}

// Get contestant positions from database
async function loadContestantPositionsFromDB() {
    try {
        const { data, error } = await supabase
            .from('contestant_positions')
            .select('*')
            .order('rfid_count', { ascending: false });
        
        if (error) throw error;
        
        // Convert to your existing format
        return data.map(contestant => [
            contestant.kick_username,
            contestant.display_name,
            contestant.lat,
            contestant.lng,
            contestant.points,
            contestant.rfid_count,
            contestant.is_cached
        ]);
    } catch (error) {
        console.error('Error loading contestant positions:', error);
        return [];
    }
}

// Log activity for tracking
async function logActivity(type, username, displayName, rfidNumber = null, details = {}) {
    try {
        const { error } = await supabase
            .from('activity_log')
            .insert([{
                activity_type: type,
                kick_username: username,
                display_name: displayName,
                rfid_number: rfidNumber,
                details: details
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Real-time subscriptions
function setupRealtimeSubscriptions() {
    // Listen for new RFID discoveries
    supabase
        .channel('rfid-updates')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'rfid_locations' 
        }, (payload) => {
            console.log('New RFID discovered!', payload);
            // Add to local map and update display
            const location = payload.new;
            rfidLocations.set(location.rfid_number, {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lng),
                confirmed: location.confirmed,
                guessCount: location.guess_count,
                rfidId: location.rfid_number,
                manuallyRegistered: location.discovery_method === 'manual',
                autoRegistered: location.discovery_method === 'auto',
                discoveredBy: location.discovered_by
            });
            
            if (rfidMarkers.length > 0) {
                displayRfidLocations();
            }
            
            updateStatus(`🎯 New RFID #${location.rfid_number} discovered!`, 'success');
        })
        .subscribe();

    // Listen for contestant position updates
    supabase
        .channel('position-updates')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'contestant_positions' 
        }, (payload) => {
            console.log('Contestant positions updated');
            // Refresh the map if needed
        })
        .subscribe();
}

// Initialize database integration
async function initializeDatabase() {
    console.log('Initializing Supabase integration...');
    
    // Load initial data
    await loadRfidLocationsFromDB();
    
    // Setup real-time subscriptions
    setupRealtimeSubscriptions();
    
    console.log('Database integration ready!');
}