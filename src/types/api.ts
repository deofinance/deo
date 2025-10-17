// API request and response types

import {
  User,
  UserProfile,
  StablecoinBalance,
  Transaction,
  UserCard,
  ChainId,
  StablecoinSymbol,
  TransactionType,
} from './database';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  limit: number;
  offset: number;
}

// Auth API types
export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// User API types
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UserResponse {
  user: User;
  profile?: UserProfile;
}

// Wallet API types
export interface BalancesResponse {
  balances: StablecoinBalance[];
  total_balance: string;
}

export interface TransferRequest {
  recipient: string;
  amount: string;
  chain_id: ChainId;
  stablecoin: StablecoinSymbol;
}

export interface TransferResponse {
  transaction_id: string;
  tx_hash?: string;
  status: string;
}

// Transaction API types
export interface TransactionListRequest {
  limit?: number;
  offset?: number;
  type?: TransactionType;
  status?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
}

// Card API types
export interface CreateCardholderRequest {
  name: string;
  email: string;
  phone_number: string;
  billing_address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface IssueCardRequest {
  type: 'virtual' | 'physical';
  currency: string;
  spending_limits?: {
    daily?: number;
    monthly?: number;
  };
}

export interface CardResponse {
  card: UserCard;
}

// KYC API types
export interface KycStatusResponse {
  kyc_status: string;
  inquiry_id?: string;
  verified_at?: Date;
}

export interface UpdateKycRequest {
  inquiry_id: string;
  status: string;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}
