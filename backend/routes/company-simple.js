const express = require('express');
const router = express.Router();
const db = require('../config/db');
const emailService = require('../services/emailService');
const { generateQuestionsFromJD } = require('../utils/questionGenerator');

// Basic CORS handling for company routes
router.use((req, res, next) => {
  console.log('[Company CORS] Incoming request', {
    method: req.method,
    url: req.originalUrl,
    origin: req.headers.origin,
    headers: req.headers,
  });

  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  const defaultHeaders = [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Company-ID',
    'X-Company-Password',
  ];

  const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    console.log('[Company CORS] Allowing requested headers:', requestedHeaders);
    res.header('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.header('Access-Control-Allow-Headers', defaultHeaders.join(', '));
  }

  if (req.method === 'OPTIONS') {
    console.log('[Company CORS] Responding to OPTIONS preflight');
    return res.status(204).end();
  }

  next();
});

// Test endpoint to verify CORS
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Company API is working!', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    corsHeaders: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods')
    },
    receivedHeaders: Object.keys(req.headers).reduce((acc, key) => {
      if (key.toLowerCase().includes('company') || 
          key.toLowerCase().includes('origin') || 
          key.toLowerCase().includes('cache') ||
          key.toLowerCase().includes('pragma')) {
        acc[key] = req.headers[key];
      }
      return acc;
    }, {})
  });
});

// Company authentication middleware
const companyAuth = (req, res, next) => {
  const companyId = req.header('X-Company-ID');
  const companyPassword = req.header('X-Company-Password');
  
  // Simple authentication for demo
  if ((companyId === 'hireog' && companyPassword === 'manasi22') ||
      (companyId === 'xtremesolution' && companyPassword === 'Xtreme@2025!')) {
    req.companyId = companyId;
    next();
  } else {
    res.status(401).json({ error: 'Invalid company credentials' });
  }
};

