# The Finance School India

A modern, high-performance Edu-Tech platform built with Next.js 15, Firebase, and Three.js.

## Features

- **Interactive 3D Hero**: Immersive wealth-grid visualization using Three.js.
- **Dynamic Course Catalog**: Managed directly via the secure Staff Portal.
- **Demo Class Suite**: Support for YouTube embeds or direct MP4 uploads with 1080p playback.
- **Staff Portal**: Secure administrative dashboard with single-session enforcement and multi-admin support.
- **Secure Enrollment**: Masked registration portal with domain validation.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Admin Whitelist)
- **Storage**: Firebase Storage (Media & Video Hosting)
- **Styling**: Tailwind CSS & ShadCN UI
- **3D Graphics**: Three.js

## Deployment Instructions

To push this project to GitHub and host it on Firebase App Hosting, follow these steps:

### 1. Initialize GitHub Repository
1. Go to [GitHub](https://github.com/new) and create a new repository named `finance-school-india`.
2. Open your terminal in this project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial launch: Finance School India with Admin Portal"
   git branch -M main
   ```

### 2. Connect and Push
Replace `YOUR_USERNAME` with your actual GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/finance-school-india.git
git push -u origin main
```

### 3. Go Live with Firebase App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `finance-school-india`.
3. Navigate to **App Hosting** in the left sidebar.
4. Click **Get Started** and connect your GitHub repository.
5. Firebase will automatically detect the Next.js setup, build the project, and provide a production URL.

## Security Note
Administrative access is restricted to whitelisted UIDs defined in `src/app/login/page.tsx`. Data integrity is enforced via `firestore.rules`.
