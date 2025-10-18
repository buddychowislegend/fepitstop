import { NextRequest, NextResponse } from 'next/server';
import { getTokenData, updateToken } from '@/lib/company-data';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const { answers } = await request.json();
    
    // Find token data
    const tokenData = getTokenData(token);
    
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid interview token' }, { status: 404 });
    }
    
    // Mark token as used
    updateToken(token, { used: true });
    
    // Store interview response (in a real app, this would go to a database)
    console.log('Interview response submitted:', {
      candidateId: tokenData.candidateId,
      driveId: tokenData.driveId,
      answers: answers
    });
    
    return NextResponse.json({ message: 'Interview response submitted successfully' });
  } catch (error) {
    console.error('Error submitting interview response:', error);
    return NextResponse.json({ error: 'Failed to submit interview response' }, { status: 500 });
  }
}
