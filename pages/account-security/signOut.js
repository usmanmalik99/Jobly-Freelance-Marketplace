import React, { useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase"; // adjust path if needed

const SignOutButton = () => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOut(auth);
      router.push("/account-security/login"); // change destination if you want
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="xl:mx-7 mx-3 text-zinc-700 text-[1.03rem] font-semibold hover:text-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
};

export default SignOutButton;
