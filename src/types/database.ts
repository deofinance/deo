// Database type definitions for DEO Finance

export type StablecoinSymbol = 'USDC';

export type ChainId = '1' | '137' | '42161' | '10' | '56';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'yield'
  | 'swap'
  | 'bridge'
  | 'spend'
  | 'transfer'
  | 'reward'
  | 'fee'
  | 'investment'
  | 'loan'
  | 'insurance';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AccountType = 'personal' | 'business' | 'institutional';

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type CardType = 'virtual' | 'physical';

export type CardStatus = 'active' | 'blocked' | 'expired' | 'pending';

export type InvestmentStrategy = 'Conservative' | 'Moderate' | 'Aggressive';

export type InvestmentFrequency = 'weekly' | 'monthly' | 'quarterly';

export interface User {
  id: string;
  email: string;
  smart_wallet_address: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  account_type: AccountType;
  kyc_status: KycStatus;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  updated_at: Date;
  last_auth_at?: Date;
  primary_auth_method: string;
  circle_user_id?: string;
  circle_wallet_set_id?: string;
  metadata: Record<string, any>;
}

export interface UserAuthMethod {
  id: string;
  user_id: string;
  auth_type: string;
  auth_identifier: string;
  provider_user_id?: string;
  provider_data: Record<string, any>;
  is_active: boolean;
  is_primary: boolean;
  created_at: Date;
  last_used_at: Date;
  verified_at?: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  country_code?: string;
  timezone: string;
  preferred_currency: StablecoinSymbol;
  notification_preferences: Record<string, any>;
  privacy_settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface UserWallet {
  id: string;
  user_id: string;
  chain_id: ChainId;
  address: string;
  wallet_type: string;
  is_primary: boolean;
  label?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StablecoinBalance {
  id: string;
  user_id: string;
  wallet_id: string;
  stablecoin: StablecoinSymbol;
  chain_id: ChainId;
  balance: string;
  locked_balance: string;
  available_balance: string;
  contract_address: string;
  last_sync_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  tx_hash?: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: string;
  fee_amount: string;
  stablecoin: StablecoinSymbol;
  chain_id: ChainId;
  from_address?: string;
  to_address?: string;
  from_chain?: ChainId;
  to_chain?: ChainId;
  protocol_name?: string;
  description?: string;
  metadata: Record<string, any>;
  block_number?: number;
  block_timestamp?: Date;
  gas_used?: number;
  gas_price?: string;
  created_at: Date;
  updated_at: Date;
  confirmed_at?: Date;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_type: CardType;
  card_status: CardStatus;
  card_number_hash?: string;
  last_four_digits?: string;
  expiry_month?: number;
  expiry_year?: number;
  cvv_hash?: string;
  cardholder_name?: string;
  billing_address?: Record<string, any>;
  daily_limit: string;
  monthly_limit: string;
  currency: StablecoinSymbol;
  is_primary: boolean;
  stripe_card_id?: string;
  stripe_cardholder_id?: string;
  issued_at?: Date;
  activated_at?: Date;
  blocked_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  user_id: string;
  transaction_id?: string;
  merchant_name?: string;
  merchant_category?: string;
  merchant_country?: string;
  amount: string;
  currency: StablecoinSymbol;
  exchange_rate: string;
  fee_amount: string;
  cashback_amount: string;
  status: TransactionStatus;
  authorization_code?: string;
  reference_number?: string;
  transaction_date: Date;
  settlement_date?: Date;
  created_at: Date;
}

export interface DefiProtocol {
  id: string;
  name: string;
  protocol_key: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  risk_level: RiskLevel;
  supported_chains: ChainId[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface YieldPosition {
  id: string;
  user_id: string;
  protocol_id: string;
  stablecoin: StablecoinSymbol;
  chain_id: ChainId;
  deposit_amount: string;
  current_balance: string;
  earned_yield: string;
  entry_apy: string;
  current_apy: string;
  duration_days: number;
  is_active: boolean;
  deposit_tx_hash?: string;
  created_at: Date;
  updated_at: Date;
  withdrawn_at?: Date;
}

export interface TokenizedAsset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  description?: string;
  current_price: string;
  market_cap?: string;
  total_supply?: string;
  circulating_supply?: string;
  min_investment: string;
  current_apy: string;
  risk_level: RiskLevel;
  underlying_asset?: string;
  provider?: string;
  contract_address?: string;
  chain_id: ChainId;
  features?: string[];
  launch_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserInvestment {
  id: string;
  user_id: string;
  asset_id: string;
  quantity: string;
  average_cost: string;
  total_invested: string;
  current_value: string;
  unrealized_pnl: string;
  currency: StablecoinSymbol;
  first_purchase_at: Date;
  last_purchase_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LoanApplication {
  id: string;
  user_id: string;
  loan_amount: string;
  loan_currency: StablecoinSymbol;
  collateral_amount: string;
  collateral_token: string;
  collateral_chain: ChainId;
  ltv_ratio: string;
  interest_rate: string;
  loan_term_months: number;
  application_status: string;
  risk_assessment?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface InsurancePolicy {
  id: string;
  user_id: string;
  policy_name: string;
  policy_type: string;
  coverage_amount: string;
  premium_amount: string;
  premium_frequency: string;
  coverage_details: Record<string, any>;
  policy_status: string;
  start_date: Date;
  end_date: Date;
  next_premium_due?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  read_at?: Date;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: Date;
}
