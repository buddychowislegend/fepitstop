import { NextRequest, NextResponse } from 'next/server';
import { getCandidatesByCompany } from '@/lib/company-data';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = companyAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json({ error: 'Invalid company credentials' }, { status: 401 });
    }
    
    const candidateId = params.id;
    const { name, email, profile, status } = await request.json();
    const companyId = auth.companyId;
    
    // Find candidate
    const candidates = getCandidatesByCompany(companyId);
    const candidateIndex = candidates.findIndex(
      (c: any) => c.id === candidateId
    );
    
    if (candidateIndex === -1) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    // Update candidate (this is a simplified approach - in production you'd use a proper database)
    const candidate = candidates[candidateIndex];
    candidate.name = name;
    candidate.email = email;
    candidate.profile = profile;
    candidate.status = status;
    
    return NextResponse.json({ message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = companyAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json({ error: 'Invalid company credentials' }, { status: 401 });
    }
    
    const candidateId = params.id;
    const companyId = auth.companyId;
    
    // Find candidate
    const candidateIndex = companyData.candidates.findIndex(
      (c: any) => c.id === candidateId && c.companyId === companyId
    );
    
    if (candidateIndex === -1) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    // Remove candidate
    companyData.candidates.splice(candidateIndex, 1);
    
    return NextResponse.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}
