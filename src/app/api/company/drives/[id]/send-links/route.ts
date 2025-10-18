import { NextRequest, NextResponse } from 'next/server';
import { getCandidatesByCompany, getDrivesByCompany, addInterviewToken } from '@/lib/company-data';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = companyAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json({ error: 'Invalid company credentials' }, { status: 401 });
    }
    
    const driveId = params.id;
    const companyId = auth.companyId;
    
    // Find drive
    const drives = getDrivesByCompany(companyId);
    const drive = drives.find((d: any) => d.id === driveId);
    
    if (!drive) {
      return NextResponse.json({ error: 'Interview drive not found' }, { status: 404 });
    }
    
    // Get candidates for this drive
    const allCandidates = getCandidatesByCompany(companyId);
    const candidates = allCandidates.filter(
      (c: any) => drive.candidateIds.includes(c.id)
    );
    
    // Generate interview tokens and links
    const interviewLinks = [];
    
    for (const candidate of candidates) {
      // Generate unique token for each candidate
      const token = Buffer.from(`${candidate.id}-${driveId}-${Date.now()}`).toString('base64');
      
      // Store token
      const tokenData = {
        id: Date.now().toString(),
        candidateId: candidate.id,
        driveId: driveId,
        token: token,
        used: false,
        createdAt: new Date().toISOString()
      };
      
      addInterviewToken(tokenData);
      
      const interviewLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://fepit.vercel.app'}/hiring/candidate-interview/${token}`;
      interviewLinks.push({
        candidate: candidate,
        link: interviewLink
      });
      
      // Log the interview link (in production, this would send an email)
      console.log(`Interview link for ${candidate.name} (${candidate.email}): ${interviewLink}`);
    }
    
    // Update drive status to active
    drive.status = 'active';
    
    return NextResponse.json({
      message: 'Interview links generated successfully',
      links: interviewLinks
    });
  } catch (error) {
    console.error('Error sending interview links:', error);
    return NextResponse.json({ error: 'Failed to send interview links' }, { status: 500 });
  }
}
