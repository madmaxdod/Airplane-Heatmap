// Polling interval used for smooth animation (15 seconds)
export const POLL_INTERVAL = 15000; 

/**
 * Simple utility function for linear interpolation (used for smooth movement).
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Simple Mercator-like projection utility to convert Lat/Lon to Canvas X/Y.
 */
export const projectToCanvas = (lat, lon, bbox, width, height) => {
    const latRange = bbox.lamax - bbox.lamin;
    const lonRange = bbox.lomax - bbox.lomin;

    const normalizedLon = (lon - bbox.lomin) / lonRange;
    const normalizedLat = (lat - bbox.lamin) / latRange;

    const x = normalizedLon * width;
    const y = height * (1 - normalizedLat); 
    
    return { x, y };
};

/**
 * Draws a simple airplane shape on the canvas, rotated by its heading.
 */
export const drawAirplane = (ctx, x, y, heading, callsign) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((heading * Math.PI / 180)); 

    ctx.fillStyle = '#3B82F6'; 
    ctx.strokeStyle = '#1E3A8A'; 
    ctx.lineWidth = 1.5;

    // Draw a small triangle (simplified airplane shape)
    ctx.beginPath();
    ctx.moveTo(0, -10); // Nose
    ctx.lineTo(5, 10);  // Right wing
    ctx.lineTo(-5, 10); // Left wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore context to original rotation
    
    // Draw callsign label
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.fillText(callsign, x, y - 15); 
};

/**
 * Parses the raw array response from the OpenSky API into clean objects.
 */
export const parseOpenSkyData = (rawStates) => {
    if (!rawStates || !rawStates.states) {
        console.warn("OpenSky API returned no state data or response was malformed.");
        return [];
    }
    
    return rawStates.states.map(s => ({
        icao24: s[0],
        callsign: s[1] ? s[1].trim() : 'N/A',
        country: s[2],
        lat: s[6], // Latitude is index 6
        lon: s[5], // Longitude is index 5
        altitude: s[7] ? Math.round(s[7] / 0.3048) : null, // Convert meters to feet (approx.)
        velocity: s[9] ? Math.round(s[9] * 2.23694) : null, // Convert m/s to mph (approx.)
        heading: s[10] || 0, // True track
        lastContact: s[4] // Unix timestamp
    })).filter(flight => flight.lat !== null && flight.lon !== null && flight.altitude !== null);
};
