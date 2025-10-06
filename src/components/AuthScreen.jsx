import React, { useState } from 'react';

const AuthScreen = ({ setCredentials, isAuthenticating, apiError }) => {
    const [id, setId] = useState('');
    const [secret, setSecret] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (id && secret) {
            setCredentials(id, secret);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700">OpenSky API Login</h2>
                <p className="text-center text-gray-500">Enter your OAuth 2.0 Client Credentials to begin tracking.</p>
                
                {apiError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center break-words">
                        **Authentication Failed:** {apiError}
                        <p className="font-semibold mt-1">Please re-enter your credentials.</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Client ID</label>
                        <input
                            id="client_id"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="client_secret" className="block text-sm font-medium text-gray-700">Client Secret</label>
                        <input
                            id="client_secret"
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex justify-center items-center"
                    >
                        {isAuthenticating ? (
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : 'Log In & Start Tracking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
