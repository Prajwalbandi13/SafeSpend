# SafeSpend — Know what you can spend

A polished, mobile-first personal finance app that tells you what you can safely spend, save, and invest.

> **Tell the app what happened with your money, and it tells you what you can safely spend.**

## Features

- **Safe-to-Spend Engine** — Shows how much you can safely spend after accounting for upcoming bills, SIPs, and goal contributions.
- **Quick Add (Voice + Text)** — Say or type "Spent ₹350 on lunch" and the app understands the amount, category, and description automatically.
- **Paycheck-Based Budgeting** — Budgets around your salary date, not the calendar month.
- **Recurring Payments** — Track rent, SIPs, subscriptions, and bills that repeat.
- **Investment Tracking** — Manually track mutual funds, SIPs, stocks, FDs, gold, and NPS with current values.
- **Goals** — Set savings goals with target dates and see required monthly contributions.
- **Ask Your Money** — Conversational interface to ask questions about your finances.
- **Insights** — Automatic, useful insights like "Food spending increased 18% compared with last month."
- **Privacy-First** — All data is stored locally on your device. No bank connections, no servers, no tracking.

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Vite
- LocalStorage (no backend required)
- Web Speech API for voice input
- PWA-ready (installable on Android/iOS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with the production build.

---

## How to Get the App as an APK

There are two main methods to package this web app as an Android APK.

### Method 1: PWABuilder (Recommended, Easiest)

PWABuilder is a free Microsoft tool that converts PWA apps into Android APKs.

1. **Build and deploy the app** to any static host (Vercel, Netlify, Firebase Hosting, GitHub Pages). The app must be accessible via a public HTTPS URL.

   ```bash
   npm run build
   # Deploy the dist/ folder to your hosting provider
   ```

2. **Go to [PWABuilder](https://www.pwabuilder.com/)**.

3. **Enter your deployed app URL** (e.g., `https://your-app.vercel.app`) and click "Start".

4. PWABuilder will analyze your PWA. Click **"Package for Stores"**.

5. Select **Android** and click **"Generate Package"**.

6. Download the generated `.apk` file.

7. **Install on your phone:**
   - Transfer the APK to your Android phone.
   - Open the file on your phone (enable "Install from unknown sources" if prompted).
   - Tap "Install".

> **Note:** PWABuilder also generates an `.aab` (Android App Bundle) file, which is the format required for Google Play Store submission.

### Method 2: Capacitor (More Control)

Capacitor wraps your web app in a native Android shell, giving you access to native APIs.

1. **Install Capacitor:**

   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init SafeSpend com.safespend.app --web-dir=dist
   ```

2. **Build the app:**

   ```bash
   npm run build
   ```

3. **Add the Android platform:**

   ```bash
   npx cap add android
   ```

4. **Sync the web build:**

   ```bash
   npx cap sync
   ```

5. **Open in Android Studio:**

   ```bash
   npx cap open android
   ```

6. **In Android Studio:**
   - Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
   - The APK will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`.

7. **For a release APK** (for distribution):
   - Go to **Build → Generate Signed Bundle / APK**.
   - Create a keystore (or use an existing one).
   - Select "APK" and choose "release".
   - The signed APK will be in `android/app/build/outputs/apk/release/app-release.apk`.

### Method 3: Trusted Web Activity (TWA) via Bubblewrap

Google's Bubblewrap CLI creates a TWA that wraps your PWA in a native Android app.

1. **Deploy your app** to a public HTTPS URL.

2. **Install Bubblewrap:**

   ```bash
   npm install -g @bubblewrap/cli
   ```

3. **Initialize the project:**

   ```bash
   bubblewrap init --manifest https://your-app-url.com/manifest.json
   ```

4. **Build the APK:**

   ```bash
   bubblewrap build
   ```

5. The signed APK will be generated in the project folder.

---

## Installing the APK on Your Phone

1. **Transfer the APK file** to your Android phone (via USB, email, Google Drive, etc.).

2. **Enable unknown sources:**
   - Go to **Settings → Security** (or **Settings → Apps → Special access → Install unknown apps**).
   - Enable "Install unknown apps" for the file manager or browser you used.

3. **Open the APK file** on your phone and tap **"Install"**.

4. The SafeSpend app icon will appear in your app drawer. Open it like any other app.

---

## Development

### Project Structure

```
src/
├── lib/
│   ├── types.ts        # TypeScript type definitions
│   ├── storage.ts      # LocalStorage data access layer
│   ├── seedData.ts     # Demo data generator
│   ├── hooks.ts        # React data hooks
│   ├── format.ts       # Currency & date formatting
│   ├── nlp.ts          # Natural language parser for quick add
│   ├── finance.ts      # Safe-to-spend engine & financial calculations
│   └── askMoney.ts     # Conversational query engine
├── components/
│   ├── BottomNav.tsx
│   ├── SideNav.tsx
│   ├── Modal.tsx
│   ├── QuickAddModal.tsx
│   ├── TransactionEditModal.tsx
│   └── TransactionItem.tsx
├── screens/
│   ├── Onboarding.tsx
│   ├── Home.tsx
│   ├── Transactions.tsx
│   ├── Budget.tsx
│   ├── Investments.tsx
│   └── More.tsx
├── App.tsx
├── main.tsx
└── index.css
```

### Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run typecheck` — Type check
- `npm run lint` — Lint

## Privacy

- All data is stored locally on the device using browser localStorage.
- No data is sent to any server.
- No bank accounts, UPI, SMS, contacts, or government IDs are accessed.
- The app works fully offline.

## License

MIT
