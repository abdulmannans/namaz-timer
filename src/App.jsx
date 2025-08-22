import React, { useState, useEffect } from 'react';
import CurrentTime from './components/CurrentTime';
import PrayerTimes from './components/PrayerTimes';
import NextPrayerCountdown from './components/NextPrayerCountdown';
import LocationSettings from './components/LocationSettings';

function App() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState('');

  const handleLocationUpdate = (newPrayerTimes, newLocation) => {
    setPrayerTimes(newPrayerTimes);
    setLocation(newLocation);
    setError(null);
    
    // Get city name from coordinates
    if (newLocation) {
      fetchCityName(newLocation.latitude, newLocation.longitude);
    }
  };

  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      if (data.city) {
        setCityName(data.city);
      }
    } catch (err) {
      console.log('Could not fetch city name');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
      <div className="text-white text-xl">Loading prayer times...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Main Prayer Times Card */}
        <div className="bg-white/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/30">
          
          {/* Header Section with Vibrant Gradient */}
          <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 p-6 text-center">
            <h1 className="text-2xl font-bold mb-2 text-white">Prayer Times</h1>
            <p className="text-sm text-white/90 mb-4">Hanafi Method</p>
            <CurrentTime />
          </div>

          {/* Location & Next Prayer Section */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-center">
            {cityName && (
              <div className="flex items-center justify-center mb-4">
                <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-yellow-100">{cityName}</span>
              </div>
            )}
            
            {prayerTimes && (
              <NextPrayerCountdown prayerTimes={prayerTimes} />
            )}
          </div>

          {/* Prayer Times List */}
          {prayerTimes && (
            <div className="bg-gradient-to-b from-indigo-500/50 to-purple-600/50 p-6">
              <PrayerTimes prayerTimes={prayerTimes} />
              
              {/* Debug section - remove this later */}
              {/* <div className="mt-4 p-3 bg-black/20 rounded-lg">
                <h3 className="text-white font-bold mb-2">Debug Info:</h3>
                <pre className="text-xs text-white overflow-auto">
                  {JSON.stringify(prayerTimes, null, 2)}
                </pre>
              </div> */}
            </div>
          )}
        </div>

        {/* Location Settings */}
        <div className="mt-6">
          <LocationSettings onLocationUpdate={handleLocationUpdate} />
        </div>
      </div>
    </div>
  );
}

export default App;