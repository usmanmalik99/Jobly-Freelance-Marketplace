
import Link from "next/link";
import AppNavbar from "../../components/Navbar/AppNavbar";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Payment Cancelled</h1>
          <p className="text-zinc-600 mt-3">The payment flow was cancelled. No record was completed.</p>
          <Link href="/payments/bank"><a className="inline-block mt-6 px-6 py-2 rounded-full bg-[#0C4A6E] text-white font-semibold">Back to Payments</a></Link>
        </div>
      </main>
    </div>
  );
}
