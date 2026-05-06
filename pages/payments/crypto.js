
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppNavbar from "../../components/Navbar/AppNavbar";
import useAuth from "../../lib/useAuth";
import { authedFetch } from "../../lib/apiClient";

export default function PaymentsCryptoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState("pay");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [network, setNetwork] = useState("USDC / Base");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const q = String(router.query.mode || "").toLowerCase();
    setMode(["deposit", "withdraw", "pay"].includes(q) ? q : "pay");
  }, [router.isReady, router.query.mode]);

  const title = mode === "withdraw" ? "Withdraw Earnings (Crypto)" : "Crypto Payments";
  const subtitle =
    mode === "withdraw"
      ? "Save a demo crypto withdrawal request for review. No crypto is sent."
      : "Create a demo Coinbase-style charge request. No real crypto is collected.";

  const createCoinbaseCharge = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const payload = user
        ? await authedFetch(user, "/api/payments/coinbase-charge", {
            method: "POST",
            body: JSON.stringify({ amount, action: mode }),
          })
        : await fetch("/api/payments/coinbase-charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, action: mode }),
          }).then(async (r) => {
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data?.error || "Crypto request failed.");
            return data;
          });

      if (payload?.url) router.push(payload.url);
      else setStatus(payload?.message || "Demo Coinbase request saved in SQL.");
    } catch (err) {
      setStatus(err.message || "Crypto payment request failed.");
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
        body: JSON.stringify({ method: "crypto", amount, destination: `${network}: ${wallet}` }),
      });
      setAmount("");
      setWallet("");
      setStatus("Demo crypto withdrawal request saved in SQL. No real transfer was executed.");
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
              <ActionButton active={mode === "pay"} onClick={() => setMode("pay")} title="Pay with crypto" desc="Demo Coinbase-style API" />
              <ActionButton active={mode === "deposit"} onClick={() => setMode("deposit")} title="Deposit with crypto" desc="Save demo payment record" />
              <ActionButton active={mode === "withdraw"} onClick={() => setMode("withdraw")} title="Withdraw to wallet" desc="Save request for review" />
            </div>
            <button type="button" onClick={() => router.push("/payments/bank")} className="mt-6 w-full px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm font-semibold text-zinc-800">
              Switch to Bank Payments →
            </button>
          </aside>

          <section className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            {mode === "withdraw" ? (
              <WithdrawWalletForm amount={amount} setAmount={setAmount} wallet={wallet} setWallet={setWallet} network={network} setNetwork={setNetwork} loading={loading} onSubmit={submitWithdrawal} />
            ) : (
              <CoinbaseDemoForm mode={mode} amount={amount} setAmount={setAmount} loading={loading} onSubmit={createCoinbaseCharge} />
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
      <strong>Demo payment mode:</strong> this page calls backend API routes and saves records in SQL. It does not collect real crypto, private keys, or wallet funds.
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

function CoinbaseDemoForm({ mode, amount, setAmount, loading, onSubmit }) {
  const title = mode === "deposit" ? "Demo crypto deposit API" : "Demo crypto payment API";
  const cta = mode === "deposit" ? "Create Demo Crypto Deposit" : "Create Demo Crypto Payment";
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
      <p className="text-zinc-600 mt-1">Enter an amount only. The backend creates a Coinbase-style API record and redirects to a demo success page.</p>
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

function WithdrawWalletForm({ amount, setAmount, wallet, setWallet, network, setNetwork, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-lg font-bold text-zinc-900">Demo crypto withdrawal request</h2>
      <p className="text-zinc-600 mt-1">This saves a pending withdrawal request in SQL. Use a demo wallet label/address only.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Field label="Network / Coin">
          <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option>USDT / Tether</option>
            <option>ETH / Ethereum</option>
            <option>BTC / Bitcoin</option>
            <option>LTC / Litecoin</option>
          </select>
        </Field>
        <Field label="Amount to withdraw (USD)">
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" inputMode="decimal" required />
        </Field>
        <Field label="Demo wallet address or label">
          <input className="input" value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Enter demo wallet address" required />
        </Field>
      </div>
      <button disabled={loading} className="mt-6 w-full md:w-auto px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold hover:bg-[#18465f] disabled:opacity-60">
        {loading ? "Saving request..." : "Save Demo Crypto Withdrawal"}
      </button>
      <FormStyles />
    </form>
  );
}

function Field({ label, children }) {
  return <label className="block"><div className="text-sm font-semibold text-zinc-700 mb-2">{label}</div>{children}</label>;
}

function FormStyles() {
  return (
    <style jsx>{`
      .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 12px; outline: none; background: white; }
      .input:focus { border-color: #0c4a6e; box-shadow: 0 0 0 2px rgba(12, 74, 110, 0.15); }
    `}</style>
  );
}
