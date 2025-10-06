import React, { useState, useEffect, useRef } from 'react';
import { POLL_INTERVAL, lerp, projectToCanvas, drawAirplane } from '../utils/canvas';

const MapComponent = ({ flights, prevFlights, bbox, lastUpdateTimestamp }) => {
    
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const animationRef = useRef();

    // 1. Dynamic Resizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setCanvasSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []); 
    
    // 2. Drawing and Animation Logic (Phase 3.1)
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvasSize;

        if (width === 0 || height === 0) return;
        
        const scale = window.devicePixelRatio || 1;
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.scale(scale, scale);

        const prevFlightMap = new Map(prevFlights.map(f => [f.icao24, f]));
        
        let startTime = 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            const t = Math.min(1, elapsed / POLL_INTERVAL); 

            // --- Clear Canvas and Draw Base Map ---
            ctx.fillStyle = '#f0f4f8'; 
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#60a5fa'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height); 

            ctx.font = "20px Inter";
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'center';
            ctx.fillText("Canvas Map: Tracking Live Flight Movement", width / 2, height / 2);

            // --- Draw Flight Markers ---
            flights.forEach(currentFlight => {
                const prevFlight = prevFlightMap.get(currentFlight.icao24);

                let interpolatedLat = currentFlight.lat;
                let interpolatedLon = currentFlight.lon;
                let interpolatedHeading = currentFlight.heading;

                if (prevFlight && t < 1) {
                    // Interpolate position
                    interpolatedLat = lerp(prevFlight.lat, currentFlight.lat, t);
                    interpolatedLon = lerp(prevFlight.lon, currentFlight.lon, t);
                    
                    // Simple heading interpolation
                    interpolatedHeading = lerp(prevFlight.heading, currentFlight.heading, t);
                }

                const { x, y } = projectToCanvas(interpolatedLat, interpolatedLon, bbox, width, height);
                
                // Draw airplane, using interpolated position and heading
                drawAirplane(ctx, x, y, interpolatedHeading, currentFlight.callsign);
            });

            // Continue animation if the transition hasn't finished (t < 1)
            if (t < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationRef.current);

    }, [flights, prevFlights, canvasSize, bbox, lastUpdateTimestamp]); 
    
    return (
        <div ref={containerRef} className="h-full w-full">
            <canvas id="flight-canvas" ref={canvasRef} className="h-full w-full block"></canvas>
        </div>
    );
};

export default MapComponent;
