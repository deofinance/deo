// Email service using SMTP (supports Zoho, Gmail, etc.)
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;

  constructor() {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      throw new Error(
        'SMTP not configured. Please set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD environment variables.'
      );
    }

    // Create SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USERNAME || '';
  }

  /**
   * Send OTP email for authentication
   */
  async sendOTPEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: 'Your DEO Finance Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0;">DEO Finance</h1>
          </div>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #022c22; margin-top: 0;">Your Verification Code</h2>
            <p style="color: #64748b; margin-bottom: 30px;">Enter this code to complete your login:</p>
            <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #64748b; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
            <p>© 2025 DEO Finance. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Your DEO Finance verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: 'Welcome to DEO Finance!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Welcome to DEO Finance!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Thank you for joining DEO Finance - your gateway to optimized digital economy.</p>
          <p>You can now:</p>
          <ul>
            <li>Send and receive USDC across multiple chains</li>
            <li>Earn yield on your stablecoin deposits</li>
            <li>Issue virtual and physical cards</li>
            <li>Access DeFi protocols with ease</li>
          </ul>
          <p>Get started by completing your profile and KYC verification.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Go to Dashboard
          </a>
          <p>Best regards,<br>The DEO Finance Team</p>
        </div>
      `,
      text: `Welcome to DEO Finance!\n\nHi ${name || 'there'},\n\nThank you for joining DEO Finance.\n\nVisit ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard to get started.`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send transaction alert
   */
  async sendTransactionAlert(
    to: string,
    amount: string,
    type: string,
    status: string
  ): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: `Transaction ${status}: ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Transaction Update</h2>
          <p>Your transaction has been ${status}.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${type}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">$${amount} USDC</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: capitalize;">${status}</td>
            </tr>
          </table>
          <p>View your transaction history in your dashboard.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Dashboard
          </a>
        </div>
      `,
      text: `Transaction ${status}: ${type}\n\nAmount: $${amount} USDC\nStatus: ${status}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: 'Reset Your DEO Finance Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
      text: `Password Reset Request\n\nClick here to reset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send KYC approval email
   */
  async sendKycApprovalEmail(to: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: 'KYC Verification Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">✓ Verification Approved</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Great news! Your identity verification has been approved.</p>
          <p>You now have full access to all DEO Finance features:</p>
          <ul>
            <li>Unlimited transfers</li>
            <li>Card issuance</li>
            <li>DeFi investments</li>
            <li>Yield farming</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Explore Features
          </a>
          <p>Best regards,<br>The DEO Finance Team</p>
        </div>
      `,
      text: `KYC Verification Approved\n\nHi ${name || 'there'},\n\nGreat news! Your identity verification has been approved.\n\nYou now have full access to all DEO Finance features.\n\nVisit ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard to explore.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
