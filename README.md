
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

## Final Deployment Steps (Live on GitHub ✅)

Your code has been successfully pushed to [GitHub](https://github.com/arjunbibin/Thefinance-school-india). Now, follow these steps to go live:

### 1. Connect to Firebase App Hosting
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **finance-school-india**.
3. Navigate to **App Hosting** in the left sidebar.
4. Click **Get Started**.
5. Select your GitHub account and the repository `arjunbibin/Thefinance-school-india`.
6. Follow the wizard to complete the setup. Firebase will automatically detect the Next.js build and provide you with a live production URL.

### 2. Monitor Build
Once you connect the repository, Firebase will start a build automatically. You can watch the progress in the Firebase Console under the **App Hosting** tab.

### 3. Future Updates
Any time you make changes here in the editor, just run these commands in the terminal to update the live site:
```bash
git add .
git commit -m "Update site content"
git push origin main
```
Firebase will automatically detect the new commit and redeploy your site.
