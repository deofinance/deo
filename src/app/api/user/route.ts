// User endpoints
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { UserService } from '@/lib/services/userService';
import { validateBody, updateUserSchema } from '@/lib/middleware/validation';

// GET /api/user - Get current user
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const userService = new UserService();
    const userWithProfile = await userService.getUserWithProfile(
      authResult.user.userId
    );

    if (!userWithProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userWithProfile.user,
      profile: userWithProfile.profile,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update current user
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validation = await validateBody(body, updateUserSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const userService = new UserService();
    
    // Convert date_of_birth string to Date if present
    const updateData = {
      ...validation.data!,
      date_of_birth: validation.data!.date_of_birth 
        ? new Date(validation.data!.date_of_birth) 
        : undefined,
    };
    
    const updatedUser = await userService.updateUser(
      authResult.user.userId,
      updateData
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
