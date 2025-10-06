import React, { useState, useEffect, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import MapComponent from './components/MapComponent';
import ControlPanel from './components/ControlPanel';
import ErrorModal from './components/ErrorModal'; // <--- NEW IMPORT
import { getAccessToken, fetchWithRetry, OPENSKY_DATA_URL } from './utils/api';
import { parseOpenSkyData, POLL_INTERVAL } from './utils/canvas';


const App = () => {
    // Credentials and State
    const [clientId, setClientId] = useState(null); 
    const [clientSecret, setClientSecret] = useState(null); 
    
    const [flights, setFlights] = useState([]);
    const [prevFlights, setPrevFlights] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [lastUpdate, setLastUpdate] = useState("Never");
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now()); 
    
    const [accessToken, setAccessToken] = useState(null);
    const [tokenExpiryTime, setTokenExpiryTime] = useState(0); 
    const [tokenStatus, setTokenStatus] = useState('uninitialized');
    const [apiError, setApiError] = useState(null); 

    // Initial Bounding Box (Florida/Southeast US)
    const [bbox, setBBox] = useState({
        lamin: 24.5000, 
        lomin: -82.0000, 
        lamax: 31.0000, 
        lomax: -79.0000, 
    });

    const handleLogin = (id, secret) => {
        setClientId(id);
        setClientSecret(secret);
        setApiError(null); 
        setTokenStatus('uninitialized'); 
    };
    
    const handleClearAuthError = () => {
        setApiError(null);
        setClientId(null);
        setClientSecret(null);
        setTokenStatus('uninitialized');
    };
    
    // Utility functions from src/utils/api.js are wrapped in useCallback for dependencies
    const memoizedGetAccessToken = useCallback(() => 
        getAccessToken(clientId, clientSecret, setTokenStatus, setApiError, setAccessToken, setTokenExpiryTime),
        [clientId, clientSecret]
    );

    const memoizedFetchWithRetry = useCallback(async (url, token) => {
        try {
            return await fetchWithRetry(url, token);
        } catch(error) {
            setApiError(error.message);
            throw error; 
        }
    }, [setApiError]);


    // Core Fetching Logic
    const fetchFlights = useCallback(async () => {
        // Clear non-critical errors before fetching
        if (apiError && !apiError.includes('Auth failed')) setApiError(null); 
        
        // 1. Check/Refresh token
        const isTokenExpired = Date.now() >= tokenExpiryTime;
        let tokenToUse = accessToken;

        if (!tokenToUse || isTokenExpired) {
            const newToken = await memoizedGetAccessToken(); 
            if (!newToken) return; 
            tokenToUse = newToken; 
        }
        
        if (!tokenToUse) return;

        setIsFetching(true);
        const { lamin, lomin, lamax, lomax } = bbox;
        const apiUrl = `${OPENSKY_DATA_URL}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
        
        try {
            const rawData = await memoizedFetchWithRetry(apiUrl, tokenToUse);
            
            if (rawData) {
                const processedFlights = parseOpenSkyData(rawData);
                
                setPrevFlights(flights); 
                setFlights(processedFlights); 
                setLastUpdate(new Date().toLocaleTimeString());
                setLastUpdateTimestamp(Date.now()); 
            }

        } catch (error) {
            // Error handling done inside fetchWithRetry
        } finally {
            setIsFetching(false);
        }
        
    }, [bbox, memoizedGetAccessToken, memoizedFetchWithRetry, accessToken, tokenExpiryTime, flights, apiError]); 

    // Polling Mechanism
    useEffect(() => {
        if (!clientId || !clientSecret) return; 

        fetchFlights(); 

        const interval = setInterval(() => {
            if (!isFetching) {
                fetchFlights();
            }
        }, POLL_INTERVAL); 

        return () => clearInterval(interval);
    }, [fetchFlights, isFetching, clientId, clientSecret]); 
    
    // --- Conditional Rendering ---
    
    if (!clientId || !clientSecret || tokenStatus === 'failed') {
        return (
            <AuthScreen 
                setCredentials={handleLogin} 
                isAuthenticating={tokenStatus === 'loading'}
                apiError={apiError} 
            />
        );
    }
    
    // Filter flights for rendering
    const flightsInBounds = flights.filter(f => 
        f.lat >= bbox.lamin && f.lat <= bbox.lamax && 
        f.lon >= bbox.lomin && f.lon <= bbox.lomax
    );

    const prevFlightsForAnimation = prevFlights.filter(prevF => 
        flights.some(currentF => currentF.icao24 === prevF.icao24)
    );

    return (
        <div className="min-h-screen bg-gray-100 font-inter antialiased">
            {/* Header/Title Bar */}
            <header className="p-4 bg-white shadow-lg z-20 sticky top-0">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Global Flight Tracker <span className="text-indigo-600 text-sm italic font-medium">Powered by OpenSky</span>
                </h1>
            </header>

            {/* Main Content Area: Map and Controls */}
            <main className="relative h-[calc(100vh-68px)] w-full p-4 md:p-6"> 
                
                {/* 2.1 Map Integration - Full Coverage */}
                <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl bg-white">
                    <MapComponent 
                        flights={flightsInBounds} 
                        prevFlights={prevFlightsForAnimation} 
                        lastUpdateTimestamp={lastUpdateTimestamp}
                        bbox={bbox}
                    />
                </div>

                {/* 2.3 Control Panel - Floating UI Element */}
                <ControlPanel 
                    bbox={bbox} 
                    setBBox={setBBox} 
                    flightCount={flightsInBounds.length}
                    lastUpdate={lastUpdate}
                    isFetching={isFetching}
                    tokenStatus={tokenStatus}
                    apiError={apiError}
                />
            
                {/* Detailed View Panel */}
                <div className="absolute bottom-6 left-6 z-10 p-4 bg-white/90 rounded-xl shadow-2xl w-72 md:w-80 max-h-48 overflow-y-auto backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Detailed View</h3>
                    {flightsInBounds.slice(0, 3).map(f => (
                        <div key={f.icao24} className="text-xs border-b pb-2 mb-2">
                            <p className="font-semibold text-indigo-600">{f.callsign} ({f.country})</p>
                            <p className="text-gray-500">Alt: {f.altitude}ft | Speed: {f.velocity}mph | Head: {Math.round(f.heading)}°</p>
                        </div>
                    ))}
                    {flightsInBounds.length > 3 && (
                        <p className="text-xs text-gray-400 mt-2">...and {flightsInBounds.length - 3} more flights in view.</p>
                    )}
                </div>

                {/* CRITICAL ERROR MODAL */}
                {apiError && !clientId && !clientSecret && (
                     <ErrorModal 
                        message={apiError} 
                        clearError={handleClearAuthError} 
                     />
                )}
            </main>
        </div>
    );
};

export default App;
