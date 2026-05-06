import HeadTag from "../../components/HeadTag";
import AppNavbar from "../../components/Navbar/AppNavbar";
import Footer from "../../components/Footer";

export default function Settings() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeadTag title="Settings | Jobly" />
      <AppNavbar />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-[900px] px-4 py-10">
          
          <h1 className="text-2xl font-bold text-zinc-800 mb-6">
            Account Settings
          </h1>

          <div className="bg-white rounded-xl shadow-sm divide-y">
            
            {/* Profile */}
            <div className="p-6">
              <h2 className="font-semibold text-zinc-800 mb-2">
                Profile Information
              </h2>
              <p className="text-zinc-500 text-sm mb-4">
                Update your personal details
              </p>
              <button className="px-4 py-2 border rounded-lg text-sm font-semibold text-[#0C4A6E] hover:bg-gray-50">
                Edit Profile
              </button>
            </div>

            {/* Email */}
            <div className="p-6">
              <h2 className="font-semibold text-zinc-800 mb-2">
                Email Address
              </h2>
              <p className="text-zinc-500 text-sm mb-4">
                user@email.com
              </p>
              <button className="px-4 py-2 border rounded-lg text-sm font-semibold text-[#0C4A6E] hover:bg-gray-50">
                Change Email
              </button>
            </div>

            {/* Password */}
            <div className="p-6">
              <h2 className="font-semibold text-zinc-800 mb-2">
                Password & Security
              </h2>
              <p className="text-zinc-500 text-sm mb-4">
                Update your password and security settings
              </p>
              <button className="px-4 py-2 border rounded-lg text-sm font-semibold text-[#0C4A6E] hover:bg-gray-50">
                Change Password
              </button>
            </div>

            {/* Danger */}
            <div className="p-6">
              <h2 className="font-semibold text-red-600 mb-2">
                Danger Zone
              </h2>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
