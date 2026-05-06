import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { authedFetch, syncCurrentUser } from "../../lib/apiClient";
import {
  FiChevronDown,
  FiHelpCircle,
  FiBell,
  FiSearch,
  FiCreditCard,
  FiDollarSign,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
} from "react-icons/fi";

function displayName(u) {
  const first = u?.firstName?.trim?.() || "";
  const last = u?.lastName?.trim?.() || "";
  const full = `${first} ${last}`.trim();
  return full || u?.name || u?.email || "Unknown user";
}

function initials(u) {
  return (displayName(u)?.[0] || "U").toUpperCase();
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function LoggedInNavbar() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);
  const [me, setMe] = useState(null);
  const [messageConversations, setMessageConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const wrapperRef = useRef(null);

  const closeMenus = () => setOpenMenu(null);
  const toggleMenu = (key) => setOpenMenu((prev) => (prev === key ? null : key));

  const navItems = useMemo(
    () => ({
      work: [
        { label: "Browse jobs", href: "/jobs/all-jobs" },
        { label: "Today’s jobs", href: "/jobs/todays-jobs" },
        { label: "Categories", href: "/cat/dev-it" },
      ],
      deliver: [
        { label: "Inbox", href: "/messages" },
        { label: "Project catalog", href: "/services" },
      ],
      finance: [
        { label: "Pay (Bank/Card)", href: "/payments/bank?mode=pay", icon: <FiCreditCard /> },
        { label: "Pay (Crypto)", href: "/payments/crypto?mode=pay", icon: <FiDollarSign /> },
        { label: "Deposit (Bank/Card)", href: "/payments/bank?mode=deposit", icon: <FiCreditCard /> },
        { label: "Deposit (Crypto)", href: "/payments/crypto?mode=deposit", icon: <FiDollarSign /> },
        { label: "Withdraw earnings (Bank)", href: "/payments/bank?mode=withdraw", icon: <FiCreditCard /> },
        { label: "Withdraw earnings (Crypto)", href: "/payments/crypto?mode=withdraw", icon: <FiDollarSign /> },
      ],
      profile: [
        { label: "Profile", href: "/profile", icon: <FiUser /> },
        { label: "Settings", href: "/settings", icon: <FiSettings /> },
      ],
    }),
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setMe(u || null);
      if (u) {
        try {
          await syncCurrentUser(u);
        } catch (err) {
          console.error("SQL user sync failed", err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) closeMenus();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") closeMenus();
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    closeMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  useEffect(() => {
    if (!me || openMenu !== "messages") return;

    let mounted = true;
    async function loadMessagesPreview() {
      setLoadingMessages(true);
      try {
        const data = await authedFetch(me, "/api/messages");
        if (mounted) setMessageConversations((data.conversations || []).slice(0, 5));
      } catch (err) {
        console.error("message preview failed", err);
        if (mounted) setMessageConversations([]);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    }

    loadMessagesPreview();
    return () => {
      mounted = false;
    };
  }, [me, openMenu]);

  useEffect(() => {
    if (!me) {
      setNotificationCount(0);
      return;
    }

    let mounted = true;
    async function loadNotificationCount() {
      try {
        const data = await authedFetch(me, "/api/notifications");
        if (mounted) setNotificationCount(Number(data.unreadCount || data.count || 0));
      } catch (err) {
        console.error("notification preview failed", err);
        if (mounted) setNotificationCount(0);
      }
    }

    loadNotificationCount();
    const timer = setInterval(loadNotificationCount, 60000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [me, router.asPath]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      closeMenus();
      router.push("/");
    }
  };

  function Dropdown({ id, items, align = "left" }) {
    const isOpen = openMenu === id;
    return (
      <div className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-3 ${isOpen ? "block" : "hidden"}`}>
        <div className={`absolute -top-2 ${align === "right" ? "right-6" : "left-6"} w-4 h-4 bg-white border-l border-t rotate-45`} />
        <div className="w-72 bg-white border rounded-2xl shadow-xl overflow-hidden py-2">
          {items.map((it) => (
            <Link key={it.href} href={it.href} legacyBehavior>
              <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 hover:bg-gray-50" onClick={closeMenus}>
                {it.icon ? <span className="text-zinc-600 text-base">{it.icon}</span> : null}
                <span>{it.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <header ref={wrapperRef} className="sticky top-0 z-50 bg-white border-b">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-[260px]">
            <Link href="/jobs/all-jobs" legacyBehavior>
              <a className="flex items-center"><span className="text-xl font-extrabold text-[#0C4A6E] tracking-tight">Jobly</span></a>
            </Link>

            <nav className="hidden lg:flex items-center gap-5">
              <div className="relative">
                <button type="button" onClick={() => toggleMenu("work")} className="flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-cyan-700">Find work <FiChevronDown /></button>
                <Dropdown id="work" items={navItems.work} align="left" />
              </div>
              <div className="relative">
                <button type="button" onClick={() => toggleMenu("deliver")} className="flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-cyan-700">Deliver <FiChevronDown /></button>
                <Dropdown id="deliver" items={navItems.deliver} align="left" />
              </div>
              <div className="relative">
                <button type="button" onClick={() => toggleMenu("finance")} className="flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-cyan-700">Finances <FiChevronDown /></button>
                <Dropdown id="finance" items={navItems.finance} align="left" />
              </div>
              <Link href="/myjobs" legacyBehavior><a className="text-sm font-semibold text-zinc-700 hover:text-cyan-700">My jobs</a></Link>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-[560px]">
            <div className="w-full flex items-center border rounded-full overflow-hidden bg-white">
              <div className="pl-4 pr-2 text-zinc-500"><FiSearch /></div>
              <input className="flex-1 py-2 text-sm outline-none" placeholder="Search jobs or talent" />
              <div className="border-l">
                <select className="h-full py-2 px-3 text-sm bg-white outline-none cursor-pointer">
                  <option value="jobs">Jobs</option>
                  <option value="talent">Talent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/help" legacyBehavior>
              <a className="p-2 rounded-full hover:bg-gray-100 text-zinc-700" aria-label="Help" onClick={closeMenus}><FiHelpCircle className="text-xl" /></a>
            </Link>

            <Link href="/notifications" legacyBehavior>
              <a className="relative p-2 rounded-full hover:bg-gray-100 text-zinc-700" aria-label="Notifications" onClick={closeMenus}>
                <FiBell className="text-xl" />
                {notificationCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0C4A6E] text-white text-[10px] leading-[18px] text-center font-bold">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </a>
            </Link>

            <div className="relative">
              <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-zinc-700" aria-label="Messages" onClick={() => toggleMenu("messages")}>
                <FiMessageSquare className="text-xl" />
              </button>

              <div className={`absolute right-[-2rem] mt-6 z-50 ${openMenu === "messages" ? "block" : "hidden"}`}>
                <div className="absolute -top-2 right-10 w-5 h-5 bg-white border-l border-t rotate-45" />
                 <div className="w-[34rem] min-h-[17rem] bg-white border border-zinc-200 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.18)] overflow-hidden">
                  <div className="px-4 py-4 border-b bg-white flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Messages</p>
                      <p className="text-xs text-zinc-500">Recent SQL conversations</p>
                    </div>
                    <Link href="/messages" legacyBehavior><a className="text-xs font-semibold text-[#0C4A6E] hover:underline" onClick={closeMenus}>Open inbox</a></Link>
                  </div>

                  <div className="max-h-[28rem] overflow-auto p-3">
                    {loadingMessages ? (
                      <p className="px-4 py-4 text-sm text-zinc-600">Loading…</p>
                    ) : messageConversations.length === 0 ? (
                      <div className="px-6 py-8 text-sm text-zinc-600">
                        <div className="h-10 w-10 rounded-full bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center mb-3"><FiMessageSquare /></div>
                        <p className="font-semibold text-zinc-800">No conversations yet</p>
                        <p className="mt-1">Start a new message from your inbox.</p>
                      </div>
                    ) : (
                      messageConversations.map((c) => (
                        <Link key={c.peer?.uid} href={`/messages?peerUid=${c.peer?.uid}`} legacyBehavior>
                          <a className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50" onClick={closeMenus}>
                            <div className="h-10 w-10 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center text-sm font-bold">{initials(c.peer)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{displayName(c.peer)}</p>
                                <p className="text-[11px] text-zinc-400">{formatDate(c.lastMessage?.createdAt)}</p>
                              </div>
                              <p className="text-xs text-zinc-500 truncate">{c.lastMessage?.text || "Say hi 👋"}</p>
                            </div>
                          </a>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative ml-1">
              <button type="button" onClick={() => toggleMenu("profile")} className="flex items-center gap-2 rounded-full hover:bg-gray-100 px-2 py-1">
                <div className="h-8 w-8 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center text-sm font-bold">{initials(me)}</div>
                <FiChevronDown className="text-zinc-600" />
              </button>

              <div className={`absolute right-0 mt-3 ${openMenu === "profile" ? "block" : "hidden"}`}>
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t rotate-45" />
                <div className="w-64 bg-white border rounded-2xl shadow-xl overflow-hidden py-2">
                  {navItems.profile.map((it) => (
                    <Link key={it.href} href={it.href} legacyBehavior>
                      <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 hover:bg-gray-50" onClick={closeMenus}>
                        <span className="text-zinc-600 text-base">{it.icon}</span><span>{it.label}</span>
                      </a>
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-800 hover:bg-gray-50">
                    <span className="text-zinc-600 text-base"><FiLogOut /></span><span>Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="w-full flex items-center border rounded-full overflow-hidden bg-white">
            <div className="pl-4 pr-2 text-zinc-500"><FiSearch /></div>
            <input className="flex-1 py-2 text-sm outline-none" placeholder="Search" />
            <div className="border-l">
              <select className="h-full py-2 px-3 text-sm bg-white outline-none cursor-pointer"><option value="jobs">Jobs</option><option value="talent">Talent</option></select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
