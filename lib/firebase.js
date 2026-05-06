// lib/firebase.js
// Firebase is used for authentication only.
// SQL-backed features such as messages, jobs, notifications, and payments use Prisma/SQLite.
// Do not import Firebase Analytics, Firestore, or Storage here because Next.js also renders server-side.

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

function cleanValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

const firebaseConfig = {
  apiKey:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) ||
    "AIzaSyD_y3xemp7iPIJvLOJakhnQKxMlovq7FxE",

  authDomain:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
    "freelance-app-4c798.firebaseapp.com",

  projectId:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ||
    "freelance-app-4c798",

  storageBucket:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
    "freelance-app-4c798.firebasestorage.app",

  messagingSenderId:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
    "765173528169",

  appId:
    cleanValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) ||
    "1:765173528169:web:079c882be63cd8a35154f8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;