"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Send, Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";
import { TransactionDialog } from "./transaction-dialog";

interface WalletCardProps {
  balance: number;
  currency: string;
  recentTransactions?: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    created_at: string;
    status: string;
  }>;
}

export default function WalletCard({
  balance = 1250.75,
  currency = "USD",
  recentTransactions = [
    {
      id: "1",
      type: "top_up",
      amount: 100.0,
      description: "Bank Transfer",
      created_at: "2024-01-15T10:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      type: "transfer_out",
      amount: -25.5,
      description: "Payment to John Doe",
      created_at: "2024-01-14T15:45:00Z",
      status: "completed",
    },
    {
      id: "3",
      type: "transfer_in",
      amount: 75.25,
      description: "Payment from Jane Smith",
      created_at: "2024-01-13T09:20:00Z",
      status: "completed",
    },
  ],
}: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"topup" | "transfer">("topup");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "top_up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "transfer_in":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "transfer_out":
        return <Send className="h-4 w-4 text-red-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "top_up":
      case "transfer_in":
        return "text-green-600";
      case "transfer_out":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleTopUp = () => {
    setDialogType("topup");
    setDialogOpen(true);
  };

  const handleTransfer = () => {
    setDialogType("transfer");
    setDialogOpen(true);
  };

  return (
    <div className="bg-white space-y-6">
      {/* Main Wallet Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Digital Wallet
                </CardTitle>
                <p className="text-blue-100 text-sm">Main Balance</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/20"
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold">
                {showBalance ? formatCurrency(balance) : "••••••"}
              </p>
              <p className="text-blue-100 text-sm mt-1">Available Balance</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTopUp}
                className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up
              </Button>
              <Button
                onClick={handleTransfer}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10 font-medium"
              >
                <Send className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description || "Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-sm ${getTransactionColor(transaction.type)}`}
                    >
                      {transaction.type === "transfer_out" ? "-" : "+"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        currentBalance={balance}
      />
    </div>
  );
}
