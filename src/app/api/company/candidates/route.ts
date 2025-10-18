import { NextRequest, NextResponse } from 'next/server';
import { addCandidate, getCandidatesByCompany, logDataState, getAllData } from '@/lib/company-data';

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
    
    const { name, email, profile } = await request.json();
    const companyId = auth.companyId;
    
    if (!name || !email || !profile) {
      return NextResponse.json({ error: 'Name, email, and profile are required' }, { status: 400 });
    }
    
    // Check if candidate already exists
    const existingCandidates = getCandidatesByCompany(companyId);
    const existingCandidate = existingCandidates.find(
      (c: any) => c.email === email
    );
    
    if (existingCandidate) {
      return NextResponse.json({ error: 'Candidate with this email already exists' }, { status: 400 });
    }
    
    // Add new candidate
    const candidate = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      email: email,
      profile: profile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    addCandidate(candidate);
    
    // Log data state after adding
    logDataState('After adding candidate');
    console.log('All candidates after adding:', getAllData().candidates);
    
    return NextResponse.json({
      id: candidate.id,
      message: 'Candidate added successfully'
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    return NextResponse.json({ error: 'Failed to add candidate' }, { status: 500 });
  }
}
