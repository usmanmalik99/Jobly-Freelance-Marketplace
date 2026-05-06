
import Link from "next/link";
import { useRouter } from "next/router";
import AppNavbar from "../../components/Navbar/AppNavbar";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const provider = String(router.query.provider || "payment");
  const isDemo = String(router.query.mode || "") === "demo";

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#0C4A6E]/10 text-[#0C4A6E] flex items-center justify-center text-2xl font-bold">✓</div>
          <h1 className="text-2xl font-bold text-zinc-900 mt-5">{isDemo ? "Demo API Request Created" : "Payment Started Successfully"}</h1>
          <p className="text-zinc-600 mt-3">
            {isDemo
              ? `The ${provider} demo API route saved this request in SQL. No real money, card charge, bank payout, or crypto transfer happened.`
              : "The provider accepted the checkout flow. In production, a webhook should update the final payment status."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/payments/bank"><a className="inline-block px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold">Back to Payments</a></Link>
            <Link href="/jobs/all-jobs"><a className="inline-block px-6 py-2 rounded-full border border-gray-300 text-zinc-800 font-semibold">Back to Jobs</a></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
