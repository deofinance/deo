-- ============================================================================
-- DEO FINANCE - COMPLETE DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- ENUMS AND CUSTOM TYPES
-- ============================================================================

-- Supported stablecoins
CREATE TYPE stablecoin_symbol AS ENUM ('USDC');

-- Supported blockchain networks
CREATE TYPE chain_id AS ENUM (
    '1',        -- Ethereum Mainnet
    '137',      -- Polygon
    '42161',    -- Arbitrum
    '10',       -- Optimism
    '56'        -- BSC
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'yield',
    'swap',
    'bridge',
    'spend',
    'transfer',
    'reward',
    'fee',
    'investment',
    'loan',
    'insurance'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'cancelled'
);

-- Risk levels
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');

-- Account types
CREATE TYPE account_type AS ENUM ('personal', 'business', 'institutional');

-- KYC verification status
CREATE TYPE kyc_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);

-- Card types
CREATE TYPE card_type AS ENUM ('virtual', 'physical');

-- Card status
CREATE TYPE card_status AS ENUM (
    'active',
    'blocked',
    'expired',
    'pending'
);

-- Investment strategy
CREATE TYPE investment_strategy AS ENUM (
    'Conservative',
    'Moderate',
    'Aggressive'
);

-- Investment frequency
CREATE TYPE investment_frequency AS ENUM (
    'weekly',
    'monthly',
    'quarterly'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    smart_wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    account_type account_type DEFAULT 'personal',
    kyc_status kyc_status DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_auth_at TIMESTAMPTZ,
    primary_auth_method VARCHAR(20) DEFAULT 'email',
    circle_user_id VARCHAR(255) UNIQUE,
    circle_wallet_set_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_smart_wallet_address ON users(smart_wallet_address);
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_circle_user_id ON users(circle_user_id);

COMMENT ON TABLE users IS 'Core user accounts';

-- User Authentication Methods
CREATE TABLE user_auth_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auth_type VARCHAR(20) NOT NULL,
    auth_identifier VARCHAR(255) NOT NULL,
    provider_user_id VARCHAR(255),
    provider_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ,
    
    UNIQUE(user_id, auth_type),
    UNIQUE(auth_type, auth_identifier)
);

CREATE INDEX idx_user_auth_methods_identifier ON user_auth_methods(auth_type, auth_identifier);
CREATE INDEX idx_user_auth_methods_user_id ON user_auth_methods(user_id);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    country_code VARCHAR(2),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_currency stablecoin_symbol DEFAULT 'USDC',
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- User Wallets
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chain_id chain_id NOT NULL,
    address VARCHAR(66) NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'circle',
    is_primary BOOLEAN DEFAULT false,
    label VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, address, chain_id)
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_chain_address ON user_wallets(chain_id, address);

-- Stablecoin Balances
CREATE TABLE stablecoin_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
    stablecoin stablecoin_symbol NOT NULL,
    chain_id chain_id NOT NULL,
    balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
    locked_balance DECIMAL(36, 18) DEFAULT 0,
    available_balance DECIMAL(36, 18) GENERATED ALWAYS AS (balance - locked_balance) STORED,
    contract_address VARCHAR(66) NOT NULL,
    last_sync_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, stablecoin, chain_id, wallet_id)
);

