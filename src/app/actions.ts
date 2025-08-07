"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const topUpAction = async (formData: FormData) => {
  console.log("TopUp Action Started");
  console.log("FormData entries:", Array.from(formData.entries()));

  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "Top-up";
  const paymentMethodId = formData.get("payment_method_id")?.toString();

  console.log("Parsed values:", { amount, description, paymentMethodId });

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("User check:", { user: user?.id, userError });

  if (!user) {
    console.log("User not authenticated");
    return { success: false, error: "User not authenticated" };
  }

  if (!amount || amount <= 0) {
    console.log("Invalid amount:", amount);
    return { success: false, error: "Invalid amount" };
  }

  try {
    // Get user's wallet
    console.log("Fetching wallet for user:", user.id);
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    console.log("Wallet query result:", { wallet, walletError });

    let currentWallet = wallet;

    if (walletError) {
      console.error("Wallet error:", walletError);
      // Try to create wallet if it doesn't exist
      if (walletError.code === "PGRST116") {
        console.log("Creating new wallet for user");
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            balance: 0,
            currency: "USD",
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create wallet:", createError);
          return { success: false, error: "Failed to create wallet" };
        }

        console.log("New wallet created:", newWallet);
        currentWallet = newWallet;
      } else {
        return {
          success: false,
          error: "Wallet error: " + walletError.message,
        };
      }
    }

    if (!currentWallet) {
      return { success: false, error: "Wallet not found" };
    }

    // Create transaction record
    console.log("Creating transaction for wallet:", currentWallet.id);
    const transactionData = {
      wallet_id: currentWallet.id,
      user_id: user.id,
      type: "top_up",
      amount: amount,
      currency: "USD",
      description: description,
      status: "completed",
      reference_id: `topup_${Date.now()}`,
    };

    console.log("Transaction data:", transactionData);

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      return {
        success: false,
        error: "Failed to process top-up: " + transactionError.message,
      };
    }

    console.log("Transaction created successfully:", transaction);

    return {
      success: true,
      message: `Successfully topped up ${amount.toFixed(2)}`,
    };
  } catch (error) {
    console.error("Top-up error:", error);
    return {
      success: false,
      error: "Failed to process top-up: " + (error as Error).message,
    };
  }
};

export const transferAction = async (formData: FormData) => {
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "Transfer";
  const recipientEmail = formData.get("recipient_email")?.toString();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  if (!recipientEmail) {
    return { success: false, error: "Recipient email is required" };
  }

  try {
    // Get sender's wallet
    const { data: senderWallet, error: senderWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (senderWalletError || !senderWallet) {
      return { success: false, error: "Sender wallet not found" };
    }

    // Check if sender has sufficient balance
    if (senderWallet.balance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Find recipient user
    const { data: recipientUser, error: recipientError } = await supabase
      .from("users")
      .select("id")
      .eq("email", recipientEmail)
      .single();

    if (recipientError || !recipientUser) {
      return { success: false, error: "Recipient not found" };
    }

    // Get recipient's wallet
    const { data: recipientWallet, error: recipientWalletError } =
      await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", recipientUser.id)
        .single();

    if (recipientWalletError || !recipientWallet) {
      return { success: false, error: "Recipient wallet not found" };
    }

    const referenceId = `transfer_${Date.now()}`;

    // Create outgoing transaction for sender
    const { error: senderTransactionError } = await supabase
      .from("transactions")
      .insert({
        wallet_id: senderWallet.id,
        user_id: user.id,
        type: "transfer_out",
        amount: amount,
        currency: "USD",
        description: description,
        recipient_id: recipientUser.id,
        status: "completed",
        reference_id: referenceId,
      });

    if (senderTransactionError) {
      console.error("Sender transaction error:", senderTransactionError);
      return { success: false, error: "Failed to process transfer" };
    }

    // Create incoming transaction for recipient
    const { error: recipientTransactionError } = await supabase
      .from("transactions")
      .insert({
        wallet_id: recipientWallet.id,
        user_id: recipientUser.id,
        type: "transfer_in",
        amount: amount,
        currency: "USD",
        description: `Transfer from ${user.email}`,
        recipient_id: user.id,
        status: "completed",
        reference_id: referenceId,
      });

    if (recipientTransactionError) {
      console.error("Recipient transaction error:", recipientTransactionError);
      return { success: false, error: "Failed to process transfer" };
    }

    return {
      success: true,
      message: `Successfully transferred ${amount.toFixed(2)} to ${recipientEmail}`,
    };
  } catch (error) {
    console.error("Transfer error:", error);
    return { success: false, error: "Failed to process transfer" };
  }
};
