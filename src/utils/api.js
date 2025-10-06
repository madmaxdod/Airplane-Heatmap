// OpenSky API Endpoints
const OPENSKY_TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const OPENSKY_DATA_URL = 'https://opensky-network.org/api/states/all';

/**
 * Acquires an OAuth 2.0 Bearer Token from OpenSky using Client Credentials.
 */
export const getAccessToken = async (clientId, clientSecret, setTokenStatus, setApiError, setAccessToken, setTokenExpiryTime) => {
    if (!clientId || !clientSecret) {
        setTokenStatus('failed'); 
        return null;
    }

    setTokenStatus('loading');
    setApiError(null); 
    
    const formBody = new URLSearchParams();
    formBody.append('grant_type', 'client_credentials');
    formBody.append('client_id', clientId); 
    formBody.append('client_secret', clientSecret); 
    
    try {
        const response = await fetch(OPENSKY_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Expires 5 seconds early to ensure no token expiry mid-request
        const expiry = Date.now() + (data.expires_in * 1000) - 5000; 
        setAccessToken(data.access_token);
        setTokenExpiryTime(expiry);
        setTokenStatus('ready');
        return data.access_token; 

    } catch (error) {
        setTokenStatus('failed');
        setApiError(`Auth failed: ${error.message}`);
        setAccessToken(null);
        setTokenExpiryTime(0);
        return null;
    }
};

/**
 * Fetches flight data using the Bearer Token, with built-in retry for rate limits (429).
 */
export const fetchWithRetry = async (url, token, retries = 3) => {
    if (!token) {
        return null;
    }
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 429 && retries > 0) { 
                const retryAfter = response.headers.get('Retry-After') || (32 - (retries * 8)); 
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return fetchWithRetry(url, token, retries - 1);
            }
            
            throw new Error(`Data API failed: Status ${response.status} ${response.statusText}`);
        }
        return response.json();

    } catch (error) {
        throw error; 
    }
};

export { OPENSKY_DATA_URL };
