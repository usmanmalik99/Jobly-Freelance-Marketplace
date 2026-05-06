import React from "react";
import HeadTag from "../../components/HeadTag";
import LoggedInNavbar from "../../components/Navbar/LoggedInNavbar";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeadTag title="Profile - Jobly" />

      <LoggedInNavbar />

      <main className="flex-1">
        <section className="mx-auto max-w-[1200px] px-4 py-8">
          <h1 className="text-2xl font-bold text-zinc-800">Profile</h1>
          <p className="text-zinc-600 mt-2">
            This is your Jobly profile page (Upwork-style). You can add profile details here.
          </p>

          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Left: profile card */}
            <div className="lg:col-span-1 bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#0C4A6E] text-white flex items-center justify-center font-bold">
                  U
                </div>
                <div>
                  <div className="font-semibold text-zinc-800">Your Name</div>
                  <div className="text-sm text-zinc-500">Freelancer • New</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-zinc-600">
                Add your title, overview, and skills to start getting invites.
              </div>

              <button className="mt-4 w-full py-2 rounded-lg bg-[#0C4A6E] text-white font-semibold hover:bg-[#18465f] transition">
                Edit profile
              </button>
            </div>

            {/* Right: sections */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border rounded-xl p-5">
                <h2 className="font-semibold text-zinc-800">Overview</h2>
                <p className="text-zinc-600 mt-2 text-sm">
                  Write a short bio like Upwork: what you do, your strengths, and what you’re looking for.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-5">
                <h2 className="font-semibold text-zinc-800">Work History</h2>
                <p className="text-zinc-600 mt-2 text-sm">
                  Completed jobs will show here.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-5">
                <h2 className="font-semibold text-zinc-800">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["React", "Next.js", "Firebase", "QA Testing", "AWS"].map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full border text-sm text-zinc-700 bg-gray-50"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
