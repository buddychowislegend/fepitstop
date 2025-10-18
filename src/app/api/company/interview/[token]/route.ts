import { NextRequest, NextResponse } from 'next/server';
import { getTokenData, getCandidatesByCompany, getDrivesByCompany } from '@/lib/company-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    // Find token data
    const tokenData = getTokenData(token);
    
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid interview token' }, { status: 404 });
    }
    
    // Get candidate data (we need to search across all companies for the candidate)
    // This is a simplified approach - in production you'd have proper database queries
    const allCandidates = getCandidatesByCompany('hireog'); // Simplified for demo
    const candidate = allCandidates.find((c: any) => c.id === tokenData.candidateId);
    const allDrives = getDrivesByCompany('hireog'); // Simplified for demo
    const drive = allDrives.find((d: any) => d.id === tokenData.driveId);
    
    if (!candidate || !drive) {
      return NextResponse.json({ error: 'Candidate or drive not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      candidate: {
        name: candidate.name,
        email: candidate.email,
        profile: candidate.profile,
        companyName: 'HireOG',
        driveName: drive.name
      }
    });
  } catch (error) {
    console.error('Error fetching interview data:', error);
    return NextResponse.json({ error: 'Failed to fetch interview data' }, { status: 500 });
  }
}
