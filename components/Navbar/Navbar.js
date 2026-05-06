import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { FaBars, FaChevronDown } from "react-icons/fa";
import { HiX } from "react-icons/hi";

import SearchLink from "./SearchLink";

const JoblyLogo = ({ onClick }) => (
  <div
    className="cursor-pointer select-none"
    onClick={onClick}
    role="button"
    aria-label="Jobly Home"
  >
    <span className="text-xl font-extrabold text-[#0C4A6E] tracking-tight">
      Jobly
    </span>
  </div>
);

const Navbar = () => {
  const router = useRouter();

  // Auth
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // ✅ Guard helper: if not logged in -> send to login
  const guardedPush = (path) => {
    if (!user) {
      router.push("/account-security/login");
      return;
    }
    router.push(path);
  };

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const search = (e) => e.preventDefault();

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setSearchOpen(false);
    setMobileOpen(false);
  }, [router.asPath]);

  return (
    <nav className="bg-white border-b">
      <div className="mx-auto max-w-[1200px] px-3 py-3 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-2xl text-zinc-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileOpen ? <HiX /> : <FaBars />}
          </button>

          <JoblyLogo onClick={() => router.push("/")} />

          <ul className="hidden lg:flex items-center gap-6 ml-6">
            <li className="text-zinc-700 font-semibold hover:text-cyan-700 transition">
              <Link href="/enterprise">Enterprise</Link>
            </li>

            {/* ✅ PROTECTED: Find Jobs */}
            <li className="text-zinc-700 font-semibold hover:text-cyan-700 transition">
              <button type="button" onClick={() => guardedPush("/jobs/all-jobs")}>
                Find Jobs
              </button>
            </li>

            {/* Optional: keep public OR protect it */}
            <li className="text-zinc-700 font-semibold hover:text-cyan-700 transition">
              <Link href="/cat/dev-it">Categories</Link>
              {/* If you want Categories protected too, replace line above with:
                  <button type="button" onClick={() => guardedPush("/cat/dev-it")}>
                    Categories
                  </button>
              */}
            </li>
          </ul>
        </div>

        {/* Middle: search desktop */}
        <div className="hidden md:flex flex-1 max-w-[560px] relative">
          <form
            className="w-full flex items-center border border-gray-300 rounded-full px-4 py-2 hover:bg-[#F3FFFC] transition relative"
            onSubmit={search}
          >
            <FaChevronDown
              className={`${
                searchOpen ? "rotate-180" : "rotate-0"
              } transition h-3 text-zinc-700 cursor-pointer hover:text-zinc-500`}
              onClick={() => setSearchOpen((v) => !v)}
            />
            <input
              type="text"
              className="flex-grow focus:outline-none bg-transparent mx-2 text-zinc-700"
              placeholder="Search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {inputText !== "" && (
              <HiX
                className="h-5 text-zinc-700 cursor-pointer hover:text-zinc-500"
                onClick={() => setInputText("")}
              />
            )}

            {searchOpen && (
              <ul className="absolute top-11 left-3 w-[94%] shadow-lg border border-gray-300 bg-[#F3FFFC] rounded-b-lg py-1 z-30">
                {SearchLink.map((curVal) => (
                  <li
                    className="py-2 px-3 cursor-pointer hover:bg-[#eaf6f8]"
                    key={curVal.id}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Link href={curVal.href || "/"}>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl text-gray-800">
                          {curVal.icon}
                        </span>
                        <div>
                          <span className="block text-md text-gray-800">
                            {curVal.title}
                          </span>
                          <span className="block text-sm text-zinc-500">
                            {curVal.dec}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                className="text-zinc-700 font-semibold hover:text-cyan-700 transition"
                onClick={() => router.push("/messages")}
                type="button"
              >
                Messages
              </button>
              <button
                className="text-zinc-700 font-semibold hover:text-cyan-700 transition"
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                className="text-zinc-700 font-semibold hover:text-cyan-700 transition"
                onClick={() => router.push("/account-security/login")}
                type="button"
              >
                LogIn
              </button>
              <button
                className="font-semibold bg-gradient-to-tr from-sky-200 to-cyan-200 py-2 px-3 rounded-xl text-gray-800 hover:from-cyan-300 hover:to-sky-200 transition"
                onClick={() => router.push("/account-security/signup")}
                type="button"
              >
                SignUp
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${mobileOpen ? "block" : "hidden"} bg-[#F3FFFC] border-t`}>
        <div className="mx-auto max-w-[1200px] px-3 py-4 flex flex-col gap-4">
          {/* ✅ PROTECTED: Find Jobs */}
          <button
            type="button"
            onClick={() => guardedPush("/jobs/all-jobs")}
            className="text-left font-semibold text-zinc-700"
          >
            Find Jobs
          </button>

          {/* Optional: keep public OR protect it */}
          <Link href="/cat/dev-it" className="font-semibold text-zinc-700">
            Categories
          </Link>
          {/* If you want Categories protected too:
              <button type="button" onClick={() => guardedPush("/cat/dev-it")} className="text-left font-semibold text-zinc-700">
                Categories
              </button>
          */}

          <Link href="/enterprise" className="font-semibold text-zinc-700">
            Enterprise
          </Link>

          <Link href="/services" className="font-semibold text-zinc-700">
            Services
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
