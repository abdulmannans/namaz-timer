import React, { useState, useEffect } from 'react';

const LocationSettings = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Check if we already have stored location data
    const storedLocation = localStorage.getItem('namazTimerLocation');
    const storedPrayerTimes = localStorage.getItem('namazTimerPrayerTimes');
    
    if (storedLocation && storedPrayerTimes) {
      try {
        const locationData = JSON.parse(storedLocation);
        const prayerTimesData = JSON.parse(storedPrayerTimes);
        
        setLocation(locationData);
        setPermissionGranted(true);
        onLocationUpdate(prayerTimesData, locationData);
        return;
      } catch (err) {
        // Clear invalid stored data
        localStorage.removeItem('namazTimerLocation');
        localStorage.removeItem('namazTimerPrayerTimes');
      }
    }

    // Automatically request location on component mount
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Request location permission
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setPermissionGranted(true);
      
      // Store location in localStorage
      localStorage.setItem('namazTimerLocation', JSON.stringify({ latitude, longitude }));
      
      // Fetch prayer times for this location
      await fetchPrayerTimes(latitude, longitude);
      
    } catch (err) {
      setError(err.message);
      setPermissionGranted(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerTimes = async (latitude, longitude) => {
    try {
      // Using the Aladhan API (free prayer times API)
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${Date.now() / 1000}?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.data) {
        const timings = data.data.timings;
        
        // Convert main prayer times to 12-hour format
        const mainPrayerTimes = {
          fajr: formatTime(timings.Fajr),
          sunrise: formatTime(timings.Sunrise),
          dhuhr: formatTime(timings.Dhuhr),
          asr: formatTime(timings.Asr),
          maghrib: formatTime(timings.Maghrib),
          isha: formatTime(timings.Isha)
        };

        // Calculate additional prayer times using the original 24-hour format from API
        const additionalTimes = {
          ishraq: calculateIshraq(timings.Sunrise),
          chasht: calculateChasht(timings.Sunrise),
          zawal: calculateZawal(timings.Dhuhr),
          tahajud: '3:00 AM'
        };
        
        // Calculate start and end times for all prayers according to Hanafi fiqh
        const prayerTimesWithWindows = calculatePrayerWindows({
          ...mainPrayerTimes,
          ...additionalTimes
        }, timings);
        
        // Store prayer times in localStorage
        localStorage.setItem('namazTimerPrayerTimes', JSON.stringify(prayerTimesWithWindows));

        // Update parent component with prayer times
        onLocationUpdate(prayerTimesWithWindows, { latitude, longitude });
      }
    } catch (err) {
      setError('Failed to fetch prayer times: ' + err.message);
    }
  };

  const formatTime = (timeString) => {
    // Convert "HH:MM" format to 12-hour format
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateIshraq = (sunriseTime) => {
    // sunriseTime is in "HH:MM" format (e.g., "06:21")
    const [hours, minutes] = sunriseTime.split(':').map(Number);
    
    // Add 20 minutes
    let newMinutes = minutes + 20;
    let newHours = hours;
    
    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }
    
    // Format to 12-hour
    const date = new Date();
    date.setHours(newHours, newMinutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateChasht = (sunriseTime) => {
    // sunriseTime is in "HH:MM" format (e.g., "06:21")
    const [hours, minutes] = sunriseTime.split(':').map(Number);
    
    // Add 2.5 hours
    let newHours = hours + 2;
    let newMinutes = minutes + 30;
    
    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }
    
    // Format to 12-hour
    const date = new Date();
    date.setHours(newHours, newMinutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateZawal = (dhuhrTime) => {
    // dhuhrTime is in "HH:MM" format (e.g., "12:41")
    const [hours, minutes] = dhuhrTime.split(':').map(Number);
    
    // Subtract 15 minutes
    let newMinutes = minutes - 15;
    let newHours = hours;
    
    if (newMinutes < 0) {
      newHours -= 1;
      newMinutes += 60;
    }
    
    // Format to 12-hour
    const date = new Date();
    date.setHours(newHours, newMinutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePrayerWindows = (prayerTimes, rawTimings) => {
    const prayerWindows = {};
    
    // Helper function to add minutes to a time string
    const addMinutesToTime = (timeString, minutesToAdd) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      let newMinutes = minutes + minutesToAdd;
      let newHours = hours;
      
      while (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
      }
      while (newMinutes < 0) {
        newHours -= 1;
        newMinutes += 60;
      }
      
      if (newHours >= 24) newHours -= 24;
      if (newHours < 0) newHours += 24;
      
      const date = new Date();
      date.setHours(newHours, newMinutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Helper function to format time from raw API data
    const formatRawTime = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Define prayer windows with fixed durations (no overlapping)
    prayerWindows.fajr = {
      time: prayerTimes.fajr,
      start: addMinutesToTime(rawTimings.Fajr, -15),
      end: formatRawTime(rawTimings.Sunrise)
    };

    prayerWindows.sunrise = {
      time: prayerTimes.sunrise,
      start: addMinutesToTime(rawTimings.Sunrise, -5),
      end: addMinutesToTime(rawTimings.Sunrise, 5)
    };

    prayerWindows.ishraq = {
      time: prayerTimes.ishraq,
      start: addMinutesToTime(rawTimings.Sunrise, 20),
      end: addMinutesToTime(rawTimings.Sunrise, 80) // 1 hour window
    };

    prayerWindows.chasht = {
      time: prayerTimes.chasht,
      start: addMinutesToTime(rawTimings.Sunrise, 150), // 2.5 hours after sunrise
      end: addMinutesToTime(rawTimings.Sunrise, 210) // 3.5 hours after sunrise (1 hour window)
    };

    prayerWindows.zawal = {
      time: prayerTimes.zawal,
      start: addMinutesToTime(rawTimings.Dhuhr, -20),
      end: addMinutesToTime(rawTimings.Dhuhr, -5)
    };

    prayerWindows.dhuhr = {
      time: prayerTimes.dhuhr,
      start: formatRawTime(rawTimings.Dhuhr),
      end: formatRawTime(rawTimings.Asr)
    };

    prayerWindows.asr = {
      time: prayerTimes.asr,
      start: formatRawTime(rawTimings.Asr),
      end: formatRawTime(rawTimings.Maghrib)
    };

    prayerWindows.maghrib = {
      time: prayerTimes.maghrib,
      start: formatRawTime(rawTimings.Maghrib),
      end: formatRawTime(rawTimings.Isha)
    };

    prayerWindows.isha = {
      time: prayerTimes.isha,
      start: formatRawTime(rawTimings.Isha),
      end: addMinutesToTime(rawTimings.Fajr, 1440) // Next day's Fajr
    };

    prayerWindows.tahajud = {
      time: prayerTimes.tahajud,
      start: addMinutesToTime(rawTimings.Isha, 60), // 1 hour after Isha
      end: formatRawTime(rawTimings.Fajr)
    };
    
    return prayerWindows;
  };

  const refreshLocation = () => {
    // Clear stored data and request fresh location
    localStorage.removeItem('namazTimerLocation');
    localStorage.removeItem('namazTimerPrayerTimes');
    setLocation(null);
    setPermissionGranted(false);
    requestLocationPermission();
  };

  if (permissionGranted && !error) {
    return (
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30 shadow-lg">
        <div className="text-sm text-white/90 mb-2">
          Location: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
        </div>
        <button
          onClick={refreshLocation}
          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg text-sm transition-all duration-200 shadow-lg font-semibold"
        >
          Refresh Location
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 backdrop-blur-md rounded-2xl p-4 text-center border border-white/30 shadow-lg">
      <p className="text-white/90 mb-3 text-sm">
        {loading ? 'Requesting location...' : 'Enable location access to get prayer times'}
      </p>
      
      {!loading && !permissionGranted && (
        <button
          onClick={requestLocationPermission}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
        >
          Grant Location Access
        </button>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-500/30 border border-red-400/50 rounded-lg">
          <p className="text-white text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSettings;