import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import HeadTag from "../../components/HeadTag";
import AppNavbar from "../../components/Navbar/AppNavbar";
import Footer from "../../components/Footer";
import { auth } from "../../lib/firebase";
import { authedFetch, syncCurrentUser } from "../../lib/apiClient";
import { FiBell, FiBriefcase, FiMessageSquare, FiRefreshCw } from "react-icons/fi";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function iconFor(type) {
  if (type === "job") return <FiBriefcase />;
  return <FiMessageSquare />;
}

function EmptyNotifications() {
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0C4A6E]/10 text-[#0C4A6E] text-2xl">
        <FiBell />
      </div>
      <h2 className="mt-5 text-xl font-bold text-zinc-900">No notifications yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        You will see notifications here when you receive a message, get a job order, or have a job status update.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/jobs/all-jobs" legacyBehavior>
          <a className="rounded-full bg-[#0C4A6E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#18465f]">
            Browse jobs
          </a>
        </Link>
        <Link href="/messages" legacyBehavior>
          <a className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-gray-50">
            Open messages
          </a>
        </Link>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function loadNotifications(user) {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await authedFetch(user, "/api/notifications");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setItems([]);
      setError(err.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!alive) return;

      if (!currentUser) {
        setMe(null);
        setAuthLoading(false);
        router.push("/account-security/login");
        return;
      }

      setMe(currentUser);
      setAuthLoading(false);

      try {
        await syncCurrentUser(currentUser);
      } catch (err) {
        console.error("SQL user sync failed", err);
      }

      if (alive) loadNotifications(currentUser);
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeadTag title="Notifications - Jobly" />
        <AppNavbar />
        <main className="flex-1 mx-auto max-w-[900px] w-full px-4 py-10">
          <div className="rounded-3xl bg-white border p-6 shadow-sm text-zinc-600 font-semibold">Loading notifications...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeadTag title="Notifications - Jobly" />
      <AppNavbar />
      <main className="flex-1 mx-auto max-w-[900px] w-full px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center text-xl">
              <FiBell />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
              <p className="text-zinc-600 text-sm">Message and job updates from your account activity.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadNotifications(me)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="mt-8">
          {loading ? (
            <div className="rounded-3xl bg-white border p-8 shadow-sm text-zinc-600 font-semibold">Loading updates...</div>
          ) : items.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
              {items.map((item, index) => (
                <Link key={item.id} href={item.href || "/notifications"} legacyBehavior>
                  <a className={`p-5 flex gap-4 hover:bg-gray-50 transition ${index !== items.length - 1 ? "border-b" : ""}`}>
                    <div className="h-11 w-11 rounded-full bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center text-lg flex-shrink-0">
                      {iconFor(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="font-semibold text-zinc-900">{item.title}</h2>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.createdAt)}</span>
                      </div>
                      <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{item.body}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
