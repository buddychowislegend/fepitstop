import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { token, code, type } = await request.json();
    
    if (!token && !code) {
      return NextResponse.json({ error: 'No token or code provided' }, { status: 400 });
    }

    let payload: any;

    if (type === 'oauth2' && code) {
      console.log('OAuth2 code received for exchange:', { code: code.substring(0, 20) + '...' });
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: 'postmessage',
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token exchange response:', tokenData);

      if (!tokenData.access_token) {
        console.error('Token exchange failed:', tokenData);
        return NextResponse.json({ 
          error: 'Failed to exchange code for token', 
          details: tokenData 
        }, { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }

      // Get user info from Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
      const userData = await userResponse.json();
      console.log('User data from Google:', userData);

      payload = {
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      };
    } else if (token) {
      console.log('JWT token received for exchange:', { token: token.substring(0, 20) + '...' });

      // Verify the Google JWT token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
      if (!payload) {
        console.error('Invalid token payload');
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }
    }

    const { sub: googleId, email, name, picture } = payload;
    console.log('Google user data for exchange:', { googleId, email, name });

    // Check if user exists in backend database
    let user;
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${jwt.sign({ userId: googleId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_frontendpitstop_2025', { expiresIn: '1h' })}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        user = userData.user;
        console.log('User found in database:', user);
      } else {
        // User doesn't exist, create them
        console.log('User not found, creating new user...');
        const createUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId,
            email,
            name,
            picture,
            profile: 'frontend'
          })
        });
        
        if (createUserResponse.ok) {
          const userData = await createUserResponse.json();
          user = userData.user;
          console.log('User created successfully:', user);
        } else {
          // If backend doesn't have google-signup endpoint, create user object locally
          console.log('Backend google-signup not available, creating user object locally');
          user = {
            id: googleId,
            email,
            name,
            picture,
            profile: 'frontend'
          };
        }
      }
    } catch (error) {
      console.log('Error checking/creating user, using local user object:', error);
      // Fallback: create user object locally
      user = {
        id: googleId,
        email,
        name,
        picture,
        profile: 'frontend'
      };
    }

    // Create our backend JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_frontendpitstop_2025';
    const backendToken = jwt.sign(
      { 
        userId: googleId, 
        email, 
        name,
        googleId 
      }, 
      jwtSecret, 
      { expiresIn: '7d' }
    );

    console.log('Google token exchange successful:', { email, name });
    
    return NextResponse.json({
      success: true,
      user,
      token: backendToken,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error: any) {
    console.error('Google token exchange error:', error);
    return NextResponse.json({ 
      error: 'Token exchange failed', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
