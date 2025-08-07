"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Send,
  CreditCard,
  Building,
  User,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { topUpAction, transferAction } from "@/app/actions";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "topup" | "transfer";
  currentBalance: number;
}

const paymentMethods = [
  {
    id: "1",
    type: "bank_account",
    name: "Chase Bank ****1234",
    icon: Building,
  },
  {
    id: "2",
    type: "credit_card",
    name: "Visa ****5678",
    icon: CreditCard,
  },
];

const recentContacts = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "JS",
  },
];

export function TransactionDialog({
  open,
  onOpenChange,
  type,
  currentBalance,
}: TransactionDialogProps) {
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("description", description);

      console.log("Form submission started", { type, amount, description });

      let result;
      if (type === "topup") {
        formData.append("payment_method_id", selectedPaymentMethod);
        console.log("Calling topUpAction with formData");
        result = await topUpAction(formData);
        console.log("TopUp result:", result);
      } else {
        formData.append("recipient_email", recipientEmail);
        console.log("Calling transferAction with formData");
        result = await transferAction(formData);
        console.log("Transfer result:", result);
      }

      if (result.success) {
        toast({
          title: type === "topup" ? "Top-up Successful" : "Transfer Successful",
          description: result.message,
        });

        // Reset form
        setAmount("");
        setSelectedPaymentMethod("");
        setRecipientEmail("");
        setDescription("");
        onOpenChange(false);

        // Refresh the page to show updated balance
        window.location.reload();
      } else {
        toast({
          title: "Transaction Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Transaction Failed",
        description:
          "Something went wrong. Please try again. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAmount = amount && parseFloat(amount) > 0;
  const hasInsufficientFunds =
    type === "transfer" && parseFloat(amount) > currentBalance;
  const canSubmit =
    isValidAmount &&
    (type === "topup" ? selectedPaymentMethod : recipientEmail) &&
    !hasInsufficientFunds;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "topup" ? (
              <>
                <Plus className="h-5 w-5 text-green-600" />
                Top Up Wallet
              </>
            ) : (
              <>
                <Send className="h-5 w-5 text-blue-600" />
                Transfer Money
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold"
                required
              />
            </div>
            {hasInsufficientFunds && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Insufficient funds. Available: {formatCurrency(currentBalance)}
              </div>
            )}
          </div>

          {/* Payment Method Selection (Top-up only) */}
          {type === "topup" && (
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{method.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {method.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recipient Selection (Transfer only) */}
          {type === "transfer" && (
            <div className="space-y-3">
              <Label htmlFor="recipient">Send to</Label>
              <Input
                id="recipient"
                name="recipient_email"
                type="email"
                placeholder="Enter email address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />

              {/* Recent Contacts */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recent contacts</p>
                <div className="space-y-1">
                  {recentContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setRecipientEmail(contact.email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {contact.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {contact.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder={
                type === "topup"
                  ? "Top-up from bank account"
                  : "What's this for?"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="flex-1"
            >
              {isLoading
                ? "Processing..."
                : type === "topup"
                  ? `Top Up ${amount ? formatCurrency(parseFloat(amount)) : ""}`
                  : `Send ${amount ? formatCurrency(parseFloat(amount)) : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