// Get company dashboard data
router.get('/dashboard', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    console.log('Dashboard request from:', req.headers.origin);
    console.log('Company ID:', companyId);
    
    // Get candidates for this company from MongoDB
    const candidates = await db.getCandidatesByCompany(companyId);
    
    // Get company credits
    const company = await db.getCompany(companyId);
    
    console.log('Returning candidates:', candidates.length);
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }).json({
      candidates: candidates,
      credits: company.credits || 1000,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Add new candidate
router.post('/candidates', companyAuth, async (req, res) => {
  try {
    const { name, email, profile } = req.body;
    const companyId = req.companyId;
    
    if (!name || !email || !profile) {
      return res.status(400).json({ error: 'Name, email, and profile are required' });
    }
    
    // Check if candidate already exists in MongoDB
    const existingCandidates = await db.getCandidatesByCompany(companyId);
    const existingCandidate = existingCandidates.find(
      c => c.email === email
    );
    
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }
    
    // Add new candidate to MongoDB
    const candidate = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      email: email,
      profile: profile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await db.addCandidate(candidate);
    
    res.json({
      id: candidate.id,
      message: 'Candidate added successfully'
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// Update candidate
router.put('/candidates/:id', companyAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { name, email, profile, status, hiringStatus } = req.body;
    const companyId = req.companyId;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (profile !== undefined) updateData.profile = profile;
    if (status !== undefined) updateData.status = status;
    if (hiringStatus !== undefined) updateData.hiringStatus = hiringStatus;
    
    // Update candidate in MongoDB
    const result = await db.updateCandidate(candidateId, updateData);
    
    if (!result) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/candidates/:id', companyAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const companyId = req.companyId;
    
    // Delete candidate from MongoDB
    const result = await db.deleteCandidate(candidateId, companyId);
    
    if (!result) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// Generate questions from JD
router.post('/drives/generate-questions', companyAuth, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    try {
      const questions = await generateQuestionsFromJD(jobDescription, { count: 12 });
      res.json({
        success: true,
        questions
      });
    } catch (error) {
      console.error('Error generating questions with Llama/Groq:', error?.message || error);
      res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
    }
  } catch (error) {
    console.error('Error in generate-questions:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Create interview drive
router.post('/drives', companyAuth, async (req, res) => {
  try {
    const { name, candidateIds, jobDescription, questions, screeningId, profile, level, interviewDuration } = req.body;
    const companyId = req.companyId;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Drive name is required' });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'At least one interview question is required' });
    }

    const normalizedCandidateIds = Array.isArray(candidateIds)
      ? candidateIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
      : [];

    const driveId = typeof screeningId === 'string' && screeningId.trim().length > 0
      ? screeningId.trim()
      : Date.now().toString();
    const normalizedProfile = typeof profile === 'string' && profile.trim().length > 0
      ? profile.trim().toLowerCase()
      : 'frontend';
    const normalizedLevel = typeof level === 'string' && ['junior', 'mid', 'senior'].includes(level.trim().toLowerCase())
      ? level.trim().toLowerCase()
      : 'mid';
    
    // Create interview drive
    const drive = {
      id: driveId,
      companyId: companyId,
      name: name,
      status: 'draft',
      candidateIds: normalizedCandidateIds,
      jobDescription: jobDescription || '',
      questions: questions, // Array of question strings
      createdAt: new Date().toISOString(),
      screeningId: typeof screeningId === 'string' && screeningId.trim().length > 0 ? screeningId.trim() : driveId,
      profile: normalizedProfile,
      level: normalizedLevel,
      interviewDuration: typeof interviewDuration === 'number' && interviewDuration > 0 ? interviewDuration : 15, // Store interview duration (default 15 minutes)
    };
    
    // Add drive to MongoDB
    await db.addInterviewDrive(drive);
    
    res.json({
      id: drive.id,
      message: 'Interview drive created successfully',
      profile: drive.profile,
      level: drive.level
    });
  } catch (error) {
    console.error('Error creating interview drive:', error);
    res.status(500).json({ error: 'Failed to create interview drive' });
  }
});

// Send interview links to candidates
router.post('/drives/:id/send-links', companyAuth, async (req, res) => {
  try {
    const driveId = req.params.id;
    const companyId = req.companyId;
    
    // Get drive from MongoDB
    const drives = await db.getDrivesByCompany(companyId);
    const drive = drives.find(d => d.id === driveId);
    
    if (!drive) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive from MongoDB
    const allCandidates = await db.getCandidatesByCompany(companyId);
    const candidateIds = drive.candidates || drive.candidateIds || [];
    const candidates = allCandidates.filter(c => candidateIds.includes(c.id));
    
    // Check if company has enough credits (6 credits per interview invite)
    const requiredCredits = candidates.length * 6;
    const company = await db.getCompany(companyId);
    
    if (company.credits < requiredCredits) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        message: `You need ${requiredCredits} credits to send invites to ${candidates.length} candidates, but you only have ${company.credits} credits.`,
        required: requiredCredits,
        available: company.credits
      });
    }
    
    // Generate interview tokens and links
    const interviewLinks = [];
    
    for (const candidate of candidates) {
      // Generate unique token for each candidate
      const token = Buffer.from(`${candidate.id}-${driveId}-${Date.now()}`).toString('base64');
      
      // Store token in MongoDB
      const tokenData = {
        id: Date.now().toString(),
        candidateId: candidate.id,
        driveId: driveId,
        token: token,
        used: false,
        createdAt: new Date().toISOString()
      };
      
      await db.addInterviewToken(tokenData);
      
      // Generate interview link with company parameters
      // Try to get screening configuration if this drive is associated with a screening
      let profileFromPosition = drive.profile || candidate.profile || 'frontend'; // prefer drive profile
      const driveLevel = drive.level || 'mid';
      
      try {
        // Check if this drive ID corresponds to a screening
        const screening = await db.getScreeningById(driveId);
        if (screening) {
          // Use the screening's position title to determine the appropriate profile
          const positionLower = screening.positionTitle?.toLowerCase() || '';
          if (positionLower.includes('backend')) {
            profileFromPosition = 'backend';
          } else if (positionLower.includes('full stack') || positionLower.includes('fullstack')) {
            profileFromPosition = 'frontend';
          } else if (positionLower.includes('product')) {
            profileFromPosition = 'product';
          } else if (positionLower.includes('business') || positionLower.includes('sales')) {
            profileFromPosition = 'business';
          } else if (positionLower.includes('qa') || positionLower.includes('test')) {
            profileFromPosition = 'qa';
          } else if (positionLower.includes('hr') || positionLower.includes('human')) {
            profileFromPosition = 'hr';
          } else {
            profileFromPosition = 'frontend';
          }
        }
      } catch (error) {
        console.log('Drive is not associated with a screening, using candidate profile');
      }

      const interviewParams = new URLSearchParams({
        token: token,
        company: 'HireOG',
        profile: profileFromPosition,
        level: driveLevel,
        candidateName: candidate.name,
        candidateEmail: candidate.email
      });
      const interviewLink = `${process.env.FRONTEND_URL || 'https://hireog.com'}/hiring/candidate-interview/${token}?${interviewParams.toString()}`;
      interviewLinks.push({
        candidate: candidate,
        link: interviewLink
      });
      
      // Send email to candidate using the same service that works for OTP
      try {
        const emailResult = await emailService.sendInterviewInvite(
          candidate.email,
          candidate.name,
          interviewLink,
          'HireOG',
          drive.name
        );
        if (emailResult.success) {
          console.log(`Email sent to ${candidate.name} (${candidate.email})`);
        } else {
          console.error(`Failed to send email to ${candidate.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${candidate.email}:`, emailError);
        // Continue even if email fails
      }
    }
    
    // Update drive status to active in MongoDB
    await db.updateInterviewDrive(driveId, { status: 'active' });
    
    // Deduct credits (6 credits per interview invite)
    const creditsDeducted = candidates.length * 6;
    const updatedCompany = await db.deductCompanyCredits(companyId, creditsDeducted);
    
    res.json({
      message: 'Interview links generated successfully',
      links: interviewLinks,
      creditsDeducted: creditsDeducted,
      remainingCredits: updatedCompany.credits
    });
  } catch (error) {
    console.error('Error sending interview links:', error);
    res.status(500).json({ error: 'Failed to send interview links' });
  }
});

// Get interview drive details
router.get('/drives/:id', companyAuth, async (req, res) => {
  try {
    const driveId = req.params.id;
    const companyId = req.companyId;
    
    // Get drive from MongoDB
    const drives = await db.getDrivesByCompany(companyId);
    const drive = drives.find(d => d.id === driveId);
    
    if (!drive) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive from MongoDB
    const allCandidates = await db.getCandidatesByCompany(companyId);
    const candidates = allCandidates.filter(c => drive.candidateIds.includes(c.id));
    
    res.json({
      drive: drive,
      candidates: candidates
    });
  } catch (error) {
    console.error('Error fetching drive details:', error);
    res.status(500).json({ error: 'Failed to fetch drive details' });
  }
});

// Get candidate interview data by token
router.get('/interview/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Get token data from MongoDB
    const tokenData = await db.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    // Get candidate and drive data from MongoDB
    const candidate = await db.getCandidateById(tokenData.candidateId);
    const drive = await db.getDriveById(tokenData.driveId);
    
    if (!candidate || !drive) {
      return res.status(404).json({ error: 'Candidate or drive not found' });
    }
    
    // Include drive questions if available
    const driveQuestions = drive.questions || [];
    
    res.json({
      candidate: {
        name: candidate.name,
        email: candidate.email,
        profile: candidate.profile,
        companyName: 'HireOG',
        driveName: drive.name
      },
      drive: {
        id: drive.id,
        name: drive.name,
        questions: driveQuestions, // Include questions from drive
        jobDescription: drive.jobDescription || '',
        profile: drive.profile || 'frontend',
        level: drive.level || 'mid',
        interviewDuration: drive.interviewDuration || 15 // Include interview duration (default 15 minutes)
      }
    });
  } catch (error) {
    console.error('Error fetching interview data:', error);
    res.status(500).json({ error: 'Failed to fetch interview data' });
  }
});

// Submit interview response
router.post('/interview/:token/submit', async (req, res) => {
  try {
    const token = req.params.token;
    const { 
      candidateName, 
      candidateEmail, 
      profile, 
      level, 
      company, 
      qaPairs, 
      score, 
      feedback, 
      completedAt,
      // Detailed analysis fields
      technicalScore,
      communicationScore,
      detailedFeedback,
      questionAnalysis,
      overallScore
    } = req.body;
    
    // Get token data from MongoDB
    const tokenData = await db.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    if (tokenData.used) {
      return res.status(400).json({ error: 'Interview token has already been used' });
    }
    
    // Mark token as used in MongoDB
    await db.updateToken(token, { used: true, usedAt: new Date().toISOString() });
    
    // Store interview response in MongoDB with all detailed analysis
    const responseData = {
      id: Date.now().toString(),
      candidateId: tokenData.candidateId,
      driveId: tokenData.driveId,
      token: token,
      candidateName,
      candidateEmail,
      profile,
      level,
      company,
      qaPairs,
      score: score || overallScore || 0,
      technicalScore: technicalScore || null,
      communicationScore: communicationScore || null,
      feedback: feedback || (typeof detailedFeedback === 'string' ? detailedFeedback : ''),
      detailedFeedback: detailedFeedback || null,
      questionAnalysis: questionAnalysis || null,
      completedAt: completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    await db.addInterviewResponse(responseData);
    
    console.log('Interview response submitted with detailed analysis:', {
      id: responseData.id,
      candidateId: responseData.candidateId,
      score: responseData.score,
      technicalScore: responseData.technicalScore,
      communicationScore: responseData.communicationScore,
      hasDetailedFeedback: !!responseData.detailedFeedback,
      hasQuestionAnalysis: Array.isArray(responseData.questionAnalysis) && responseData.questionAnalysis.length > 0
    });
    
    res.json({ 
      message: 'Interview response submitted successfully',
      score: responseData.score,
      technicalScore: responseData.technicalScore,
      communicationScore: responseData.communicationScore,
      feedback: responseData.feedback,
      detailedFeedback: responseData.detailedFeedback,
      questionAnalysis: responseData.questionAnalysis
    });
  } catch (error) {
    console.error('Error submitting interview response:', error);
    res.status(500).json({ error: 'Failed to submit interview response' });
  }
});

// Create AI-generated screening
router.post('/screenings', companyAuth, async (req, res) => {
  try {
    const { 
      name, 
      positionTitle, 
      language, 
      mustHaves, 
      goodToHaves, 
      culturalFit, 
      estimatedTime, 
      status,
      interviewDuration
    } = req.body;
    const companyId = req.companyId;
    
    if (!name || !positionTitle) {
      return res.status(400).json({ error: 'Name and position title are required' });
    }
    
    // Create screening in MongoDB
    const screeningData = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      positionTitle: positionTitle,
      language: language || 'en-us',
      mustHaves: mustHaves || [],
      goodToHaves: goodToHaves || [],
      culturalFit: culturalFit || [],
      estimatedTime: estimatedTime || { mustHaves: 4, goodToHaves: 2, culturalFit: 2 },
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      jobDescription: req.body.jobDescription || '',
      profile: req.body.profile || 'frontend',
      level: req.body.level || 'mid',
      questions: req.body.questions || [],
      interviewDuration: typeof interviewDuration === 'number' && interviewDuration > 0 ? interviewDuration : 15, // Store interview duration (default 15 minutes)
    };
    
    // Add screening to MongoDB
    await db.addScreening(screeningData);
    
    res.json({
      id: screeningData.id,
      message: 'Screening created successfully',
      screening: screeningData
    });
  } catch (error) {
    console.error('Error creating screening:', error);
    res.status(500).json({ error: 'Failed to create screening' });
  }
});

// Get company screenings
router.get('/screenings', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get screenings for this company from MongoDB
    const screenings = await db.getScreeningsByCompany(companyId);
    
    // Enhance each screening with candidate statistics
    const screeningsWithStats = await Promise.all(screenings.map(async (screening) => {
      try {
        // Get the interview drive for this screening (drive ID = screening ID)
        const drive = await db.getDriveById(screening.id);
        
        let totalCandidates = 0;
        let completedInterviews = 0;
        
        if (drive && drive.candidateIds && Array.isArray(drive.candidateIds)) {
          totalCandidates = drive.candidateIds.length;
          
          // Count completed interviews by checking interview responses
          const responses = await db.getInterviewResponsesByDrive(screening.id);
          completedInterviews = responses ? responses.length : 0;
        }
        
        return {
          ...screening,
          totalCandidates,
          completedInterviews,
          candidateIds: drive?.candidateIds || [], // Include candidate IDs for compatibility
          jobDescription: drive?.jobDescription || screening.jobDescription || '',
          questions: drive?.questions || screening.questions || [],
          profile: drive?.profile || screening.profile || 'frontend',
          level: drive?.level || screening.level || 'mid',
        };
      } catch (error) {
        console.error(`Error getting stats for screening ${screening.id}:`, error);
        // Return screening with default values if there's an error
        return {
          ...screening,
          totalCandidates: 0,
          completedInterviews: 0,
          candidateIds: [],
          jobDescription: screening.jobDescription || '',
          questions: screening.questions || [],
          profile: screening.profile || 'frontend',
          level: screening.level || 'mid',
        };
      }
    }));
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }).json({
      screenings: screeningsWithStats,
      message: 'Screenings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
});

// Update screening
router.put('/screenings/:id', companyAuth, async (req, res) => {
  try {
    const screeningId = req.params.id;
    const companyId = req.companyId;
    const updateData = req.body;
    
    // Update screening in MongoDB
    const result = await db.updateScreening(screeningId, companyId, updateData);
    
    if (!result) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    
    res.json({
      message: 'Screening updated successfully',
      screening: result
    });
  } catch (error) {
    console.error('Error updating screening:', error);
    res.status(500).json({ error: 'Failed to update screening' });
  }
});

// Delete screening
router.delete('/screenings/:id', companyAuth, async (req, res) => {
  try {
    const screeningId = req.params.id;
    const companyId = req.companyId;
    
    // Delete screening from MongoDB
    const result = await db.deleteScreening(screeningId, companyId);
    
    if (!result) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    
    res.json({ message: 'Screening deleted successfully' });
  } catch (error) {
    console.error('Error deleting screening:', error);
    res.status(500).json({ error: 'Failed to delete screening' });
  }
});

// Add candidates to screening drive and send invites
router.post('/screenings/:id/invite-candidates', companyAuth, async (req, res) => {
  try {
    const screeningId = req.params.id;
    const companyId = req.companyId;
    const { candidates } = req.body; // Array of { name, email, profile }
    
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Candidates array is required' });
    }
    
    // Get screening details from MongoDB
    const screening = await db.getScreeningById(screeningId);
    
    if (!screening || screening.companyId !== companyId) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    
    // Add candidates to database and collect their IDs
    const candidateIds = [];
    const addedCandidates = [];
    
    for (const candidateData of candidates) {
      // Create candidate with company association
      const candidate = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        companyId: companyId,
        name: candidateData.name,
        email: candidateData.email,
        profile: candidateData.profile || 'General',
        status: 'applied',
        createdAt: new Date().toISOString()
      };
      
      await db.addCandidate(candidate);
      candidateIds.push(candidate.id);
      addedCandidates.push(candidate);
    }
    
    // Get or create interview drive for this screening
    let drive = await db.getDriveById(screeningId);
    
    if (!drive) {
      // Create a new drive for this screening
      let derivedProfile = screening.profile || 'frontend';
      if (!screening.profile && screening.positionTitle) {
        const positionLower = screening.positionTitle.toLowerCase();
        if (positionLower.includes('backend')) {
          derivedProfile = 'backend';
        } else if (positionLower.includes('full stack') || positionLower.includes('fullstack')) {
          derivedProfile = 'frontend';
        } else if (positionLower.includes('product')) {
          derivedProfile = 'product';
        } else if (positionLower.includes('business') || positionLower.includes('sales')) {
          derivedProfile = 'business';
        } else if (positionLower.includes('qa') || positionLower.includes('test')) {
          derivedProfile = 'qa';
        } else if (positionLower.includes('hr') || positionLower.includes('human')) {
          derivedProfile = 'hr';
        }
      }

      const driveData = {
        id: screeningId,
        companyId: companyId,
        name: screening.name,
        candidateIds: candidateIds,
        status: 'draft',
        createdAt: new Date().toISOString(),
        profile: derivedProfile,
        level: screening.level || 'mid',
        jobDescription: screening.jobDescription || '',
        questions: screening.questions || [],
      };
      
      await db.addInterviewDrive(driveData);
      drive = driveData;
    } else {
      // Add candidates to existing drive
      const updatedCandidateIds = [...(drive.candidateIds || []), ...candidateIds];
      await db.updateInterviewDrive(screeningId, { 
        candidateIds: updatedCandidateIds,
        updatedAt: new Date().toISOString()
      });
    }
    
    // Check if company has enough credits (6 credits per interview invite)
    const requiredCredits = addedCandidates.length * 6;
    const company = await db.getCompany(companyId);
    
    if (company.credits < requiredCredits) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        message: `You need ${requiredCredits} credits to send invites to ${addedCandidates.length} candidates, but you only have ${company.credits} credits.`,
        required: requiredCredits,
        available: company.credits
      });
    }
    
    // Generate interview links and send emails
    const interviewLinks = [];
    const emailResults = [];
    
    for (const candidate of addedCandidates) {
      // Generate unique token for each candidate
      const token = Buffer.from(`${candidate.id}-${screeningId}-${Date.now()}`).toString('base64');
      
      // Store token in MongoDB
      const tokenData = {
        id: Date.now().toString(),
        candidateId: candidate.id,
        driveId: screeningId,
        token: token,
        used: false,
        createdAt: new Date().toISOString()
      };
      
      await db.addInterviewToken(tokenData);
      
      // Generate interview link with company parameters
      // Prefer drive profile, fallback to screening position
      let profileFromPosition = drive.profile || screening.profile || 'frontend';
      if (!drive.profile) {
        const positionLower = screening.positionTitle?.toLowerCase() || '';
        if (positionLower.includes('backend')) {
          profileFromPosition = 'backend';
        } else if (positionLower.includes('full stack') || positionLower.includes('fullstack')) {
          profileFromPosition = 'frontend';
        } else if (positionLower.includes('product')) {
          profileFromPosition = 'product';
        } else if (positionLower.includes('business') || positionLower.includes('sales')) {
          profileFromPosition = 'business';
        } else if (positionLower.includes('qa') || positionLower.includes('test')) {
          profileFromPosition = 'qa';
        } else if (positionLower.includes('hr') || positionLower.includes('human')) {
          profileFromPosition = 'hr';
        }
      }
      const driveLevel = drive.level || screening.level || 'mid';

      const interviewParams = new URLSearchParams({
        token: token,
        company: 'HireOG',
        profile: profileFromPosition,
        level: driveLevel,
        candidateName: candidate.name,
        candidateEmail: candidate.email
      });
      const interviewLink = `${process.env.FRONTEND_URL || 'https://hireog.com'}/hiring/candidate-interview/${token}?${interviewParams.toString()}`;
      interviewLinks.push({
        candidate: candidate,
        link: interviewLink
      });
      
      // Send email to candidate
      try {
        const emailResult = await emailService.sendInterviewInvite(
          candidate.email,
          candidate.name,
          interviewLink,
          'HireOG',
          screening.name
        );
        emailResults.push({
          candidate: candidate,
          emailSent: emailResult.success,
          error: emailResult.error
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${candidate.email}:`, emailError);
        emailResults.push({
          candidate: candidate,
          emailSent: false,
          error: emailError.message
        });
      }
    }
    
    // Update screening status to active
    await db.updateScreening(screeningId, companyId, { status: 'active' });
    
    // Deduct credits (6 credits per interview invite)
    const creditsDeducted = addedCandidates.length * 6;
    const updatedCompany = await db.deductCompanyCredits(companyId, creditsDeducted);
    
    res.json({
      message: 'Candidates added and interview links sent successfully',
      addedCandidates: addedCandidates,
      links: interviewLinks,
      emailResults: emailResults,
      creditsDeducted: creditsDeducted,
      remainingCredits: updatedCompany.credits
    });
  } catch (error) {
    console.error('Error adding candidates to screening:', error);
    res.status(500).json({ error: 'Failed to add candidates to screening' });
  }
});

// Get screening details with candidate results
router.get('/screenings/:id/details', companyAuth, async (req, res) => {
  try {
    const screeningId = req.params.id;
    const companyId = req.companyId;
    
    // Get screening details from MongoDB
    const screening = await db.getScreeningById(screeningId);
    
    if (!screening || screening.companyId !== companyId) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    
    // Get candidates for this screening drive
    const candidates = await db.getCandidatesByDrive(screeningId);
    
    // Get interview responses for this drive
    const responses = await db.getInterviewResponsesByDrive(screeningId);
    
    // Create a map of candidate results with detailed analysis
    const candidateResults = candidates.map(candidate => {
      const response = responses.find(r => r.candidateId === candidate.id);
      
      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: response ? 'completed' : 'invited',
        hiringStatus: candidate.hiringStatus || 'pending',
        score: response ? (response.score || 0) : null,
        technicalScore: response ? response.technicalScore : null,
        communicationScore: response ? response.communicationScore : null,
        completedDate: response ? response.completedAt : null,
        invitedDate: candidate.createdAt,
        progress: response ? 100 : 0,
        feedback: response ? (response.detailedFeedback || response.feedback) : null,
        detailedFeedback: response ? response.detailedFeedback : null,
        questionAnalysis: response ? response.questionAnalysis : null,
        qaPairs: response ? response.qaPairs : null
      };
    });
    
    // Calculate screening statistics
    const totalCandidates = candidates.length;
    const completedCandidates = candidateResults.filter(c => c.status === 'completed').length;
    const averageScore = completedCandidates > 0 
      ? Math.round(candidateResults.filter(c => c.score).reduce((sum, c) => sum + c.score, 0) / completedCandidates)
      : 0;
    
    const screeningWithStats = {
      ...screening,
      totalCandidates,
      completedCandidates,
      inProgressCandidates: 0, // For now, we'll consider only completed and invited
      averageScore
    };
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }).json({
      screening: screeningWithStats,
      candidates: candidateResults
    });
  } catch (error) {
    console.error('Error fetching screening details:', error);
    res.status(500).json({ error: 'Failed to fetch screening details' });
  }
});

// Get interview configuration by token
router.get('/interview/config/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Get token data from MongoDB
    const tokenData = await db.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }
    
    // Get the screening configuration using the driveId (which is the screening ID)
    const screening = await db.getScreeningById(tokenData.driveId);
    
    if (!screening) {
      return res.status(404).json({ error: 'Screening configuration not found' });
    }
    
    // Get candidate information
    const candidate = await db.getCandidateById(tokenData.candidateId);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Return the complete interview configuration
    res.json({
      success: true,
      config: {
        // Screening configuration
        positionTitle: screening.positionTitle,
        language: screening.language,
        mustHaves: screening.mustHaves,
        goodToHaves: screening.goodToHaves,
        culturalFit: screening.culturalFit,
        estimatedTime: screening.estimatedTime,
        jobDescription: screening.jobDescription || '',
        questions: screening.questions || [],
        experienceLevel: screening.level || 'mid',
        interviewDuration: screening.interviewDuration || 15, // Include interview duration (default 15 minutes)
        profile: screening.profile || 'frontend', // Include screening profile
        // Candidate information
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateProfile: candidate.profile,
        // Company information
        companyName: 'HireOG',
        // Token information
        token: token,
        driveId: tokenData.driveId,
        candidateId: tokenData.candidateId
      }
    });
  } catch (error) {
    console.error('Error getting interview configuration:', error);
    res.status(500).json({ error: 'Failed to get interview configuration' });
  }
});

// Get company credits
router.get('/credits', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    const company = await db.getCompany(companyId);
    res.json({
      credits: company.credits || 1000,
      companyId: companyId
    });
  } catch (error) {
    console.error('Error fetching company credits:', error);
    res.status(500).json({ error: 'Failed to fetch company credits' });
  }
});

// Get comprehensive reports data
router.get('/reports', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get all data for the company
    const candidates = await db.getCandidatesByCompany(companyId);
    const screenings = await db.getScreeningsByCompany(companyId);
    const drives = await db.getDrivesByCompany(companyId);
    
    // Get all interview responses for this company
    // We'll need to get responses by iterating through drives
    const allResponses = [];
    for (const drive of drives) {
      try {
        const responses = await db.getInterviewResponsesByDrive(drive.id);
        if (responses && Array.isArray(responses)) {
          allResponses.push(...responses);
        }
      } catch (error) {
        console.error(`Error fetching responses for drive ${drive.id}:`, error);
      }
    }
    
    // Calculate overall metrics
    const totalCandidates = candidates.length;
    const totalScreenings = screenings.length;
    const totalDrives = drives.length;
    const totalInterviews = allResponses.length;
    
    // Calculate completion rate
    const totalInvited = candidates.length;
    const completionRate = totalInvited > 0 ? (totalInterviews / totalInvited) * 100 : 0;
    
    // Calculate average scores
    const scoresWithValues = allResponses.filter(r => r.score && typeof r.score === 'number');
    const avgScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, r) => sum + r.score, 0) / scoresWithValues.length
      : 0;
    
    const technicalScores = allResponses.filter(r => r.technicalScore && typeof r.technicalScore === 'number');
    const avgTechnicalScore = technicalScores.length > 0
      ? technicalScores.reduce((sum, r) => sum + r.technicalScore, 0) / technicalScores.length
      : 0;
    
    const communicationScores = allResponses.filter(r => r.communicationScore && typeof r.communicationScore === 'number');
    const avgCommunicationScore = communicationScores.length > 0
      ? communicationScores.reduce((sum, r) => sum + r.communicationScore, 0) / communicationScores.length
      : 0;
    
    // Profile-wise breakdown
    const profileBreakdown = {};
    allResponses.forEach(response => {
      const profile = response.profile || 'unknown';
      if (!profileBreakdown[profile]) {
        profileBreakdown[profile] = {
          count: 0,
          totalScore: 0,
          totalTechnical: 0,
          totalCommunication: 0
        };
      }
      profileBreakdown[profile].count++;
      if (response.score) profileBreakdown[profile].totalScore += response.score;
      if (response.technicalScore) profileBreakdown[profile].totalTechnical += response.technicalScore;
      if (response.communicationScore) profileBreakdown[profile].totalCommunication += response.communicationScore;
    });
    
    const profileStats = Object.entries(profileBreakdown).map(([profile, data]) => ({
      profile,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
      avgTechnical: data.count > 0 ? data.totalTechnical / data.count : 0,
      avgCommunication: data.count > 0 ? data.totalCommunication / data.count : 0
    }));
    
    // Level-wise breakdown
    const levelBreakdown = {};
    allResponses.forEach(response => {
      const level = response.level || 'mid';
      if (!levelBreakdown[level]) {
        levelBreakdown[level] = { count: 0, totalScore: 0 };
      }
      levelBreakdown[level].count++;
      if (response.score) levelBreakdown[level].totalScore += response.score;
    });
    
    const levelStats = Object.entries(levelBreakdown).map(([level, data]) => ({
      level,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0
    }));
    
    // Hiring status breakdown
    const hiringStatusBreakdown = {};
    candidates.forEach(candidate => {
      const status = candidate.hiringStatus || 'pending';
      hiringStatusBreakdown[status] = (hiringStatusBreakdown[status] || 0) + 1;
    });
    
    // Score distribution (0-10 scale)
    const scoreDistribution = {
      excellent: scoresWithValues.filter(r => r.score >= 8).length,
      good: scoresWithValues.filter(r => r.score >= 6 && r.score < 8).length,
      average: scoresWithValues.filter(r => r.score >= 4 && r.score < 6).length,
      poor: scoresWithValues.filter(r => r.score < 4).length
    };
    
    // Top performers
    const topPerformers = allResponses
      .filter(r => r.score && typeof r.score === 'number')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(response => {
        const candidate = candidates.find(c => c.id === response.candidateId);
        return {
          candidateId: response.candidateId,
          candidateName: response.candidateName || candidate?.name || 'Unknown',
          candidateEmail: response.candidateEmail || candidate?.email || '',
          score: response.score,
          technicalScore: response.technicalScore,
          communicationScore: response.communicationScore,
          completedAt: response.completedAt,
          driveId: response.driveId
        };
      });
    
    // Time-based trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentResponses = allResponses.filter(r => {
      if (!r.completedAt) return false;
      const completedDate = new Date(r.completedAt);
      return completedDate >= thirtyDaysAgo;
    });
    
    // Daily interview count for last 30 days
    const dailyTrends = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrends[dateStr] = recentResponses.filter(r => {
        if (!r.completedAt) return false;
        return r.completedAt.split('T')[0] === dateStr;
      }).length;
    }
    
    // Screening performance
    const screeningPerformance = screenings.map(screening => {
      const screeningResponses = allResponses.filter(r => r.driveId === screening.id);
      const screeningCandidates = candidates.filter(c => 
        screening.candidateIds && screening.candidateIds.includes(c.id)
      );
      
      return {
        id: screening.id,
        name: screening.name,
        totalCandidates: screeningCandidates.length,
        completedInterviews: screeningResponses.length,
        completionRate: screeningCandidates.length > 0 
          ? (screeningResponses.length / screeningCandidates.length) * 100 
          : 0,
        avgScore: screeningResponses.length > 0
          ? screeningResponses
              .filter(r => r.score)
              .reduce((sum, r) => sum + r.score, 0) / screeningResponses.filter(r => r.score).length
          : 0,
        status: screening.status
      };
    });
    
    res.json({
      overview: {
        totalCandidates,
        totalScreenings,
        totalDrives,
        totalInterviews,
        completionRate: Math.round(completionRate * 100) / 100,
        avgScore: Math.round(avgScore * 100) / 100,
        avgTechnicalScore: Math.round(avgTechnicalScore * 100) / 100,
        avgCommunicationScore: Math.round(avgCommunicationScore * 100) / 100
      },
      profileBreakdown: profileStats,
      levelBreakdown: levelStats,
      hiringStatusBreakdown,
      scoreDistribution,
      topPerformers,
      dailyTrends,
      screeningPerformance
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

module.exports = router;
