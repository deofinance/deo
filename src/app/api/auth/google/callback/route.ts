// Google OAuth callback
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { generateToken } from '@/lib/utils/jwt';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Validate environment variables
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://deofinance.netlify.app';
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Google OAuth configuration:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
      });
      return NextResponse.redirect(`${baseUrl}/auth/login?error=config_missing`);
    }

    if (error || !code) {
      console.error('OAuth error or missing code:', error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_failed`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser = await userInfoResponse.json();

    // Get or create user
    const userService = new UserService();
    let user = await userService.getUserByEmail(googleUser.email);

    if (!user) {
      // Create user with placeholder wallet address
      // Actual wallet will be created when user first needs it
      const placeholderAddress = `pending-${Date.now()}-${googleUser.email.substring(0, 10)}`;
      
      user = await userService.createUser({
        email: googleUser.email,
        smart_wallet_address: placeholderAddress,
        first_name: googleUser.given_name || '',
        last_name: googleUser.family_name || '',
        primary_auth_method: 'google',
      });

      await userService.verifyEmail(user.id);
      
      console.log('New Google user created:', {
        userId: user.id,
        email: googleUser.email,
      });
    } else {
      console.log('Existing Google user logged in:', {
        userId: user.id,
        email: user.email,
      });
    }

    await userService.updateLastAuth(user.id);

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Redirect to dashboard with token
    const redirectUrl = new URL('/dashboard', baseUrl);
    redirectUrl.searchParams.set('token', token);

    console.log('Redirecting to dashboard with token');
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://deofinance.netlify.app';
    return NextResponse.redirect(
      `${baseUrl}/auth/login?error=oauth_error&details=${encodeURIComponent(errorMessage)}`
    );
  }
}
