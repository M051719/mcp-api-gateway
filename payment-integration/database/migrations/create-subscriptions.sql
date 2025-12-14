-- Database Migration: Create Subscription Tables
-- Run this in your Supabase SQL editor or via psql

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  
  -- Stripe fields
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- PayPal fields
  paypal_subscription_id VARCHAR(255),
  
  -- Common fields
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('basic', 'premium', 'vip')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'suspended', 'expired')),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  UNIQUE(stripe_subscription_id),
  UNIQUE(paypal_subscription_id)
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  transaction_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'failed', 'refunded', 'pending')),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(transaction_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_provider ON user_subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_id ON payment_history(transaction_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role has full access to subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for payment_history

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role has full access to payment history"
  ON payment_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_subscriptions TO service_role;
GRANT SELECT ON user_subscriptions TO authenticated;
GRANT ALL ON payment_history TO service_role;
GRANT SELECT ON payment_history TO authenticated;

-- Add helpful comments
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information from Stripe and PayPal';
COMMENT ON TABLE payment_history IS 'Logs all payment transactions';
COMMENT ON COLUMN user_subscriptions.provider IS 'Payment provider: stripe or paypal';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Subscription tier: basic, premium, or vip';
COMMENT ON COLUMN user_subscriptions.status IS 'Current status: active, canceled, past_due, suspended, or expired';

-- Verify tables were created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('user_subscriptions', 'payment_history')
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! Tables created:';
  RAISE NOTICE '  - user_subscriptions';
  RAISE NOTICE '  - payment_history';
  RAISE NOTICE 'Indexes, RLS policies, and triggers have been set up.';
END $$;
