import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import HeadTag from "../../components/HeadTag";
import LoginSignupHeader from "../../components/LoginSignupHeader";
import LoginSignupFooter from "../../components/LoginSignupFooter";
import { FcConferenceCall, FcReadingEbook, FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { syncCurrentUser } from "../../lib/apiClient";

const SignUp = () => {
  const router = useRouter();

  // ---- Account Type UI ----
  const [role, setRole] = useState(""); // "client" | "freelancer" | ""
  const [showClientForm, setShowClientForm] = useState(false);
  const [showFreelancerForm, setShowFreelancerForm] = useState(false);

  // ---- Form + status ----
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });

  const buttonText = useMemo(() => {
    if (role === "client") return "Join as a Client";
    if (role === "freelancer") return "Apply as a Freelancer";
    return "Create Account";
  }, [role]);

  const canContinue = useMemo(
    () => role === "client" || role === "freelancer",
    [role]
  );

  const updateField = (key) => (e) => {
    setStatus((s) => ({ ...s, error: "" }));
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handlePickClient = () => setRole("client");
  const handlePickFreelancer = () => setRole("freelancer");

  const handleContinue = () => {
    if (!canContinue) return;

    if (role === "client") {
      setShowClientForm(true);
      setShowFreelancerForm(false);
    } else {
      setShowFreelancerForm(true);
      setShowClientForm(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!role) {
      setStatus({ loading: false, error: "Please select Client or Freelancer." });
      return;
    }

    setStatus({ loading: true, error: "" });

    const email = form.email.trim();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      // 1) Create Auth account
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        form.password
      );

      const user = cred.user;

      // 2) Set displayName in Firebase Auth (so it shows in UI if you use auth.currentUser.displayName)
      await updateProfile(user, {
        displayName: fullName || "User",
      });

      // 3) Sync Firebase Auth profile into SQL through the backend.
      // Firebase stays for authentication only; profile/messages records live in Prisma/SQLite.
      await syncCurrentUser(user, { firstName, lastName, role });

      // 4) Go to login
      router.push("/account-security/login");
    } catch (err) {
      setStatus({
        loading: false,
        error: err?.message || "Signup failed. Please try again.",
      });
      return;
    }

    setStatus((s) => ({ ...s, loading: false }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeadTag title="Create an Account - Jobly" />
      <LoginSignupHeader />

      <main>
        {/* ================= Choose Role Section =================== */}
        {!(showClientForm || showFreelancerForm) && (
          <section className="container mx-auto xl:my-14 lg:my-10 md:my-7 my-5 py-3 md:px-5 sm:px-7 px-3 md:flex md:justify-center">
            <div className="sm:border border-gray-300 rounded-xl">
              <div className="lg:px-24 md:px-20 sm:px-10 sm:pt-10 pb-10 flex flex-col justify-center md:items-center">
                <h2 className="font-semibold text-zinc-800 md:text-3xl text-2xl text-center">
                  Join as a client or freelancer
                </h2>

                <div className="flex md:flex-row flex-col items-center md:space-x-8 md:space-y-0 space-y-5 mt-10">
                  {/* Client */}
                  <div
                    className={`${
                      role === "client"
                        ? "bg-[#0C4A6E]"
                        : "bg-[#e5ecea] hover:bg-[#d1dfdb]"
                    } rounded-xl py-7 sm:px-8 px-5 flex flex-col items-center space-y-4 md:max-w-[17rem] md:w-auto w-full cursor-pointer transition`}
                    onClick={handlePickClient}
                  >
                    <FcConferenceCall className="text-5xl" />
                    <h4
                      className={`${
                        role === "client" ? "text-[#e5ecea]" : "text-zinc-800"
                      } font-semibold text-lg text-center`}
                    >
                      I’m a client, hiring for a project
                    </h4>
                  </div>

                  {/* Freelancer */}
                  <div
                    className={`${
                      role === "freelancer"
                        ? "bg-[#0C4A6E]"
                        : "bg-[#e5ecea] hover:bg-[#d1dfdb]"
                    } rounded-xl py-7 sm:px-8 px-5 flex flex-col items-center space-y-4 md:max-w-[17rem] md:w-auto w-full cursor-pointer transition`}
                    onClick={handlePickFreelancer}
                  >
                    <FcReadingEbook className="text-5xl" />
                    <h4
                      className={`${
                        role === "freelancer"
                          ? "text-[#e5ecea]"
                          : "text-zinc-800"
                      } font-semibold text-lg text-center`}
                    >
                      I’m a freelancer, looking for work
                    </h4>
                  </div>
                </div>

                <button
                  className={`${
                    canContinue
                      ? "bg-[#0C4A6E] hover:bg-[#18465f] text-[#e5ecea]"
                      : "bg-[#e5ecea] hover:bg-[#d1dfdb] text-gray-500"
                  } py-2 md:px-20 px-3 mt-10 rounded-full font-semibold transition md:w-auto w-full`}
                  onClick={handleContinue}
                  disabled={!canContinue}
                  type="button"
                >
                  {buttonText}
                </button>

                <div className="mt-7">
                  <p className="text-zinc-800 text-center">
                    Already have an account?
                    <Link href="/account-security/login" legacyBehavior>
                      <a className="font-semibold text-blue-700 hover:underline">
                        {" "}
                        Log In{" "}
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================== Client / Freelancer Form ====================== */}
        {(showClientForm || showFreelancerForm) && (
          <section className="container mx-auto xl:my-14 lg:my-10 md:my-7 my-5 py-3 md:px-5 sm:px-7 px-3 md:flex md:justify-center">
            <div className="sm:border border-gray-300 rounded-xl">
              <div className="sm:px-7 sm:pt-10 pb-10 flex flex-col justify-center md:items-center">
                <h2 className="font-semibold text-zinc-800 md:text-3xl text-2xl text-center">
                  Sign up to find work you love
                </h2>

                <button
                  type="button"
                  className="w-full py-2 px-3 bg-white border border-gray-600 rounded-full font-semibold text-zinc-800 transition hover:bg-gray-100 flex items-center justify-center mt-5"
                >
                  <FcGoogle className="text-xl mr-2" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="w-full py-2 px-3 bg-sky-600 rounded-full font-semibold text-white transition hover:bg-sky-700 flex items-center justify-center mt-5"
                >
                  <FaLinkedin className="text-xl mr-2" />
                  Continue with LinkedIn
                </button>

                <div className="flex w-full mt-5 items-center space-x-2">
                  <span className="border-b w-full border-gray-300 mt-1"></span>
                  <span className="text-zinc-600">or</span>
                  <span className="border-b w-full border-gray-300 mt-1"></span>
                </div>

                <form
                  className="mt-5 space-y-5 sm:w-auto md:w-[42rem] w-full"
                  onSubmit={handleRegister}
                >
                  <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5">
                    <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3] w-full">
                      <input
                        type="text"
                        className="flex-grow focus:outline-none bg-transparent text-zinc-700"
                        placeholder="First name"
                        value={form.firstName}
                        onChange={updateField("firstName")}
                        required
                      />
                    </div>

                    <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3] w-full">
                      <input
                        type="text"
                        className="flex-grow focus:outline-none bg-transparent text-zinc-700"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={updateField("lastName")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3] w-full">
                    <input
                      type="email"
                      className="flex-grow focus:outline-none bg-transparent text-zinc-700"
                      placeholder="Email"
                      value={form.email}
                      onChange={updateField("email")}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3] w-full">
                    <input
                      type="password"
                      className="flex-grow focus:outline-none bg-transparent text-zinc-700"
                      placeholder="Password"
                      value={form.password}
                      onChange={updateField("password")}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {status.error ? (
                    <p className="text-sm text-red-600">{status.error}</p>
                  ) : null}

                  <button
                    className="w-full py-2 px-3 bg-[#0C4A6E] rounded-full font-semibold text-white transition hover:bg-[#18465f] disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={status.loading}
                  >
                    {status.loading ? "Creating account..." : "Create an Account"}
                  </button>
                </form>

                <div className="mt-7">
                  <p className="text-zinc-800 text-center">
                    Already have an account?
                    <Link href="/account-security/login" legacyBehavior>
                      <a className="font-semibold text-blue-700 hover:underline">
                        {" "}
                        Log In{" "}
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <LoginSignupFooter />
    </div>
  );
};

export default SignUp;
