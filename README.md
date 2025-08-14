# Kick Scavenger Hunt Dashboard

A comprehensive real-time dashboard for tracking Ice Poseidon's Kick.com scavenger hunt event.

## Features

### 🗺️ **Live Location Tracking**
- Real-time live streamer locations with GPS state detection
- Smart location caching when GPS is disabled
- Profile picture markers for individual streamers
- Cluster markers for groups at same location

### 🏷️ **RFID Location System**
- Discover RFID locations from viewer guess data
- Manual RFID registration via right-click context menu
- localStorage caching for persistent data (6-hour expiry)
- Visual distinction: Blue (manual), Green (confirmed), Orange (estimated)

### 🔥 **Hot Zone Analysis**
- Viewer guess clustering to identify active hunt locations
- Blinking priority indicators for high-activity zones
- Clickable alert banners for definitive hot zones
- Real-time hot zone detection and notifications

### 🔍 **Advanced Search**
- Search live streamers by name
- Search RFID locations by number (1-50)
- Search nearby places and landmarks
- Coordinate-based location search

### 🖱️ **Context Menu System**
- Copy coordinates to clipboard
- Navigate to location (opens device's maps app)
- Add waypoints and measure distances
- Register RFID locations manually
- Center map and search nearby

### 📊 **Live Data Dashboard**
- Live streamer leaderboard with points and RFID counts
- Real-time statistics and activity tracking
- GPS state indicators and cache status
- Auto-refresh every 5 seconds

## Usage

### Basic Navigation
1. Open `index.html` in any modern web browser
2. The map loads centered on Austin, Texas
3. Live streamers appear as markers (profile pics or numbered clusters)
4. Use controls on the right to toggle features

### RFID Locations
1. Click "Show RFID Locations" to discover/display RFID markers
2. Search specific RFIDs by typing numbers (e.g., "25")
3. Right-click anywhere to manually register RFID locations
4. Blue markers = manual, Green = confirmed, Orange = estimated

### Hot Zone Analysis
1. Toggle "Guess Analysis" to show viewer guess hot zones
2. 🔥 Fire markers indicate high viewer activity areas
3. Large blinking markers = definitive locations (>10 recent guesses)
4. Click hot zone alert banners to jump to active areas

### Mobile Navigation
1. Right-click any location and select "🧭 Navigate Here"
2. Automatically opens your device's maps app with directions
3. Perfect for field use during the scavenger hunt

## Technical Details

### APIs Used
- `viewerapi.iceposeidon.com/contestant.locations` - Live streamer positions
- `viewerapi.iceposeidon.com/viewer.guesses.rfid.{id}` - Viewer guess data
- `kick.com/api/v1/channels/{username}` - Profile pictures
- `nominatim.openstreetmap.org` - Place search

### Data Persistence
- RFID locations cached in browser localStorage
- 6-hour cache expiry for fresh data
- Manual registrations permanently saved
- Profile pictures cached in memory

### Browser Compatibility
- Modern browsers with ES6+ support
- Mobile-friendly responsive design
- Works offline after initial load (cached data)
- Cross-platform navigation integration

## Development

The dashboard is a single HTML file with embedded CSS and JavaScript:
- **Leaflet.js** for interactive mapping
- **OpenStreetMap** tiles (no API key required)
- **localStorage** for data persistence
- **Pure vanilla JavaScript** - no frameworks

## Deployment

Simply serve the `index.html` file from any web server:
```bash
python -m http.server 8000
# or
npx serve .
# or upload to any static hosting
```

---

## Live Demo

🌐 **https://hattybin.github.io/kickscavdash/**

Built for the Ice Poseidon Kick.com scavenger hunt community 🎯