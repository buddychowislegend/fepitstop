const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Log cheating incident
router.post('/incidents', async (req, res) => {
  try {
    const { sessionId, userId, incident } = req.body;
    
    if (!sessionId || !incident) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Ensure MongoDB connection (if using MongoDB)
    if (db.ensureConnection) {
      await db.ensureConnection();
    }
    
    const incidentData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sessionId: sessionId,
      userId: userId || null,
      type: incident.type,
      timestamp: incident.timestamp || new Date().toISOString(),
      severity: incident.severity || 'low',
      description: incident.description || '',
      metadata: incident.metadata || {},
      createdAt: new Date().toISOString()
    };
    
    // Store in MongoDB (only if db.db exists - MongoDB instance)
    if (db.db && db.db.collection) {
      await db.db.collection('interviewIncidents').insertOne(incidentData);
      
      // Also update the interview session with incident count if session exists
      if (sessionId) {
        try {
          await db.db.collection('interviewSessions').updateOne(
            { id: sessionId },
            { 
              $inc: { incidentCount: 1 },
              $push: { 
                incidents: {
                  type: incident.type,
                  timestamp: incident.timestamp,
                  severity: incident.severity
                }
              }
            },
            { upsert: false }
          );
        } catch (sessionError) {
          // Session might not exist yet, that's okay - just log it
          console.log('Could not update session (might not exist):', sessionError.message);
        }
      }
    } else {
      // File-based storage - store in memory/file (you might want to implement this)
      console.log('File-based storage: Incident logged (not persisted):', incidentData);
    }
    
    console.log('Interview incident logged:', {
      sessionId,
      type: incident.type,
      severity: incident.severity
    });
    
    res.json({ 
      success: true, 
      incidentId: incidentData.id 
    });
  } catch (error) {
    console.error('Error logging incident:', error);
    res.status(500).json({ 
      error: 'Failed to log incident',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get incidents for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Ensure MongoDB connection (if using MongoDB)
    if (db.ensureConnection) {
      await db.ensureConnection();
    }
    
    let incidents = [];
    if (db.db && db.db.collection) {
      incidents = await db.db.collection('interviewIncidents')
        .find({ sessionId })
        .sort({ timestamp: -1 })
        .toArray();
    }
    
    res.json({ incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch incidents',
      message: error.message 
    });
  }
});

// Get incidents for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure MongoDB connection (if using MongoDB)
    if (db.ensureConnection) {
      await db.ensureConnection();
    }
    
    let incidents = [];
    if (db.db && db.db.collection) {
      incidents = await db.db.collection('interviewIncidents')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
    }
    
    res.json({ incidents });
  } catch (error) {
    console.error('Error fetching user incidents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch incidents',
      message: error.message 
    });
  }
});

module.exports = router;

