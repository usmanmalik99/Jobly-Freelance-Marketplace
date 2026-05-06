import Link from "next/link";
import AppNavbar from "../components/Navbar/AppNavbar";

export default function ChatTestRedirect() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Messaging Test Page Moved</h1>
          <p className="text-zinc-600 mt-3">
            The old experimental chat test page was removed. Messaging now uses Prisma/SQLite through the main inbox.
          </p>
          <Link href="/messages"><a className="inline-block mt-6 px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold">Open Messages</a></Link>
        </div>
      </main>
    </div>
  );
}
