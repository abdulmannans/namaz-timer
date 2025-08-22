import React from 'react';

const PrayerTimes = ({ prayerTimes }) => {
  if (!prayerTimes) return null;

  const prayerInfo = {
    fajr: { name: 'Fajr', icon: '🕌', description: 'Dawn prayer', color: 'from-blue-400 to-cyan-400' },
    sunrise: { name: 'Sunrise', icon: '🌅', description: 'Sunrise time', color: 'from-yellow-400 to-orange-400' },
    ishraq: { name: 'Ishraq', icon: '☀️', description: 'Post-sunrise prayer', color: 'from-orange-400 to-red-400' },
    chasht: { name: 'Chasht (Duha)', icon: '☀️', description: 'Morning voluntary prayer', color: 'from-red-400 to-pink-400' },
    zawal: { name: 'Zawal', icon: '☀️', description: 'Sun at zenith', color: 'from-pink-400 to-purple-400' },
    dhuhr: { name: 'Dhuhr', icon: '☀️', description: 'Noon prayer', color: 'from-purple-400 to-indigo-400' },
    asr: { name: 'Asr', icon: '☀️', description: 'Afternoon prayer', color: 'from-indigo-400 to-blue-400' },
    maghrib: { name: 'Maghrib', icon: '🕌', description: 'Sunset prayer', color: 'from-blue-400 to-cyan-400' },
    isha: { name: 'Isha', icon: '🌙', description: 'Night prayer', color: 'from-cyan-400 to-teal-400' },
    tahajud: { name: 'Tahajud', icon: '🌙', description: 'Night voluntary prayer', color: 'from-teal-400 to-green-400' }
  };

  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const [prayer, prayerData] of Object.entries(prayerTimes)) {
      // Handle both old format (string) and new format (object)
      const timeString = typeof prayerData === 'string' ? prayerData : prayerData.time;
      
      // Parse time like "5:30 AM" or "12:30 PM"
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) continue;
      
      let hours = parseInt(timeMatch[1]);
      let minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      if (hours * 60 + minutes > currentTime) {
        return prayer;
      }
    }
    return 'fajr'; // Default to Fajr if no next prayer found
  };

  const nextPrayer = getNextPrayer();

  // Function to convert time to minutes for sorting
  const timeToMinutes = (timeString) => {
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return 0;
    
    let hours = parseInt(timeMatch[1]);
    let minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Sort prayer times chronologically
  const sortedPrayerTimes = Object.entries(prayerTimes).sort(([, prayerDataA], [, prayerDataB]) => {
    const timeA = typeof prayerDataA === 'string' ? prayerDataA : prayerDataA.time;
    const timeB = typeof prayerDataB === 'string' ? prayerDataB : prayerDataB.time;
    
    const minutesA = timeToMinutes(timeA);
    const minutesB = timeToMinutes(timeB);
    
    return minutesA - minutesB;
  });

  return (
    <div className="space-y-3">
      {sortedPrayerTimes.map(([prayer, prayerData]) => {
        const isNext = prayer === nextPrayer;
        const prayerDataInfo = prayerInfo[prayer];
        
        // Handle both old format (string) and new format (object)
        const timeString = typeof prayerData === 'string' ? prayerData : prayerData.time;
        const startTime = typeof prayerData === 'object' ? prayerData.start : null;
        const endTime = typeof prayerData === 'object' ? prayerData.end : null;
        
        return (
          <div 
            key={prayer} 
            className={`bg-gradient-to-r ${prayerDataInfo.color} rounded-2xl p-4 flex items-center justify-between shadow-lg transform transition-all duration-200 hover:scale-105 ${
              isNext ? 'ring-4 ring-yellow-300 shadow-2xl scale-105' : ''
            }`}
          >
            <div className="flex items-center">
              <span className="text-3xl mr-3 drop-shadow-lg">{prayerDataInfo.icon}</span>
              <div>
                <div className="font-bold text-white text-lg">{prayerDataInfo.name}</div>
                {prayerDataInfo.description && (
                  <div className="text-xs text-white/80">{prayerDataInfo.description}</div>
                )}
                {startTime && endTime && (
                  <div className="text-xs text-white/70">
                    {startTime} - {endTime}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-2xl text-white drop-shadow-lg">{timeString}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PrayerTimes;