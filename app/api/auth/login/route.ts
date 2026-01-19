import { NextResponse } from 'next/server';

// Mock credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({ 
        success: true, 
        user: { username: 'admin', role: 'administrator' },
        token: 'mock-jwt-token-' + Date.now()
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid credentials' 
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
