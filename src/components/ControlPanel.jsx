import React, { useState } from 'react';

const ControlPanel = ({ bbox, setBBox, flightCount, lastUpdate, isFetching, tokenStatus, apiError }) => {
    const [tempBBox, setTempBBox] = useState(bbox);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleInputChange = (e) => {
        setTempBBox({ ...tempBBox, [e.target.name]: parseFloat(e.target.value) || e.target.value });
    };

    const handleApply = () => {
        const { lamin, lomin, lamax, lomax } = tempBBox;
        if (lamin < lamax && lomin < lomax && lamin >= -90 && lamax <= 90 && lomin >= -180 && lomax <= 180) {
            setBBox(tempBBox);
        } else {
            console.error("Invalid Bounding Box coordinates.");
        }
    };

    const formatBBoxValue = (key) => {
        return typeof tempBBox[key] === 'number' ? tempBBox[key].toFixed(4) : tempBBox[key];
    };

    const TokenStatusMessage = () => {
        let text = "";
        let color = "";
        if (tokenStatus === 'loading') {
            text = 'Authorizing...';
            color = 'text-yellow-500';
        } else if (tokenStatus === 'ready') {
            text = 'Authorized (OAuth 2.0)';
            color = 'text-green-500';
        } else {
            text = 'Auth Failed. Re-enter credentials.';
            color = 'text-red-500';
        }
        return <p className={`text-xs font-medium ${color}`}>{text}</p>;
    };

    return (
        <div className={`absolute top-4 right-4 z-10 p-4 rounded-xl shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/90 
                        ${isCollapsed ? 'w-16 h-16' : 'w-72 md:w-80'}`}>
            
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                title={isCollapsed ? "Expand Controls" : "Collapse Controls"}
            >
                {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
            </button>

            {!isCollapsed && (
                <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-indigo-700 border-b pb-2">Flight Tracker Control</h2>

                    {/* Summary */}
                    <div className="text-sm">
                        <p className="font-semibold text-gray-700">Flights Tracked: <span className="text-2xl font-bold text-indigo-500">{flightCount}</span></p>
                        <p className="text-gray-500 mt-1">Last Update: {lastUpdate}</p>
                        {isFetching && <p className="text-yellow-600 italic">Fetching new data...</p>}
                        <TokenStatusMessage />
                        {apiError && (
                             <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs break-words">
                                **API Error:** {apiError}
                             </div>
                        )}
                    </div>

                    {/* Bounding Box Inputs (Phase 2.3) */}
                    <div className="space-y-2 pt-2 border-t">
                        <h3 className="text-md font-semibold text-gray-600">Bounding Box (Lat/Lon)</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {['lamin', 'lamax', 'lomin', 'lomax'].map(key => (
                                <div key={key}>
                                    <label htmlFor={key} className="block text-gray-500 capitalize">{key.replace('l', 'Lat/Lon ').replace('min', 'Min').replace('max', 'Max')}</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        name={key}
                                        id={key}
                                        value={formatBBoxValue(key)}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleApply}
                            className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                            disabled={isFetching}
                        >
                            {'Apply & Track'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
