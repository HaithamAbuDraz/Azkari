# Azkari (أذكاري — روضة الأذكار والأدعية)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Azkari** is a comprehensive Islamic web application that brings together morning and evening supplications (Azkar), post‑prayer remembrances, sleep duas, and a wide collection of authentic supplications from the Quran and Sunnah. The app features **interactive counters**, **progress tracking**, a **digital tasbih**, and a **fully responsive design** – all with a primarily Arabic user interface.

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
| **Interactive Counters** | Click to decrement counter for each zikr until completion |
| **Reset Functionality** | Individual reset for each zikr or full category reset with one click |
| **Visual Progress Tracking** | Progress bars showing completion percentage for each category |
| **Completion Celebration** | Toast notifications with star icons when completing a zikr |
| **Category Completion Trophy** | Special celebration when all zikr in a category are completed |
| **Completed Card Styling** | Visual distinction for completed azkar with disabled counters |

### 🎯 Digital Tasbih Features

| Feature | Description |
|---------|-------------|
| **Multiple Zikr Options** | 8 pre-defined tasbih options including: سبحان الله, الحمد لله, الله أكبر, لا إله إلا الله, أستغفر الله, الصلاة على النبي, سبحان الله وبحمده, حسبي الله |
| **Custom Targets** | Set custom targets for any zikr through the input field |
| **Lap Tracking** | Tracks completed cycles when exceeding target count |
| **Visual Ring Progress** | Circular progress ring showing completion percentage toward current target |
| **Milestone Celebrations** | Special notifications at key milestones (33, 66, 99, 100, 200, 300, 500, 1000) |
| **Milestone Grid Display** | Visual grid showing which milestones have been reached |
| **Haptic Feedback** | Device vibration on each tap (if supported) |
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

### 📱 Technical Features

| Feature | Description |
|---------|-------------|
| **Pure JavaScript** | No external frameworks - vanilla JS for performance |
| **Async Data Loading** | JSON-based azkar data loaded asynchronously |
| **Local Storage** | Saves theme preference and tasbih history |
| **Error Handling** | Graceful error handling with user-friendly messages |
| **Passive Event Listeners** | Optimized scroll performance |
| **Vibration API** | Haptic feedback on compatible devices |
| **No Dependencies** | Zero external libraries - fast load times |

### 🕌 Authentic Sources

- All adhkar sourced from authentic Hadith collections
- Includes references from Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, and others
- Each dhikr displays its source and spiritual benefits (الشرح والفضل)

### 📊 Progress Tracking

- **Individual Card Progress:** Tracks count remaining for each dhikr
- **Category Progress Bar:** Visual representation of completion percentage  
- **Completion Counter:** Shows "X / Y" completed adhkar per category
- **Visual Feedback:** Completed cards are visually distinguished
- **Automatic Updates:** Progress bars update in real-time

### 🎯 Performance Optimizations

- Efficient DOM manipulation with `buildCard()` function
- Debounced scroll event handling
- Lazy-loaded data fetching
- Smooth CSS transitions and animations
- Minimal reflows and repaints

---

## 🛠️ Tech Stack

- **HTML5** – Semantic structure and accessibility.  
- **CSS3** – Modern styling with flexbox/grid and responsive design.  
- **JavaScript (ES6+)** – Interactive counters, progress tracking, and DOM manipulation.  
- **Vercel** – Hosting and deployment (live demo).  

> No external frameworks or libraries are used – the project is built with **pure HTML, CSS, and JavaScript** for maximum performance and simplicity.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).  

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HaithamAbuDraz/Azkari.git
2. **Navigate to the project folder**
   ```bash
   cd Azkari
3. **Open the application**
   -- Double‑click index.html to open it in your default browser, or
   --Use a local development server (e.g., Live Server in VS Code) for a better experience.

That’s it – no build steps or dependencies are required.

---

## 📁 Project Structure
```bash
Azkari/
├── assets/               # Images, fonts, and other static assets
├── .vscode/              # VS Code configuration (Live Server port, etc.)
├── index.html            # Main entry point
├── README.md             # Project documentation
└── LICENSE               # MIT License
```

> 💡 **Note:** The JavaScript and CSS are embedded directly in index.html to keep the project self‑contained and easy to deploy.

---

## 📖 Usage

Once the application is open, you can:

- Navigate between different categories: Morning Adhkar, Evening Adhkar, Prayer Adhkar, Sleep Duas, and Various Azkar.
- Perform a Azkar by clicking on any supplication card – each click increments the counter for that Azkar.
- Track your progress – each category shows a progress bar that fills as you complete its adhkar.
- Use the digital tasbih – click the tasbih button or press the Spacebar to increment the counter. The tasbih celebrates milestones at 33 and 100.
- Get time‑based suggestions – the app automatically highlights the appropriate category based on the current time of day (e.g., morning adhkar in the morning, evening adhkar after Asr).
- See toast notifications whenever you complete a Azkar or reach a milestone.

---

## 🤝 Contributing

Contributions are what make the open‑source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
   Click the Fork button at the top right of the repository page.

2. Create your Feature Branch
   ```bash
   git checkout -b feature/AmazingFeature
3. Commit your Changes
   ```bash
   git commit -m 'Add some AmazingFeature'
4. Push to the Branch
   ```bash
   git push origin feature/AmazingFeature
5. Open a Pull Request
   Go to the original repository and click Compare & pull request.

> Please make sure to update tests as appropriate and adhere to the existing coding style.

---

## 🙏 Acknowledgments
- All adhkar are sourced from authentic Hadith collections (Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, etc.)
- Inspired by the daily spiritual needs of Muslims worldwide.
- Built with ❤️ using pure HTML, CSS, and JavaScript.
