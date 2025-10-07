import React from 'react';

const ErrorModal = ({ message, clearError }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100 opacity-100">
                <div className="flex items-center mb-4">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
                </div>
                
                <p className="text-gray-700 mb-6">
                    The application failed to connect to the OpenSky API. This is usually due to invalid credentials or an expired token.
                </p>

                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-6">
                    <p className="font-mono text-sm text-red-800 break-all">{message}</p>
                </div>
                
                <p className="text-gray-600 mb-6">
                    Please click "Log Out" to return to the authentication screen and re-enter your Client ID and Secret.
                </p>

                <div className="flex justify-end">
                    <button 
                        onClick={clearError} 
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        Log Out and Retry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;
