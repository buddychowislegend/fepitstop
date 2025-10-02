import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with actual database (PostgreSQL, MongoDB, Supabase)
let interviewSessions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { action, sessionData, sessionId, answer, feedback } = await request.json();

    switch (action) {
      case 'create-session':
        const newSession = {
          id: sessionId || Date.now().toString(),
          userId: sessionData.userId || 'anonymous',
          topic: sessionData.topic,
          difficulty: sessionData.difficulty,
          status: 'in-progress',
          startTime: new Date().toISOString(),
          questions: sessionData.questions || [],
          answers: [],
          feedback: null,
          createdAt: new Date().toISOString()
        };
        
        interviewSessions.push(newSession);
        return NextResponse.json({ 
          success: true, 
          session: newSession 
        });

      case 'update-session':
        const sessionIndex = interviewSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
          return NextResponse.json({ 
            success: false, 
            error: 'Session not found' 
          }, { status: 404 });
        }

        if (answer) {
          interviewSessions[sessionIndex].answers.push({
            question: answer.question,
            answer: answer.answer,
            timestamp: new Date().toISOString(),
            audioUrl: answer.audioUrl || null
          });
        }

        if (feedback) {
          interviewSessions[sessionIndex].feedback = feedback;
          interviewSessions[sessionIndex].status = 'completed';
          interviewSessions[sessionIndex].endTime = new Date().toISOString();
        }

        return NextResponse.json({ 
          success: true, 
          session: interviewSessions[sessionIndex] 
        });

      case 'get-session':
        const session = interviewSessions.find(s => s.id === sessionId);
        if (!session) {
          return NextResponse.json({ 
            success: false, 
            error: 'Session not found' 
          }, { status: 404 });
        }
        return NextResponse.json({ 
          success: true, 
          session 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Interview sessions API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    let sessions = interviewSessions;
    
    if (userId) {
      sessions = sessions.filter(s => s.userId === userId);
    }
    
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    
    // Sort by creation date (newest first)
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ 
      success: true, 
      sessions 
    });
    
  } catch (error) {
    console.error('Get interview sessions error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
