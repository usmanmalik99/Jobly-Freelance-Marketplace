import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";

import HeadTag from "../../components/HeadTag";
import LoginSignupHeader from "../../components/LoginSignupHeader";
import LoginSignupFooter from "../../components/LoginSignupFooter";

import { BsFillPersonFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

import { auth } from "../../lib/firebase";
import { syncCurrentUser } from "../../lib/apiClient";

const Login = () => {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const canSubmit = useMemo(() => {
    return form.email.trim().length > 0 && form.password.length > 0 && !status.loading;
  }, [form.email, form.password, status.loading]);

  const updateField = (key) => (e) => {
    setStatus((s) => ({ ...s, error: "" }));
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus({ loading: true, error: "" });

    try {
      const email = form.email.trim();
      const cred = await signInWithEmailAndPassword(auth, email, form.password);
      await syncCurrentUser(cred.user);

      router.push("/jobs/all-jobs");
    } catch (err) {
      setStatus({
        loading: false,
        error: err?.message || "Login failed. Please check your credentials.",
      });
      return;
    }

    setStatus((s) => ({ ...s, loading: false }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ============== Head Tag =============== */}
      <HeadTag title="Log In - Jobly" />

      {/* ================== Header =================== */}
      <LoginSignupHeader />

      {/* ================= Main ==================== */}
      <main>
        <section className="container mx-auto xl:my-14 lg:my-10 md:my-7 my-5 py-3 md:px-5 sm:px-7 px-3 sm:flex sm:justify-center">
          <div className="sm:border border-gray-300 rounded-xl">
            <div className="sm:px-24 sm:pt-7 pb-7 flex flex-col justify-center items-center">
              {/* ================= Login title ==================== */}
              <h2 className="font-semibold text-zinc-800 md:text-3xl text-2xl">
                Log in to Jobly
              </h2>

              {/* ================= Login Email Form ==================== */}
              <form
                onSubmit={handleLoginSubmit}
                className="mt-7 space-y-4 sm:w-auto w-full"
              >
                <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg sm:w-[25rem] items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3]">
                  <BsFillPersonFill className="text-lg text-zinc-700 cursor-pointer hover:text-zinc-500" />
                  <input
                    className="flex-grow xl:w-full w-40 focus:outline-none bg-transparent mx-3 text-zinc-700"
                    placeholder="Username or Email"
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="flex flex-grow border-2 border-gray-300 transition rounded-lg sm:w-[25rem] items-center xl:px-6 px-3 py-1.5 hover:bg-[#F3FFFC] hover:ring-2 ring-[#729bb3]">
                  <BsFillPersonFill className="text-lg text-zinc-700 cursor-pointer hover:text-zinc-500" />
                  <input
                    className="flex-grow xl:w-full w-40 focus:outline-none bg-transparent mx-3 text-zinc-700"
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={updateField("password")}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {status.error ? (
                  <p className="text-sm text-red-600">{status.error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-2 px-3 bg-[#0C4A6E] rounded-full font-semibold text-white transition hover:bg-[#18465f] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status.loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {/* ================= Or section ==================== */}
              <div className="flex w-full mt-5 items-center space-x-2">
                <span className="border-b w-full border-gray-300 mt-1"></span>
                <span className="text-zinc-600">or</span>
                <span className="border-b w-full border-gray-300 mt-1"></span>
              </div>

              {/* ================= Continue with section ==================== */}
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
            </div>

            {/* ================= Don't have account section ================= */}
            <div className="lg:px-24 py-7 flex flex-col justify-center items-center border-t border-gray-300 mt-7">
              <div className="flex w-full justify-center items-center">
                <span className="text-zinc-600"> Don't have a Jobly Account? </span>
              </div>

              <div className="sm:w-auto w-full">
                <button
                  type="button"
                  className="w-full py-2 sm:px-20 px-3 border border-[#0C4A6E] rounded-full font-semibold text-[#0C4A6E] transition hover:border-[#0C4A6E] hover:text-[#0C4A6E] flex items-center justify-center mt-5"
                  onClick={() => router.push("/account-security/signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ==================== Footer ====================== */}
      <LoginSignupFooter />
    </div>
  );
};

export default Login;
