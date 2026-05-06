// pages/account-security/firebase.js
// Compatibility page.
// Main Firebase config lives in /lib/firebase.

import app, { auth } from "../../lib/firebase";

export { auth };
export const firebaseApp = app;

export default function FirebaseCompatibilityPage() {
  return null;
}