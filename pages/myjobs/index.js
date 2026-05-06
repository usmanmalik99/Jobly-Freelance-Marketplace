import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import HeadTag from "../../components/HeadTag";
import AppNavbar from "../../components/Navbar/AppNavbar";
import Footer from "../../components/Footer";

import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const TABS = [
  { key: "in_progress", label: "In progress" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const emptyStats = {
  inProgress: 0,
  pending: 0,
  completed: 0,
  earningsCents: 0,
};

function formatMoneyFromCents(cents) {
  return `$${(Number(cents || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-zinc-700">
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const label =
    status === "in_progress" ? "In progress" : status === "pending" ? "Pending" : "Completed";

  const cls =
    status === "in_progress"
      ? "bg-emerald-50 text-emerald-700"
      : status === "pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
};

function EmptyJobsState({ activeTab }) {
  const label =
    activeTab === "in_progress" ? "active jobs" : activeTab === "pending" ? "pending jobs" : "completed jobs";

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-xl">
        📁
      </div>
      <h3 className="mt-4 text-lg font-bold text-zinc-800">No {label} yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        When a client order is assigned to your account, it will appear here automatically.
        Until then, your job counts and earnings correctly stay at zero.
      </p>
    </div>
  );
}

export default function MyJobs() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [apiStats, setApiStats] = useState(emptyStats);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("in_progress");

  useEffect(() => {
    let alive = true;

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!alive) return;

      if (!currentUser) {
        setUser(null);
        setAuthLoading(false);
        router.push("/account-security/login");
        return;
      }

      setUser(currentUser);
      setAuthLoading(false);
      setJobsLoading(true);
      setError("");

      try {
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/jobs/my-jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Failed to load jobs.");
        }

        if (!alive) return;

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setApiStats(data.stats || emptyStats);
      } catch (err) {
        if (!alive) return;
        setJobs([]);
        setApiStats(emptyStats);
        setError(err.message || "Unable to load jobs right now.");
      } finally {
        if (alive) setJobsLoading(false);
      }
    });

    return () => {
      alive = false;
      unsub();
    };
  }, [router]);

  const filtered = useMemo(() => jobs.filter((job) => job.status === activeTab), [jobs, activeTab]);

  const stats = useMemo(() => {
    if (apiStats) return { ...emptyStats, ...apiStats };

    return {
      inProgress: jobs.filter((job) => job.status === "in_progress").length,
      pending: jobs.filter((job) => job.status === "pending").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      earningsCents: jobs
        .filter((job) => job.status === "completed")
        .reduce((sum, job) => sum + Number(job.totalEarnedCents || 0), 0),
    };
  }, [jobs, apiStats]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeadTag title="My Jobs | Jobly" />
        <AppNavbar />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto max-w-[1100px] px-4 py-10">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-zinc-600 font-semibold">Loading your jobs…</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <HeadTag title="My Jobs | Jobly" />
      <AppNavbar />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-[1100px] px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">My Jobs</h1>
              <p className="text-zinc-500 mt-1">
                Track active work, pending orders, completed projects, and earnings.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm px-6 py-4 border border-gray-100">
              <p className="text-xs text-zinc-500 font-semibold">Total earnings</p>
              <p className="text-2xl font-bold text-zinc-800">
                {formatMoneyFromCents(stats.earningsCents)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-zinc-500 font-semibold">In progress</p>
              <p className="text-3xl font-bold text-zinc-800 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-zinc-500 font-semibold">Pending</p>
              <p className="text-3xl font-bold text-zinc-800 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-zinc-500 font-semibold">Completed</p>
              <p className="text-3xl font-bold text-zinc-800 mt-2">{stats.completed}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
            <div className="flex flex-wrap gap-2 p-4 border-b bg-white">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-[#0C4A6E] text-white shadow-sm"
                      : "bg-gray-100 text-zinc-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {jobsLoading ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <p className="font-semibold text-zinc-700">Loading your jobs…</p>
                  <p className="mt-1 text-sm text-zinc-500">This usually takes only a moment.</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <p className="font-bold text-amber-800">Could not load jobs</p>
                  <p className="mt-1 text-sm text-amber-700">{error}</p>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyJobsState activeTab={activeTab} />
              ) : (
                <div className="space-y-4">
                  {filtered.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-2xl p-5 bg-white hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-zinc-800">{job.title}</h3>
                            <StatusPill status={job.status} />
                          </div>

                          <p className="text-zinc-500 text-sm">
                            Client:{" "}
                            <span className="text-zinc-700 font-semibold">
                              {job.client || "Client"}
                            </span>
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            {job.rateType ? <Badge>{job.rateType}</Badge> : null}
                            {job.rateCents ? <Badge>{formatMoneyFromCents(job.rateCents)}</Badge> : null}
                            {formatDate(job.startedAt) ? <Badge>Started: {formatDate(job.startedAt)}</Badge> : null}
                            {formatDate(job.dueAt) ? <Badge>Due: {formatDate(job.dueAt)}</Badge> : null}
                          </div>
                        </div>

                        <div className="md:text-right">
                          <p className="text-sm text-zinc-500 font-semibold">Earned</p>
                          <p className="text-xl font-bold text-zinc-800">
                            {formatMoneyFromCents(job.totalEarnedCents)}
                          </p>

                          <button
                            type="button"
                            className="mt-3 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#0C4A6E] hover:bg-white transition"
                            onClick={() =>
                              router.push(job.clientUid ? `/messages?peerUid=${job.clientUid}` : "/messages")
                            }
                          >
                            Message client
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 px-5 py-4 text-sm text-sky-900">
            New accounts start with zero jobs and $0 earnings until a real order is assigned.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
