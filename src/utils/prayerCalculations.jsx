// Prayer calculation utilities based on astronomical calculations

export function calculatePrayerTimes(latitude, longitude, date) {
    const lat = latitude * Math.PI / 180
    const lng = longitude * Math.PI / 180
    
    // Julian day
    const julianDay = getJulianDay(date)
    
    // Solar declination
    const declination = getSolarDeclination(julianDay)
    
    // Equation of time
    const eqTime = getEquationOfTime(julianDay)
    
    // Prayer angles (in degrees)
    const angles = {
      fajr: -18,    // Dawn angle
      sunrise: -0.833, // Sunrise angle (accounting for refraction)
      dhuhr: 0,     // Solar noon
      asr: -1,      // Asr angle (will be calculated)
      maghrib: -0.833, // Sunset angle
      isha: -17     // Night angle
    }
    
    const times = {}
    
    // Calculate Fajr
    times.fajr = getPrayerTime(lat, lng, declination, eqTime, angles.fajr, date, true)
    
    // Calculate Sunrise
    const sunrise = getPrayerTime(lat, lng, declination, eqTime, angles.sunrise, date, true)
    
    // Calculate Dhuhr (Solar noon)
    times.dhuhr = getSolarNoon(lng, eqTime, date)
    
    // Calculate Asr
    const asrAngle = getAsrAngle(lat, declination)
    times.asr = getPrayerTime(lat, lng, declination, eqTime, asrAngle, date, false)
    
    // Calculate Maghrib
    times.maghrib = getPrayerTime(lat, lng, declination, eqTime, angles.maghrib, date, false)
    
    // Calculate Isha
    times.isha = getPrayerTime(lat, lng, declination, eqTime, angles.isha, date, false)
    
    return times
  }
  
  function getJulianDay(date) {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12)
    const y = date.getFullYear() + 4800 - a
    const m = (date.getMonth() + 1) + 12 * a - 3
    
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  }
  
  function getSolarDeclination(julianDay) {
    const n = julianDay - 2451545.0
    const L = (280.460 + 0.9856474 * n) * Math.PI / 180
    const g = (357.528 + 0.9856003 * n) * Math.PI / 180
    const lambda = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180
    
    return Math.asin(Math.sin(23.439 * Math.PI / 180) * Math.sin(lambda))
  }
  
  function getEquationOfTime(julianDay) {
    const n = julianDay - 2451545.0
    const L = (280.460 + 0.9856474 * n) * Math.PI / 180
    const g = (357.528 + 0.9856003 * n) * Math.PI / 180
    const lambda = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180
    
    const alpha = Math.atan2(Math.cos(23.439 * Math.PI / 180) * Math.sin(lambda), Math.cos(lambda))
    const eqTime = 4 * (L - alpha) * 180 / Math.PI
    
    return eqTime
  }
  
  function getPrayerTime(lat, lng, declination, eqTime, angle, date, isMorning) {
    const hourAngle = Math.acos(
      (Math.sin(angle * Math.PI / 180) - Math.sin(lat) * Math.sin(declination)) /
      (Math.cos(lat) * Math.cos(declination))
    )
    
    const timeOffset = isMorning ? -hourAngle * 180 / Math.PI / 15 : hourAngle * 180 / Math.PI / 15
    const solarNoonTime = 12 - lng * 180 / Math.PI / 15 - eqTime / 60
    const prayerTime = solarNoonTime + timeOffset
    
    const hours = Math.floor(prayerTime)
    const minutes = Math.floor((prayerTime - hours) * 60)
    
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    
    return result
  }
  
  function getSolarNoon(lng, eqTime, date) {
    const solarNoonTime = 12 - lng * 180 / Math.PI / 15 - eqTime / 60
    const hours = Math.floor(solarNoonTime)
    const minutes = Math.floor((solarNoonTime - hours) * 60)
    
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    
    return result
  }
  
  function getAsrAngle(lat, declination) {
    const shadowRatio = 1 + Math.tan(Math.abs(lat - declination))
    return -Math.atan(1 / shadowRatio) * 180 / Math.PI
  }
  
  export function formatTime(date) {
    if (!date) return '--:--'
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  export function getCurrentPrayer(prayerTimes, currentTime) {
    if (!prayerTimes || Object.keys(prayerTimes).length === 0) return null
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    const now = currentTime.getTime()
    
    for (let i = 0; i < prayers.length; i++) {
      const prayerTime = prayerTimes[prayers[i]]?.getTime()
      const nextPrayerTime = i < prayers.length - 1 
        ? prayerTimes[prayers[i + 1]]?.getTime()
        : prayerTimes.fajr?.getTime() + 24 * 60 * 60 * 1000 // Next day's Fajr
      
      if (prayerTime && now >= prayerTime && now < nextPrayerTime) {
        return prayers[i]
      }
    }
    
    // If current time is before Fajr, it's still Isha time
    return 'isha'
  }
  
  export function getNextPrayer(prayerTimes, currentTime) {
    if (!prayerTimes || Object.keys(prayerTimes).length === 0) return null
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    const now = currentTime.getTime()
    
    // Find the next prayer today
    for (const prayer of prayers) {
      const prayerTime = prayerTimes[prayer]
      if (prayerTime && prayerTime.getTime() > now) {
        return {
          name: prayer,
          time: prayerTime
        }
      }
    }
    
    // If no prayer left today, return tomorrow's Fajr
    const tomorrowFajr = new Date(prayerTimes.fajr)
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
    
    return {
      name: 'fajr',
      time: tomorrowFajr
    }
  }
  
  export function getTimeUntilNextPrayer(prayerTimes, currentTime) {
    const nextPrayer = getNextPrayer(prayerTimes, currentTime)
    if (!nextPrayer) return null
    
    const timeDiff = nextPrayer.time.getTime() - currentTime.getTime()
    
    if (timeDiff <= 0) return null
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
    
    return {
      prayer: nextPrayer.name,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(timeDiff / 1000)
    }
  }