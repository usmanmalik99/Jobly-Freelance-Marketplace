import Link from "next/link";
import HeadTag from "../../components/HeadTag";
import AppNavbar from "../../components/Navbar/AppNavbar";
import Footer from "../../components/Footer";
import {
  FiHelpCircle,
  FiMessageSquare,
  FiCreditCard,
  FiBriefcase,
  FiSearch,
  FiShield,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";

const helpTopics = [
  {
    icon: <FiUser />,
    title: "Create your account",
    body: "Sign up with email and password, then use the same account to browse jobs, message users, and manage your work.",
    href: "/account-security/signup",
  },
  {
    icon: <FiSearch />,
    title: "Find work",
    body: "Browse jobs by category, open today’s jobs, and review job details before deciding what to apply for.",
    href: "/jobs/all-jobs",
  },
  {
    icon: <FiBriefcase />,
    title: "Track your jobs",
    body: "Your jobs page shows active, pending, and completed work from the backend. If you have no orders, the page starts at zero.",
    href: "/myjobs",
  },
  {
    icon: <FiMessageSquare />,
    title: "Use messages",
    body: "Search a registered user by email and start a conversation. New incoming messages appear in notifications.",
    href: "/messages",
  },
  {
    icon: <FiCreditCard />,
    title: "Payments",
    body: "Payment pages use a safe demo API mode for portfolio testing. They record requests without processing real money.",
    href: "/payments/bank?mode=pay",
  },
  {
    icon: <FiShield />,
    title: "Account safety",
    body: "Use a test account for local demos, never commit private environment files, and keep payment mode in demo for public testing.",
    href: "/settings",
  },
];

const faqs = [
  {
    q: "Why are my job counts showing zero?",
    a: "That is correct when no client order exists for your account. Once a job record is created for you, pending, in-progress, completed, and earnings totals update from the backend.",
  },
  {
    q: "Why can’t I message someone by email?",
    a: "The other user must sign up or log in once first, so their Firebase account can be synced into the app database.",
  },
  {
    q: "Are bank, card, or crypto payments real?",
    a: "No. This portfolio version uses demo API routes. It shows the backend flow and database records without moving money or collecting sensitive payment data.",
  },
  {
    q: "What should I test first?",
    a: "Create two accounts, log in with each account once, send a message between them, open Notifications, then check My Jobs and Payments.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeadTag title="Help Center - Jobly" />
      <AppNavbar />
      <main className="flex-1">
        <section className="bg-white border-b">
          <div className="mx-auto max-w-[1100px] px-4 py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0C4A6E]/10 px-4 py-2 text-sm font-semibold text-[#0C4A6E]">
                <FiHelpCircle /> Help Center
              </div>
              <h1 className="mt-5 text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
                How can we help you use Jobly?
              </h1>
              <p className="mt-3 text-zinc-600 leading-7">
                Learn how to create an account, find work, manage jobs, message other users, and test the demo payment flow safely.
              </p>
            </div>

            <div className="mt-8 max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3">
              <FiSearch className="text-zinc-500" />
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Search help topics, payments, messages, jobs..."
                aria-label="Search help topics"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 py-10">
          <div className="grid md:grid-cols-3 gap-4">
            {helpTopics.map((topic) => (
              <Link key={topic.title} href={topic.href} legacyBehavior>
                <a className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition block">
                  <div className="h-11 w-11 rounded-2xl bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center text-xl">
                    {topic.icon}
                  </div>
                  <h2 className="mt-5 font-bold text-zinc-900">{topic.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{topic.body}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#0C4A6E]">
                    Open topic →
                  </span>
                </a>
              </Link>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_340px] gap-6">
            <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b">
                <h2 className="text-xl font-bold text-zinc-900">Frequently asked questions</h2>
                <p className="text-sm text-zinc-600 mt-1">Quick answers for local testing and basic marketplace flow.</p>
              </div>
              <div className="divide-y">
                {faqs.map((faq) => (
                  <div key={faq.q} className="px-6 py-5">
                    <h3 className="font-semibold text-zinc-900">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-[#0C4A6E] p-6 text-white shadow-sm h-fit">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
                <FiCheckCircle />
              </div>
              <h2 className="mt-5 text-xl font-bold">Recommended test flow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-white/90 list-decimal list-inside">
                <li>Create two accounts.</li>
                <li>Log in once with each account.</li>
                <li>Send a message between accounts.</li>
                <li>Open Notifications to see new message updates.</li>
                <li>Open My Jobs to confirm empty accounts show zero jobs.</li>
              </ol>
              <Link href="/messages" legacyBehavior>
                <a className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0C4A6E] hover:bg-gray-100">
                  Start with Messages
                </a>
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
