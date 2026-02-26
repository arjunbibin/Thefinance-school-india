# The Finance School India

A modern, high-performance Edu-Tech platform built with Next.js 15, Firebase, and Three.js.

## Features

- **Interactive 3D Hero**: Immersive wealth-grid visualization.
- **Dynamic Course Catalog**: Managed directly via the Staff Portal.
- **Demo Class Suite**: Support for YouTube embeds or direct MP4 uploads with automated 1080p playback.
- **Staff Portal**: Secure administrative dashboard with single-session enforcement.
- **Secure Enrollment**: Masked registration portal with domain validation.

## Deployment Instructions

### 1. GitHub Hosting
To push this project to your own GitHub account:

1. Create a repository on GitHub.
2. Run the following in your terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Firebase App Hosting (Production)
This project is configured for **Firebase App Hosting**, which is the recommended way to host Next.js apps on Firebase.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `finance-school-india`.
3. Navigate to **App Hosting** in the sidebar.
4. Click **Get Started** and connect your GitHub repository.
5. Firebase will automatically handle the build and provide a production URL.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Admin Whitelist)
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS & ShadCN UI
- **3D Graphics**: Three.js
