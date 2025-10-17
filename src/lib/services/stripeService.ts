// Stripe Issuing service for card management
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Create a cardholder
   */
  async createCardholder(params: {
    name: string;
    email: string;
    phoneNumber: string;
    address: Stripe.Issuing.CardholderCreateParams.Billing.Address;
  }): Promise<Stripe.Issuing.Cardholder> {
    return await this.stripe.issuing.cardholders.create({
      name: params.name,
      email: params.email,
      phone_number: params.phoneNumber,
      billing: {
        address: params.address,
      },
      type: 'individual',
      status: 'active',
    });
  }

  /**
   * Issue a card
   */
  async issueCard(params: {
    cardholderId: string;
    type: 'virtual' | 'physical';
    currency: string;
    spendingLimits?: Array<{
      amount: number;
      interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }>;
  }): Promise<Stripe.Issuing.Card> {
    return await this.stripe.issuing.cards.create({
      cardholder: params.cardholderId,
      currency: params.currency.toLowerCase(),
      type: params.type,
      status: 'active',
      spending_controls: params.spendingLimits
        ? {
            spending_limits: params.spendingLimits.map((limit) => ({
              amount: limit.amount,
              interval: limit.interval,
            })),
          }
        : undefined,
    });
  }

  /**
   * Get card details
   */
  async getCard(cardId: string): Promise<Stripe.Issuing.Card> {
    return await this.stripe.issuing.cards.retrieve(cardId);
  }

  /**
   * Update card status
   */
  async updateCardStatus(
    cardId: string,
    status: 'active' | 'inactive' | 'canceled'
  ): Promise<Stripe.Issuing.Card> {
    return await this.stripe.issuing.cards.update(cardId, { status });
  }

  /**
   * Get card transactions
   */
  async getCardTransactions(
    cardId: string,
    limit: number = 100
  ): Promise<Stripe.Issuing.Transaction[]> {
    const transactions = await this.stripe.issuing.transactions.list({
      card: cardId,
      limit,
    });
    return transactions.data;
  }

  /**
   * Get cardholder
   */
  async getCardholder(
    cardholderId: string
  ): Promise<Stripe.Issuing.Cardholder> {
    return await this.stripe.issuing.cardholders.retrieve(cardholderId);
  }

  /**
   * Update spending limits
   */
  async updateSpendingLimits(
    cardId: string,
    limits: Array<{
      amount: number;
      interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }>
  ): Promise<Stripe.Issuing.Card> {
    return await this.stripe.issuing.cards.update(cardId, {
      spending_controls: {
        spending_limits: limits,
      },
    });
  }

  /**
   * List all cards for a cardholder
   */
  async listCardsByCardholder(
    cardholderId: string
  ): Promise<Stripe.Issuing.Card[]> {
    const cards = await this.stripe.issuing.cards.list({
      cardholder: cardholderId,
      limit: 100,
    });
    return cards.data;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
