// KYC endpoints
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { UserService } from '@/lib/services/userService';

// GET /api/user/kyc - Get KYC status
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const userService = new UserService();
    const user = await userService.getUserById(authResult.user.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      kyc_status: user.kyc_status,
      email_verified: user.email_verified,
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    return NextResponse.json(
      { error: 'Failed to get KYC status' },
      { status: 500 }
    );
  }
}

// POST /api/user/kyc - Update KYC status (from webhook)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inquiry_id, status, user_id } = body;

    if (!user_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userService = new UserService();
    
    // Map Persona status to our KYC status
    const kycStatus = status === 'completed' ? 'approved' : 
                     status === 'failed' ? 'rejected' : 'pending';

    await userService.updateKycStatus(user_id, kycStatus as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update KYC status error:', error);
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}
