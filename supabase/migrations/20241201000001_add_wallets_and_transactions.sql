-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance decimal(15,2) NOT NULL DEFAULT 0.00,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, currency)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type varchar(20) NOT NULL CHECK (type IN ('top_up', 'transfer_in', 'transfer_out')),
    amount decimal(15,2) NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    description text,
    recipient_id uuid REFERENCES auth.users(id),
    status varchar(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_id varchar(100),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type varchar(20) NOT NULL CHECK (type IN ('bank_account', 'credit_card', 'debit_card')),
    name varchar(100) NOT NULL,
    details jsonb NOT NULL,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);

-- Function to create default wallet for new users
CREATE OR REPLACE FUNCTION public.create_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'USD');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet when user is created
DROP TRIGGER IF EXISTS on_auth_user_wallet_created ON auth.users;
CREATE TRIGGER on_auth_user_wallet_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_wallet();

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'top_up' OR NEW.type = 'transfer_in' THEN
    UPDATE public.wallets 
    SET balance = balance + NEW.amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.wallet_id;
  ELSIF NEW.type = 'transfer_out' THEN
    UPDATE public.wallets 
    SET balance = balance - NEW.amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.wallet_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update wallet balance when transaction is created
DROP TRIGGER IF EXISTS on_transaction_created ON public.transactions;
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Enable realtime for all tables
alter publication supabase_realtime add table wallets;
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table payment_methods;
