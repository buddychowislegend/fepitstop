import { NextRequest, NextResponse } from 'next/server';
import { addInterviewDrive } from '@/lib/company-data';

// Company authentication middleware
function companyAuth(request: NextRequest) {
  const companyId = request.headers.get('X-Company-ID');
  const companyPassword = request.headers.get('X-Company-Password');
  
  // Simple authentication for demo
  if (companyId === 'hireog' && companyPassword === 'manasi22') {
    return { companyId, valid: true };
  } else {
    return { companyId: null, valid: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = companyAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json({ error: 'Invalid company credentials' }, { status: 401 });
    }
    
    const { name, candidateIds } = await request.json();
    const companyId = auth.companyId;
    
    if (!name || !candidateIds || candidateIds.length === 0) {
      return NextResponse.json({ error: 'Drive name and candidate selection are required' }, { status: 400 });
    }
    
    // Create interview drive
    const drive = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      status: 'draft',
      candidateIds: candidateIds,
      createdAt: new Date().toISOString()
    };
    
    addInterviewDrive(drive);
    
    return NextResponse.json({
      id: drive.id,
      message: 'Interview drive created successfully'
    });
  } catch (error) {
    console.error('Error creating interview drive:', error);
    return NextResponse.json({ error: 'Failed to create interview drive' }, { status: 500 });
  }
}
