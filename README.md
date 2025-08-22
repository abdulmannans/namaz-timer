# 🕌 Namaz Timer - Prayer Times App

A beautiful, modern prayer times application built with React that provides accurate prayer times based on your location, following Hanafi fiqh methodology.

## ✨ Features

### 🕐 Prayer Times
- **Core Prayers**: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
- **Additional Prayers**: Ishraq, Chasht (Duha), Zawal, Tahajud
- **Prayer Windows**: Start and end times for each prayer period
- **Chronological Order**: Prayers displayed in proper time sequence

### �� Location Services
- **Automatic Location Detection**: Uses browser geolocation API
- **Local Storage**: Remembers your location and prayer times
- **No Repeated Permissions**: One-time location grant
- **Real-time Updates**: Fetches fresh prayer times when needed

### 🎨 Modern UI/UX
- **Beautiful Gradients**: Vibrant, colorful design
- **Responsive Design**: Works on all devices
- **Real-time Clock**: Current time and date display
- **Next Prayer Countdown**: Shows time remaining until next prayer
- **Prayer Highlighting**: Current/next prayer is highlighted

### �� Technical Features
- **React 18**: Built with modern React features
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first CSS framework
- **Local Storage**: Persistent data storage
- **API Integration**: Aladhan prayer times API

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/namaz-timer.git
   cd namaz-timer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 📱 Usage

### First Time Setup
1. **Grant Location Permission**: Click "Grant Location Access" when prompted
2. **Automatic Setup**: The app will automatically fetch prayer times for your location
3. **Ready to Use**: Your prayer times are now displayed and stored locally

### Daily Use
- **View Prayer Times**: All prayer times are displayed in chronological order
- **Check Next Prayer**: See which prayer is coming next and countdown timer
- **Prayer Windows**: Each prayer shows its start and end time
- **Refresh Data**: Click "Refresh Location" to get updated prayer times

### Prayer Windows Explained
- **Fajr**: From true dawn until sunrise
- **Dhuhr**: From Dhuhr time until Asr begins
- **Asr**: From Asr time until sunset
- **Maghrib**: From sunset until Isha
- **Isha**: From Isha until next Fajr
- **Ishraq**: 20 minutes after sunrise (voluntary prayer)
- **Chasht**: 2.5 hours after sunrise (voluntary prayer)
- **Zawal**: 15 minutes before Dhuhr (avoid prayer time)
- **Tahajud**: Night voluntary prayer

## ��️ Project Structure

``` 