# Jobly - Freelance Marketplace Portfolio Project

Jobly is a full-stack freelance marketplace web application inspired by platforms like Upwork. The project includes marketplace pages, user authentication, protected navigation, messaging, job tracking, notifications, profile/settings pages, and demo payment flows.

This project was built as a portfolio project to demonstrate full-stack development skills using Next.js, Firebase Authentication, Prisma, SQLite, and API routes.

## Template Credit

The initial frontend layout and marketplace UI were based on the MIT-licensed Brenda template by Ukhang:

https://github.com/Ukhang/brenda

The project was customized and extended with authentication, backend database models, API routes, logged-in user flows, messaging, notifications, jobs, profile/settings pages, and demo payment features.

## Main Features

- Firebase email/password authentication
- Protected pages for logged-in users
- Prisma + SQLite backend database
- SQL-backed messaging and inbox system
- My Jobs page with backend-driven job records
- Notification center for unread messages and job updates
- Logged-in navbar with messages, notifications, help, finance, profile, and settings
- Demo Stripe-style card payment flow
- Demo Coinbase-style crypto payment flow
- Demo withdrawal request saving for bank and crypto
- Marketplace-style service, category, and job pages

## Tech Stack

- Next.js
- React
- JavaScript
- Prisma
- SQLite
- Firebase Authentication
- API Routes
- CSS / UI Components

## Local Setup

Install dependencies:

```bash
npm install

Create environment files:

cp .env.example .env.local
cp .env.example .env

Add your Firebase and database values:

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENTS_DEMO_MODE=true

Create the local database:

npm run db:push

Start the development server:

npm run dev

Open the app:

http://localhost:3000