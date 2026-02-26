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

## Deployment Instructions (via Terminal)

To host this project on GitHub and go live with Firebase App Hosting, follow these steps in your terminal:

### 1. Prepare Git locally
Inside your project folder, execute the following:

```bash
# Initialize git
git init

# Add all files (except those in .gitignore)
git add .

# Create the first commit
git commit -m "Initial launch: Finance School India with Admin Portal"

# Set the branch to main
git branch -M main
```

### 2. Push to GitHub
Run these commands to link and upload your code to your repository:

```bash
# Link to your GitHub repo
git remote add origin https://github.com/arjunbibin/Thefinance-school-india.git

# Push to GitHub
git push -u origin main
```

### 3. Connect to Firebase App Hosting
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **App Hosting** in the left sidebar.
4. Click **Get Started** and select your GitHub account.
5. Choose the `Thefinance-school-india` repository you just pushed.
6. Follow the wizard to complete the setup. Firebase will automatically detect the Next.js build and provide you with a production URL.

## Security Note
Administrative access is restricted to whitelisted UIDs. Data integrity is enforced via production Firestore Security Rules.
