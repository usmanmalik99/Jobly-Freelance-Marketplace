import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import HeadTag from "../../components/HeadTag";
import LoggedInNavbar from "../../components/Navbar/LoggedInNavbar";
import LoginSignupHeader from "../../components/LoginSignupHeader";
import LoginSignupFooter from "../../components/LoginSignupFooter";
import { auth } from "../../lib/firebase";
import { authedFetch, syncCurrentUser } from "../../lib/apiClient";
import { FiEdit2, FiSearch, FiSend, FiX, FiInfo, FiMail, FiMessageSquare } from "react-icons/fi";

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

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MessagesPage() {
  const router = useRouter();
  const bottomRef = useRef(null);

  const [me, setMe] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setMe(u || null);
      setLoadingAuth(false);
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

  const loadConversations = async () => {
    if (!me) return;
    setLoadingConversations(true);
    try {
      const data = await authedFetch(me, "/api/messages");
      setConversations(data.conversations || []);

      const urlPeer = typeof router.query.peerUid === "string" ? router.query.peerUid : "";
      if (urlPeer && !selectedPeer) {
        const match = (data.conversations || []).find((c) => c.peer?.uid === urlPeer);
        if (match?.peer) setSelectedPeer(match.peer);
      } else if (!selectedPeer && data.conversations?.[0]?.peer) {
        setSelectedPeer(data.conversations[0].peer);
      }
    } catch (err) {
      setStatus(err.message || "Could not load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (!me || !router.isReady) return;
    loadConversations();
    const t = setInterval(loadConversations, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, router.isReady]);

  const loadThread = async (peerUid = selectedPeer?.uid) => {
    if (!me || !peerUid) {
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    try {
      const data = await authedFetch(me, `/api/messages?peerUid=${encodeURIComponent(peerUid)}`);
      setSelectedPeer(data.peer || selectedPeer);
      setMessages(data.messages || []);
    } catch (err) {
      setStatus(err.message || "Could not load messages.");
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!selectedPeer?.uid) {
      setMessages([]);
      return;
    }
    loadThread(selectedPeer.uid);
    const t = setInterval(() => loadThread(selectedPeer.uid), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeer?.uid, me?.uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPeer?.uid]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const email = userSearch.trim().toLowerCase();
      if (!email || !me) {
        setUserResults([]);
        setSearchStatus("");
        return;
      }
      setSearchStatus("Searching SQL users…");
      try {
        const data = await authedFetch(me, `/api/users/search?email=${encodeURIComponent(email)}`);
        setUserResults(data.users || []);
        setSearchStatus(data.users?.length ? "" : "No user found. Ask them to sign up or log in once first.");
      } catch (err) {
        setSearchStatus(err.message || "Search failed.");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [userSearch, me]);

  const openPeer = (peer) => {
    setSelectedPeer(peer);
    setComposerOpen(false);
    setUserSearch("");
    setUserResults([]);
    router.replace(`/messages?peerUid=${peer.uid}`, undefined, { shallow: true });
  };

  const send = async (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !me || !selectedPeer?.uid) return;
    setStatus("");

    try {
      await authedFetch(me, "/api/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: selectedPeer.uid, text: clean }),
      });
      setText("");
      await Promise.all([loadThread(selectedPeer.uid), loadConversations()]);
    } catch (err) {
      setStatus(err.message || "Message failed to send.");
    }
  };

  const filteredConversations = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = displayName(c.peer).toLowerCase();
      const email = (c.peer?.email || "").toLowerCase();
      const preview = (c.lastMessage?.text || "").toLowerCase();
      return name.includes(q) || email.includes(q) || preview.includes(q);
    });
  }, [chatSearch, conversations]);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-700">Loading messages…</div>;
  }

  if (!me) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeadTag title="Messages - Jobly" />
        <LoginSignupHeader />
        <main className="container mx-auto px-4 py-10 flex-1">
          <div className="max-w-xl mx-auto border border-gray-300 rounded-2xl p-8 shadow-sm bg-white">
            <h1 className="text-2xl font-semibold text-zinc-800">Messages</h1>
            <p className="text-zinc-600 mt-2">Log in to access SQL-backed messaging.</p>
            <button className="mt-6 w-full py-2 px-3 bg-[#0C4A6E] rounded-full font-semibold text-white hover:bg-[#18465f]" onClick={() => router.push("/account-security/login")}>Go to Login</button>
          </div>
        </main>
        <LoginSignupFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeadTag title="Messages - Jobly" />
      <LoggedInNavbar />

      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-3 md:px-4 py-5">
          {status && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{status}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_310px] gap-4 min-h-[76vh]">
            <section className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="px-4 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-zinc-900">Messages</h2>
                  <p className="text-xs text-zinc-500">SQL-backed conversations</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-semibold text-[#0C4A6E] hover:underline" onClick={() => setComposerOpen(true)} type="button">
                  <FiEdit2 /> New
                </button>
              </div>

              <div className="p-3 border-b">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-[#F8FAFC]">
                  <FiSearch className="text-zinc-500" />
                  <input className="flex-1 outline-none bg-transparent text-sm" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search conversations" />
                </div>
              </div>

              <div className="max-h-[72vh] overflow-auto">
                {loadingConversations ? (
                  <p className="p-4 text-sm text-zinc-600">Loading conversations…</p>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-5 text-sm text-zinc-600">
                    <div className="h-11 w-11 rounded-full bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center mb-3"><FiMessageSquare /></div>
                    <p className="font-semibold text-zinc-800">No conversations yet</p>
                    <p className="mt-1">Click New and search a registered user by email.</p>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const active = c.peer?.uid === selectedPeer?.uid;
                    return (
                      <button key={c.peer?.uid} type="button" onClick={() => openPeer(c.peer)} className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-center gap-3 ${active ? "bg-[#F3FFFC]" : "bg-white"}`}>
                        <div className="h-11 w-11 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center font-bold">{initials(c.peer)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-zinc-800 truncate">{displayName(c.peer)}</p>
                            <p className="text-[11px] text-zinc-500">{formatDate(c.lastMessage?.createdAt)}</p>
                          </div>
                          <p className="text-sm text-zinc-600 truncate">{c.lastMessage?.text || "Say hi 👋"}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            <section className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col min-h-[76vh]">
              <div className="px-4 py-4 border-b flex items-center justify-between">
                {selectedPeer ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center font-bold">{initials(selectedPeer)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 truncate">{displayName(selectedPeer)}</p>
                      <p className="text-xs text-zinc-500 truncate">{selectedPeer.email}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-zinc-900">Select a conversation</p>
                    <p className="text-xs text-zinc-500">Start by clicking New</p>
                  </div>
                )}
                <button className="p-2 rounded-full hover:bg-gray-100 text-zinc-700" type="button" onClick={() => setShowDetails((v) => !v)} aria-label="Toggle details"><FiInfo /></button>
              </div>

              <div className="flex-1 bg-gray-50 px-4 py-4 overflow-auto space-y-3">
                {!selectedPeer ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="mx-auto h-14 w-14 rounded-full bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center text-2xl"><FiMail /></div>
                      <h3 className="text-lg font-semibold text-zinc-800 mt-4">No conversation selected</h3>
                      <p className="text-zinc-600 mt-1">Choose a conversation or start a new one.</p>
                    </div>
                  </div>
                ) : loadingThread ? (
                  <p className="text-sm text-zinc-600">Loading thread…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-zinc-600">No messages yet. Say hi 👋</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === me.uid;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm ${mine ? "bg-[#0C4A6E] text-white" : "bg-white text-zinc-800 border border-gray-200"}`}>
                          {m.text}
                          <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-zinc-500"}`}>{formatTime(m.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="border-t bg-white p-3">
                <div className="flex items-center gap-2">
                  <input className="flex-1 border border-gray-200 rounded-full px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-[#0C4A6E]/20" placeholder={selectedPeer ? "Write a message…" : "Select a conversation first"} value={text} onChange={(e) => setText(e.target.value)} disabled={!selectedPeer} />
                  <button type="submit" disabled={!selectedPeer || !text.trim()} className="px-5 py-3 rounded-full bg-[#0C4A6E] text-white font-semibold hover:bg-[#18465f] disabled:opacity-50 flex items-center gap-2">
                    <FiSend /> Send
                  </button>
                </div>
              </form>
            </section>

            {showDetails && (
              <aside className="hidden lg:block border border-gray-200 rounded-2xl bg-white shadow-sm p-5">
                <h3 className="font-bold text-zinc-900">Conversation details</h3>
                {selectedPeer ? (
                  <div className="mt-5">
                    <div className="h-16 w-16 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center text-xl font-bold">{initials(selectedPeer)}</div>
                    <p className="mt-3 font-semibold text-zinc-900">{displayName(selectedPeer)}</p>
                    <p className="text-sm text-zinc-500 break-all">{selectedPeer.email}</p>
                    <div className="mt-5 rounded-xl bg-gray-50 border p-3 text-sm text-zinc-600">Messages are saved in the local SQL database through Prisma. Firebase is only used to verify the logged-in user.</div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600 mt-3">No conversation selected.</p>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>

      {composerOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border overflow-hidden">
            <div className="px-6 py-5 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Start a new message</h2>
                <p className="text-sm text-zinc-500 mt-1">Search by email from users already synced into SQL.</p>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setComposerOpen(false)} type="button" aria-label="Close"><FiX /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 border rounded-2xl px-4 py-3 bg-gray-50">
                <FiSearch className="text-zinc-500" />
                <input className="flex-1 bg-transparent outline-none" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search user email" autoFocus />
              </div>
              {searchStatus && <p className="text-sm text-zinc-600 mt-3">{searchStatus}</p>}
              <div className="mt-4 space-y-2 max-h-80 overflow-auto">
                {userResults.map((u) => (
                  <button key={u.uid} type="button" onClick={() => openPeer(u)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F3FFFC] border text-left transition">
                    <div className="h-11 w-11 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center font-bold">{initials(u)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 truncate">{displayName(u)}</p>
                      <p className="text-sm text-zinc-500 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-5">Tip: after a user signs up or logs in once, their Firebase account is synced into SQL and becomes searchable here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
