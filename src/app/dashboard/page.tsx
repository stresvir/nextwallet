import DashboardNavbar from "@/components/dashboard-navbar";
import WalletCard from "@/components/wallet-card";
import { InfoIcon, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's wallet data
  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back!
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your digital wallet and transactions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <UserCircle size={40} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Wallet Card Section */}
          <section>
            <WalletCard
              balance={wallet?.balance || 0}
              currency={wallet?.currency || "USD"}
              recentTransactions={transactions || []}
            />
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <InfoIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">+$0.00</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <InfoIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="text-2xl font-bold text-blue-600">Active</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
