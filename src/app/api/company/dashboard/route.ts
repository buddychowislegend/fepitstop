import { NextRequest, NextResponse } from 'next/server';
import { getCandidatesByCompany, getDrivesByCompany, logDataState, getAllData } from '@/lib/company-data';

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

export async function GET(request: NextRequest) {
  try {
    const auth = companyAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json({ error: 'Invalid company credentials' }, { status: 401 });
    }
    
    const companyId = auth.companyId;
    
    console.log('Dashboard request from:', request.headers.get('origin'));
    console.log('Company ID:', companyId);
    
    // Log current data state
    logDataState('Dashboard API');
    
    // Get candidates for this company
    const candidates = getCandidatesByCompany(companyId);
    
    // Get interview drives for this company
    const drives = getDrivesByCompany(companyId);
    
    console.log('Returning candidates:', candidates.length, 'drives:', drives.length);
    console.log('All candidates in store:', getAllData().candidates);
    
    // If no candidates found, return some sample data for demo
    const finalCandidates = candidates.length > 0 ? candidates : [
      {
        id: 'sample-1',
        companyId: companyId,
        name: 'John Doe',
        email: 'john@example.com',
        profile: 'Frontend Developer',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample-2',
        companyId: companyId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        profile: 'React Developer',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      candidates: finalCandidates,
      interviewDrives: drives,
      message: 'Dashboard data retrieved successfully',
      debug: {
        totalCandidates: getAllData().candidates.length,
        companyCandidates: candidates.length,
        allCandidates: getAllData().candidates
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
