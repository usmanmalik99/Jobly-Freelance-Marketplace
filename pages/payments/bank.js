
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppNavbar from "../../components/Navbar/AppNavbar";
import useAuth from "../../lib/useAuth";
import { authedFetch } from "../../lib/apiClient";

export default function PaymentsBankPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState("pay");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const q = String(router.query.mode || "").toLowerCase();
    setMode(["deposit", "withdraw", "pay"].includes(q) ? q : "pay");
  }, [router.isReady, router.query.mode]);

  const title = mode === "withdraw" ? "Withdraw Earnings (Bank)" : "Bank/Card Payments";
  const subtitle =
    mode === "withdraw"
      ? "Save a demo bank withdrawal request for review. No real payout is sent."
      : "Create a demo Stripe-style checkout request. No real card or bank payment is processed.";

  const createStripeRequest = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const payload = user
        ? await authedFetch(user, "/api/payments/stripe-checkout", {
            method: "POST",
            body: JSON.stringify({ amount, action: mode }),
          })
        : await fetch("/api/payments/stripe-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, action: mode }),
          }).then(async (r) => {
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data?.error || "Payment request failed.");
            return data;
          });

      if (payload?.url) router.push(payload.url);
      else setStatus(payload?.message || "Demo Stripe request saved in SQL.");
    } catch (err) {
      setStatus(err.message || "Stripe demo request failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!user) {
      setStatus("Please log in before creating a withdrawal request.");
      return;
    }

    setLoading(true);
    try {
      await authedFetch(user, "/api/payments/withdraw-request", {
        method: "POST",
        body: JSON.stringify({ method: "bank", amount, destination }),
      });
      setAmount("");
      setDestination("");
      setStatus("Demo bank withdrawal request saved in SQL. No real payout was executed.");
    } catch (err) {
      setStatus(err.message || "Withdrawal request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />

      <main className="mx-auto max-w-[1100px] px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="text-zinc-600 mt-1">{subtitle}</p>

        <DemoNotice />

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 bg-white border rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-zinc-800">Choose an action</h2>
            <div className="mt-4 space-y-2">
              <ActionButton active={mode === "pay"} onClick={() => setMode("pay")} title="Pay with card" desc="Demo Stripe checkout API" />
              <ActionButton active={mode === "deposit"} onClick={() => setMode("deposit")} title="Deposit funds" desc="Demo balance funding request" />
              <ActionButton active={mode === "withdraw"} onClick={() => setMode("withdraw")} title="Withdraw to bank" desc="Save request for review" />
            </div>
            <button type="button" onClick={() => router.push("/payments/crypto")} className="mt-6 w-full px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm font-semibold text-zinc-800">
              Switch to Crypto Payments →
            </button>
          </aside>

          <section className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            {mode === "withdraw" ? (
              <WithdrawBankForm amount={amount} setAmount={setAmount} destination={destination} setDestination={setDestination} loading={loading} onSubmit={submitWithdrawal} />
            ) : (
              <StripeDemoForm mode={mode} amount={amount} setAmount={setAmount} loading={loading} onSubmit={createStripeRequest} />
            )}
            {status && <p className="text-sm text-zinc-700 bg-gray-100 rounded-xl px-3 py-2 mt-5">{status}</p>}
          </section>
        </div>
      </main>
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Demo payment mode:</strong> this page calls backend API routes and saves records in SQL. It does not ask for card numbers, routing numbers, or real banking credentials.
    </div>
  );
}

function ActionButton({ active, onClick, title, desc }) {
  return (
    <button type="button" onClick={onClick} className={`w-full text-left px-4 py-3 rounded-xl border ${active ? "border-[#0C4A6E] bg-[#0C4A6E]/5" : "hover:bg-gray-50"}`}>
      <div className="font-semibold text-zinc-800">{title}</div>
      <div className="text-sm text-zinc-600">{desc}</div>
    </button>
  );
}

function StripeDemoForm({ mode, amount, setAmount, loading, onSubmit }) {
  const title = mode === "deposit" ? "Demo card deposit API" : "Demo card payment API";
  const cta = mode === "deposit" ? "Create Demo Deposit" : "Create Demo Payment";
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
      <p className="text-zinc-600 mt-1">Enter an amount only. The backend creates a Stripe-style API record and redirects to a demo success page.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Amount (USD)">
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" inputMode="decimal" required />
        </Field>
      </div>
      <button disabled={loading} className="mt-6 w-full md:w-auto px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold hover:bg-[#18465f] disabled:opacity-60">
        {loading ? "Creating request..." : cta}
      </button>
      <FormStyles />
    </form>
  );
}

function WithdrawBankForm({ amount, setAmount, destination, setDestination, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-lg font-bold text-zinc-900">Demo bank withdrawal request</h2>
      <p className="text-zinc-600 mt-1">Save a pending withdrawal request in SQL. Use a label like “Checking account ending 1234” instead of real bank details.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Amount to withdraw (USD)">
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" inputMode="decimal" required />
        </Field>
        <Field label="Destination label">
          <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Example: Checking account ending 1234" required />
        </Field>
      </div>
      <button disabled={loading} className="mt-6 w-full md:w-auto px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold hover:bg-[#18465f] disabled:opacity-60">
        {loading ? "Saving request..." : "Save Demo Withdrawal"}
      </button>
      <FormStyles />
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-zinc-700 mb-2">{label}</div>
      {children}
    </label>
  );
}

function FormStyles() {
  return (
    <style jsx>{`
      .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 12px; outline: none; background: white; }
      .input:focus { border-color: #0c4a6e; box-shadow: 0 0 0 2px rgba(12, 74, 110, 0.15); }
    `}</style>
  );
}
