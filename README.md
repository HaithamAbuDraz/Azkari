# Azkari (أذكاري — روضة الأذكار والأدعية)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Azkari** is a modern Islamic web application built with **React** and **Vite**, bringing together morning and evening supplications (Azkar), post‑prayer remembrances, sleep duas, and authentic supplications from the Quran and Sunnah. The app features **interactive counters**, **real-time progress tracking**, a **digital tasbih with SVG progress ring**, **audio-visual milestone celebrations**, and a **fully responsive right-to-left (RTL) Arabic interface**.

🔗 **Live Demo:** [my‑azkari.vercel.app](https://my-azkari.vercel.app/)

---

## ✨ Features

### 📿 Core Azkar Features

| Feature | Description |
|---------|-------------|
| **Morning Azkar** | Complete collection of morning supplications with authentic references from the Quran and Sunnah |
| **Evening Azkar** | Evening protections and remembrances for spiritual security |
| **Post-Prayer Azkar** | Authentic supplications recited after the five daily prayers |
| **Sleep Azkar** | Bedtime remembrances and waking-up supplications |
| **Various Azkar** | General daily remembrances for all occasions and situations |
| **Interactive Counters** | Click card or decrement button to count down each zikr until completion |
| **Reset Functionality** | Individual reset for each zikr or full category reset with one click |
| **Visual Progress Tracking** | Real-time progress bars showing completion percentage for each category |
| **Completion Celebration** | Toast notifications with star icons when completing a zikr |
| **Category Completion Trophy** | Special celebration when all zikr in a category are completed |
| **Completed Card Styling** | Visual distinction for completed azkar with disabled counters |

### 🎯 Digital Tasbih Features

| Feature | Description |
|---------|-------------|
| **Multiple Zikr Options** | 8 pre-defined tasbih options including: سبحان الله, الحمد لله, الله أكبر, لا إله إلا الله, أستغفر الله, الصلاة على النبي, سبحان الله وبحمده, حسبي الله |
| **Custom Targets** | Set custom targets for any zikr through the input field |
| **Lap Tracking** | Tracks completed cycles when exceeding target count |
| **Visual Ring Progress** | Circular SVG progress ring showing completion percentage toward current target |
| **Milestone Celebrations** | Special notifications at key milestones (33, 66, 99, 100, 200, 300, 500, 1000) |
| **Milestone Grid Display** | Visual grid showing which milestones have been reached |
| **Haptic Feedback** | Device vibration on each tap (via Vibration API if supported) |
| **Ripple Effect Animation** | Visual ripple effect when tapping the counter button |
| **Number Bump Animation** | Smooth animation when count increments |
| **Session History** | Saves last 10 tasbih sessions to localStorage with timestamps |
| **Undo Functionality** | Press Backspace or click undo to revert last increment |
| **Quick Reset** | Reset counter with 'R' key or reset button |

### ⌨️ Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| **Spacebar** | Increment digital tasbih (when Tasbih tab is active) |
| **Backspace** | Undo last increment |
| **R Key** | Reset tasbih counter |

### 🌙 Smart Features

| Feature | Description |
|---------|-------------|
| **Time-Based Auto Suggestion** | Automatically suggests appropriate tab based on time of day (Morning: 5-10 AM, Evening: 5-9 PM, Sleep: 9 PM-5 AM) |
| **Live Clock Display** | Shows current time, Islamic period (الصباح/الظهر/العصر/المغرب/الليل), and Hijri date |
| **Automatic Tab Switching** | Initially opens the most relevant zikr category based on current time |

### 🎨 User Experience

| Feature | Description |
|---------|-------------|
| **Dark/Light Theme Toggle** | Manual theme switching with system preference detection |
| **Persistent Theme** | Saves theme preference to localStorage |
| **Mobile Responsive Navigation** | Hamburger menu with slide-out navigation for mobile devices |
| **Smooth Scroll to Top** | Floating button appears after scrolling 400px |
| **Toast Notifications** | Non-intrusive feedback for all user actions |
| **ARIA Accessibility** | Screen reader support with proper aria labels and roles |
| **RTL Support** | Full right-to-left layout for Arabic language |
| **Dynamic Page Titles** | Browser tab updates based on active category |
| **Dynamic Meta Descriptions** | SEO-friendly descriptions for each section |
| **Persistent State** | Counters maintain state during session |

---

## 🛠️ Tech Stack

- **React 19** – Component-based reactive UI architecture with modern hooks.
- **Vite 6** – Next-generation lightning-fast frontend tooling and build pipeline.
- **CSS3** – Modular variables, glassmorphism, responsive grid & flexbox layouts.
- **Google Fonts & FontAwesome** – Tajawal & Amiri typography with FontAwesome 6 icons.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm, yarn, or pnpm

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/HaithamAbuDraz/Azkari.git
   cd Azkari
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```bash
Azkari/
├── public/                 # Static public assets (icons, favicon)
│   ├── assets/icons/
│   └── icon.png
├── src/
│   ├── components/         # Modular React components
│   │   ├── AzkarCard.jsx   # Individual zikr card with counters
│   │   ├── AzkarPanel.jsx  # Category grid with progress bar
│   │   ├── Footer.jsx      # Footer with hadith & links
│   │   ├── Header.jsx      # Sticky navbar & theme switcher
│   │   ├── Hero.jsx        # Hero section with live clock
│   │   ├── MobileNav.jsx   # Responsive mobile drawer
│   │   ├── ScrollTop.jsx   # Back-to-top floating button
│   │   ├── TasbihPanel.jsx # Digital tasbih with SVG ring & history
│   │   └── Toast.jsx       # Notification toast popup
│   ├── data/
│   │   └── azkar-data.json # Authentic Azkar database
│   ├── App.jsx             # Root application state & router logic
│   └── main.jsx            # Application entry point
├── assets/
│   ├── css/styles.css      # Core styles & themes
│   └── Data/               # Original data backup
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

---

## 🙏 Acknowledgments

- All adhkar are sourced from authentic Hadith collections (Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, etc.)
- Inspired by the daily spiritual needs of Muslims worldwide.
- Built with ❤️ using React.
