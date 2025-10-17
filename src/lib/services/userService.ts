// User service for user management
import { BaseService } from './baseService';
import { User, UserProfile, KycStatus } from '@/types';

export class UserService extends BaseService {
  /**
   * Create a new user
   */
  async createUser(params: {
    email: string;
    smart_wallet_address: string;
    first_name?: string;
    last_name?: string;
    primary_auth_method?: string;
    circle_user_id?: string;
    circle_wallet_set_id?: string;
  }): Promise<User> {
    const query = `
      INSERT INTO users (
        email,
        smart_wallet_address,
        first_name,
        last_name,
        primary_auth_method,
        circle_user_id,
        circle_wallet_set_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const user = await this.queryOne<User>(query, [
      params.email,
      params.smart_wallet_address,
      params.first_name || null,
      params.last_name || null,
      params.primary_auth_method || 'email',
      params.circle_user_id || null,
      params.circle_wallet_set_id || null,
    ]);

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Create user profile
    await this.createUserProfile(user.id);

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    return this.queryOne<User>(query, [id]);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    return this.queryOne<User>(query, [email]);
  }

  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(address: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE smart_wallet_address = $1';
    return this.queryOne<User>(query, [address]);
  }

  /**
   * Update user information
   */
  async updateUser(
    id: string,
    params: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      date_of_birth?: Date;
      username?: string;
    }
  ): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(params.first_name);
    }
    if (params.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(params.last_name);
    }
    if (params.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(params.phone);
    }
    if (params.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(params.date_of_birth);
    }
    if (params.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(params.username);
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    return this.queryOne<User>(query, values);
  }

  /**
   * Update KYC status
   */
  async updateKycStatus(
    id: string,
    status: KycStatus
  ): Promise<User | null> {
    const query = `
      UPDATE users
      SET kyc_status = $1
      WHERE id = $2
      RETURNING *
    `;
    return this.queryOne<User>(query, [status, id]);
  }

  /**
   * Update last authentication time
   */
  async updateLastAuth(id: string): Promise<void> {
    const query = 'UPDATE users SET last_auth_at = now() WHERE id = $1';
    await this.query(query, [id]);
  }

  /**
   * Create user profile
   */
  private async createUserProfile(userId: string): Promise<UserProfile> {
    const query = `
      INSERT INTO user_profiles (user_id)
      VALUES ($1)
      RETURNING *
    `;
    const profile = await this.queryOne<UserProfile>(query, [userId]);
    if (!profile) {
      throw new Error('Failed to create user profile');
    }
    return profile;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    return this.queryOne<UserProfile>(query, [userId]);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    params: {
      avatar_url?: string;
      bio?: string;
      country_code?: string;
      timezone?: string;
      preferred_currency?: string;
    }
  ): Promise<UserProfile | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(params.avatar_url);
    }
    if (params.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(params.bio);
    }
    if (params.country_code !== undefined) {
      updates.push(`country_code = $${paramIndex++}`);
      values.push(params.country_code);
    }
    if (params.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(params.timezone);
    }
    if (params.preferred_currency !== undefined) {
      updates.push(`preferred_currency = $${paramIndex++}`);
      values.push(params.preferred_currency);
    }

    if (updates.length === 0) {
      return this.getUserProfile(userId);
    }

    values.push(userId);
    const query = `
      UPDATE user_profiles
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    return this.queryOne<UserProfile>(query, values);
  }

  /**
   * Check if user exists by email
   */
  async userExistsByEmail(email: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists';
    const result = await this.queryOne<{ exists: boolean }>(query, [email]);
    return result?.exists || false;
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<void> {
    const query = 'UPDATE users SET email_verified = true WHERE id = $1';
    await this.query(query, [id]);
  }

  /**
   * Get user with profile
   */
  async getUserWithProfile(id: string): Promise<{
    user: User;
    profile: UserProfile;
  } | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const profile = await this.getUserProfile(id);
    if (!profile) return null;

    return { user, profile };
  }

  /**
   * Get user by Circle ID
   */
  async getUserByCircleId(circleUserId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE circle_user_id = $1';
    return this.queryOne<User>(query, [circleUserId]);
  }

  /**
   * Update user Circle information
   */
  async updateUserCircleInfo(
    userId: string,
    params: {
      smart_wallet_address?: string;
      circle_wallet_set_id?: string;
    }
  ): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.smart_wallet_address !== undefined) {
      updates.push(`smart_wallet_address = $${paramIndex++}`);
      values.push(params.smart_wallet_address);
    }
    if (params.circle_wallet_set_id !== undefined) {
      updates.push(`circle_wallet_set_id = $${paramIndex++}`);
      values.push(params.circle_wallet_set_id);
    }

    if (updates.length === 0) {
      return this.getUserById(userId);
    }

    values.push(userId);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = now()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    return this.queryOne<User>(query, values);
  }
}