CREATE INDEX idx_stablecoin_balances_user_id ON stablecoin_balances(user_id);
CREATE INDEX idx_stablecoin_balances_user_chain_coin ON stablecoin_balances(user_id, chain_id, stablecoin);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66) UNIQUE,
    transaction_type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    amount DECIMAL(36, 18) NOT NULL,
    fee_amount DECIMAL(36, 18) DEFAULT 0,
    stablecoin stablecoin_symbol NOT NULL,
    chain_id chain_id NOT NULL,
    from_address VARCHAR(66),
    to_address VARCHAR(66),
    from_chain chain_id,
    to_chain chain_id,
    protocol_name VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    block_number BIGINT,
    block_timestamp TIMESTAMPTZ,
    gas_used BIGINT,
    gas_price DECIMAL(36, 18),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type_status ON transactions(transaction_type, status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_chain_id ON transactions(chain_id);

-- User Cards
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_type card_type NOT NULL,
    card_status card_status DEFAULT 'pending',
    card_number_hash VARCHAR(64),
    last_four_digits VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    cvv_hash VARCHAR(64),
    cardholder_name VARCHAR(200),
    billing_address JSONB,
    daily_limit DECIMAL(10, 2) DEFAULT 1000,
    monthly_limit DECIMAL(10, 2) DEFAULT 10000,
    currency stablecoin_symbol DEFAULT 'USDC',
    is_primary BOOLEAN DEFAULT false,
    stripe_card_id VARCHAR(255),
    stripe_cardholder_id VARCHAR(255),
    issued_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    blocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_status ON user_cards(card_status);
CREATE INDEX idx_user_cards_stripe_id ON user_cards(stripe_card_id);

-- Card Transactions
CREATE TABLE card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    merchant_name VARCHAR(200),
    merchant_category VARCHAR(100),
    merchant_country VARCHAR(2),
    amount DECIMAL(10, 2) NOT NULL,
    currency stablecoin_symbol NOT NULL,
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    cashback_amount DECIMAL(10, 2) DEFAULT 0,
    status transaction_status DEFAULT 'completed',
    authorization_code VARCHAR(20),
    reference_number VARCHAR(50),
    transaction_date TIMESTAMPTZ NOT NULL,
    settlement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX idx_card_transactions_date ON card_transactions(transaction_date DESC);

-- DeFi Protocols
CREATE TABLE defi_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    protocol_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    risk_level risk_level NOT NULL,
    supported_chains chain_id[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_defi_protocols_key ON defi_protocols(protocol_key);
CREATE INDEX idx_defi_protocols_active ON defi_protocols(is_active);

-- Yield Positions
CREATE TABLE yield_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES defi_protocols(id),
    stablecoin stablecoin_symbol NOT NULL,
    chain_id chain_id NOT NULL,
    deposit_amount DECIMAL(36, 18) NOT NULL,
    current_balance DECIMAL(36, 18) NOT NULL,
    earned_yield DECIMAL(36, 18) DEFAULT 0,
    entry_apy DECIMAL(5, 2) NOT NULL,
    current_apy DECIMAL(5, 2) NOT NULL,
    duration_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    deposit_tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    withdrawn_at TIMESTAMPTZ
);

CREATE INDEX idx_yield_positions_user_id ON yield_positions(user_id);
CREATE INDEX idx_yield_positions_protocol_id ON yield_positions(protocol_id);
CREATE INDEX idx_yield_positions_active ON yield_positions(is_active);

-- Tokenized Assets
CREATE TABLE tokenized_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    current_price DECIMAL(18, 8) NOT NULL,
    market_cap DECIMAL(20, 2),
    total_supply DECIMAL(36, 18),
    circulating_supply DECIMAL(36, 18),
    min_investment DECIMAL(18, 8) NOT NULL,
    current_apy DECIMAL(5, 2) NOT NULL,
    risk_level risk_level NOT NULL,
    underlying_asset TEXT,
    provider VARCHAR(100),
    contract_address VARCHAR(66),
    chain_id chain_id NOT NULL,
    features TEXT[],
    launch_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tokenized_assets_category ON tokenized_assets(category);
CREATE INDEX idx_tokenized_assets_chain_id ON tokenized_assets(chain_id);
CREATE INDEX idx_tokenized_assets_active ON tokenized_assets(is_active);

-- User Investments
CREATE TABLE user_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES tokenized_assets(id),
    quantity DECIMAL(36, 18) NOT NULL,
    average_cost DECIMAL(18, 8) NOT NULL,
    total_invested DECIMAL(20, 2) NOT NULL,
    current_value DECIMAL(20, 2) NOT NULL,
    unrealized_pnl DECIMAL(20, 2) GENERATED ALWAYS AS (current_value - total_invested) STORED,
    currency stablecoin_symbol NOT NULL,
    first_purchase_at TIMESTAMPTZ NOT NULL,
    last_purchase_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX idx_user_investments_asset_id ON user_investments(asset_id);

-- Loan Applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_amount DECIMAL(20, 2) NOT NULL,
    loan_currency stablecoin_symbol NOT NULL,
    collateral_amount DECIMAL(36, 18) NOT NULL,
    collateral_token VARCHAR(20) NOT NULL,
    collateral_chain chain_id NOT NULL,
    ltv_ratio DECIMAL(5, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    application_status VARCHAR(50) DEFAULT 'pending',
    risk_assessment JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(application_status);

-- Insurance Policies
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_name VARCHAR(200) NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    coverage_amount DECIMAL(20, 2) NOT NULL,
    premium_amount DECIMAL(20, 2) NOT NULL,
    premium_frequency VARCHAR(20) NOT NULL,
    coverage_details JSONB NOT NULL,
    policy_status VARCHAR(50) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_premium_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX idx_insurance_policies_status ON insurance_policies(policy_status);

-- User Notifications
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(user_id, is_read);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stablecoin_balances_updated_at BEFORE UPDATE ON stablecoin_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cards_updated_at BEFORE UPDATE ON user_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- User balance summary view
CREATE VIEW user_balance_summary AS
SELECT 
    u.id AS user_id,
    u.email,
    u.smart_wallet_address,
    COALESCE(SUM(sb.balance), 0) AS total_balance,
    COALESCE(SUM(sb.locked_balance), 0) AS total_locked,
    COALESCE(SUM(sb.available_balance), 0) AS total_available,
    COUNT(DISTINCT sb.chain_id) AS active_chains
FROM users u
LEFT JOIN stablecoin_balances sb ON u.id = sb.user_id
GROUP BY u.id, u.email, u.smart_wallet_address;

-- Transaction summary view
CREATE VIEW transaction_summary AS
SELECT 
    user_id,
    transaction_type,
    status,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MAX(created_at) AS last_transaction
FROM transactions
GROUP BY user_id, transaction_type, status;

-- ============================================================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert DeFi protocols
INSERT INTO defi_protocols (name, protocol_key, description, risk_level, supported_chains, is_active) VALUES
('Aave', 'aave', 'Decentralized lending protocol', 'Low', ARRAY['1'::chain_id, '137'::chain_id, '42161'::chain_id], true),
('Compound', 'compound', 'Autonomous interest rate protocol', 'Low', ARRAY['1'::chain_id], true),
('Yearn Finance', 'yearn', 'Yield aggregator', 'Medium', ARRAY['1'::chain_id], true),
('Curve Finance', 'curve', 'Stablecoin exchange', 'Low', ARRAY['1'::chain_id, '137'::chain_id], true);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deo_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deo_user;

COMMENT ON DATABASE deo_finance IS 'DEO Finance - Digital Economy Optimized Platform';
