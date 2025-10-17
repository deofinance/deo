// Persona KYC webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { EmailService } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('persona-signature');
    // TODO: Implement signature verification

    const { data } = body;

    if (!data || !data.attributes) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const referenceId = data.attributes.reference_id; // This is user_id
    const inquiryStatus = data.attributes.status;

    if (!referenceId) {
      return NextResponse.json(
        { error: 'Missing reference_id' },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const user = await userService.getUserById(referenceId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Map Persona status to our KYC status
    let kycStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    
    switch (inquiryStatus) {
      case 'completed':
        kycStatus = 'approved';
        break;
      case 'failed':
      case 'declined':
        kycStatus = 'rejected';
        break;
      default:
        kycStatus = 'pending';
    }

    // Update user KYC status
    await userService.updateKycStatus(referenceId, kycStatus);

    // Send email notification
    if (kycStatus === 'approved') {
      const emailService = new EmailService();
      await emailService.sendKycApprovalEmail(
        user.email,
        user.first_name || ''
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Persona webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
