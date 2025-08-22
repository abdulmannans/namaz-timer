import React, { useState, useEffect } from 'react';

const NextPrayerCountdown = ({ prayerTimes }) => {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!prayerTimes) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const prayerTimesArray = Object.entries(prayerTimes).map(([prayer, prayerData]) => {
        // Handle both old format (string) and new format (object)
        const timeString = typeof prayerData === 'string' ? prayerData : prayerData.time;
        
        // Parse time like "5:30 AM" or "12:30 PM"
        const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) return { prayer, time: 0 };
        
        let hours = parseInt(timeMatch[1]);
        let minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return { prayer, time: hours * 60 + minutes };
      });

      let next = null;
      for (const prayer of prayerTimesArray) {
        if (prayer.time > currentTime) {
          next = prayer;
          break;
        }
      }

      if (!next) {
        next = prayerTimesArray[0]; // Next day's Fajr
      }

      setNextPrayer(next.prayer);
    };

    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date();
      const prayerData = prayerTimes[nextPrayer];
      
      // Handle both old format (string) and new format (object)
      const timeString = typeof prayerData === 'string' ? prayerData : prayerData.time;
      
      // Parse time like "5:30 AM" or "12:30 PM"
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return;
      
      let hours = parseInt(timeMatch[1]);
      let minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const prayerTime = new Date(now);
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime <= now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      const diff = prayerTime - now;
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown(`${hoursLeft}h ${minutesLeft}m remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, prayerTimes]);

  if (!nextPrayer) return null;

  return (
    <div className="text-center">
      <h3 className="text-sm mb-2 text-yellow-200">Next Prayer</h3>
      <div className="text-2xl font-bold mb-2 capitalize text-white drop-shadow-lg">{nextPrayer}</div>
      <div className="text-sm text-yellow-100">{countdown}</div>
    </div>
  );
};

export default NextPrayerCountdown;