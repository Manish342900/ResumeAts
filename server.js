const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const { PDFDocument } = require('pdf-lib');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const jwt = require('jsonwebtoken');

const { connectDB } = require('./server/config/db');
const User = require('./server/models/User');
const auth = require('./server/middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://resume-ats-git-main-manishs-projects-d53fae75.vercel.app',
    'https://accounts.google.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('client/build'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF and Word documents are allowed!');
    }
  }
});



// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    CV_DETAILS = data.text
    return data.text;
  } catch (error) {
    throw new Error('Error extracting text from PDF');
  }
}

// Helper function to extract URLs from text
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Helper function to check if a URL is valid
async function checkUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      }
    });
    return {
      url,
      isValid: true,
      status: response.status
    };
  } catch (error) {
    return {
      url,
      isValid: false,
      error: error.message
    };
  }
}

// Helper function to analyze resume with GitHub AI


async function analyzeResumeWithAI(
  resumeText,
  linkResults,
  industry,
  jobDescription,
  keywords,
  formattingPreferences
) {
  try {
    const linkAnalysis = linkResults
      .map(result => `${result.url}: ${result.isValid ? 'Valid' : 'Invalid'}`)
      .join('\n');

    const promptParts = [];

    if (industry) {
      promptParts.push(`Target Industry: ${industry}`);
    }
    if (jobDescription) {
      promptParts.push(`Job Description: ${jobDescription}`);
    }
    if (keywords) {
      promptParts.push(`Focus Keywords: ${keywords}`);
    }
    if (formattingPreferences) {
      promptParts.push(`Formatting Preferences: ${formattingPreferences}`);
    }

    promptParts.push(
      `Analyze the resume text below and return your response in **valid JSON** format only.\n\n` +
      `Return the following keys in your JSON:\n` +
      `- "atsScore": Number (0–100)\n` +
      `- "suggestionsBySection": Object with keys like "Profile", "Experience", etc., each an array of suggestions\n` +
      `- "keySkills": Array of strings\n` +
      `- "areasNeedingImprovement": Array of strings\n\n` +
      `Link Validation Results:\n${linkAnalysis}\n\n` +
      `Resume Text:\n${resumeText}`
    );

    const userPrompt = promptParts.join('\n\n');

    const response = await axios.post(
      'https://models.github.ai/inference/chat/completions',
      {
        model: 'openai/gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert ATS resume analyzer. Respond ONLY in valid JSON format based on the prompt.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rawContent = response.data.choices?.[0]?.message?.content || '';

    // Parse the model's JSON response safely
    const jsonStart = rawContent.indexOf('{');
    const jsonEnd = rawContent.lastIndexOf('}');
    const jsonString = rawContent.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('Resume analysis failed:', error.response?.data || error.message);
    throw new Error('Error analyzing resume with AI');
  }
}

// New: Helper function for chatbot career advice
async function chatWithCareerAdvisor(userMessage, cvDetails, analysisData) {
  try {
    let prompt = `You are a professional career advisor. Using the following CV details, answer the user's question or provide career/job advice. Be concise, actionable, and professional. Respond as a helpful advisor, not as an AI.\n\nCV Details:\n${cvDetails}`;
    if (analysisData) {
      prompt += `\n\nAnalysis Data (such as ATS score, suggestions, etc.):\n${JSON.stringify(analysisData, null, 2)}`;
    }
    prompt += `\n\nUser's Question or Message:\n${userMessage}`;

    const response = await axios.post(
      'https://models.github.ai/inference/chat/completions',
      {
        model: 'openai/gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional career advisor. Respond in a concise, actionable, and professional manner. Do not mention you are an AI.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 400
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const advisorMessage = response.data.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response at this time.";
    return advisorMessage;
  } catch (error) {
    console.error('Career advisor chat failed:', error.response?.data || error.message);
    return "I'm sorry, I couldn't generate a response at this time.";
  }
}

// Helper function to extract score from analysis
function extractScore(analysis) {
  // Try different patterns to find the score
  const patterns = [
    /ATS Score:\s*(\d+)/i,
    /Score:\s*(\d+)/i,
    /(\d+)\s*\/\s*100/i,
    /(\d+)\s*out of\s*100/i,
    /(\d+)\s*points/i
  ];

  for (const pattern of patterns) {
    const match = analysis.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        return score;
      }
    }
  }

  // If no score found, try to find any number between 0-100
  const numbers = analysis.match(/\b\d+\b/g);
  if (numbers) {
    for (const num of numbers) {
      const score = parseInt(num);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        return score;
      }
    }
  }

  return null;
}

// Connect to MongoDB
let db;
(async () => {
  db = await connectDB();
})();



// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.email);
});
passport.deserializeUser(async (email, done) => {
  const user = await User.findByEmail(email);
  done(null, user);
});

// In your server.js (or auth routes file)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true,
  scope: ['profile', 'email']
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile:', profile); // Debug log

    if (!profile.emails || !profile.emails[0]) {
      return done(new Error('No email found in Google profile'));
    }

    const email = profile.emails[0].value;
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await User.createGoogleUser({
        name: profile.displayName,
        email,
        googleId: profile.id
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      await User.updateGoogleId(email, profile.id);
      user.googleId = profile.id;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Attach token to user object
    user.token = token;
    return done(null, user);
  } catch (err) {
    console.error('Google auth error:', err);
    return done(err);
  }
}));

// Initiate Google auth
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account' // Forces account selection
}));

// Google callback
// Google callback route
app.get('/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
    failureMessage: true
  }),
  (req, res) => {
    try {
      console.log('Google OAuth callback triggered');
      console.log('req.user:', req.user);
      if (req.user) {
        console.log('req.user.token:', req.user.token);
      }
      if (!req.user || !req.user.token) {
        throw new Error('Authentication failed');
      }

      // For API clients (React frontend)
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
          token: req.user.token,
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
          }
        });
      }

      // For traditional web flow
      res.redirect(`${process.env.REACT_APP_FRONTEND_URL}/login?token=${req.user.token}`);
    } catch (error) {
      console.error('Callback error:', error);
      res.redirect(`${process.env.REACT_APP_FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      return res.status(400).json({ error: 'Password is required' });
    }

    
    // Find user
    const user = await User.findByEmail(email);

    if(user.googleId){
      return res.status(401).json({ error: 'Please use Google Login' });
    }



    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      resumeAnalysed: user.resumeAnalysed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Resume History
app.get('/api/resume-history', auth, async (req, res) => {
  try {
    const history = await db.collection('resumeHistory')
      .find({ userId: req.user._id })
      .sort({ analyzedAt: -1 })
      .toArray();

    res.json({ history });
  } catch (error) {
    console.error('Failed to fetch resume history:', error);
    res.status(500).json({ error: 'Failed to fetch resume history' });
  }
});

// Get details for a specific resume analysis
app.get('/api/resume-history/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await db.collection('resumeHistory').findOne({
      _id: new ObjectId(id),
      userId: req.user._id
    });
    if (!entry) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Failed to fetch analysis details:', error);
    res.status(500).json({ error: 'Failed to fetch analysis details' });
  }
});

// Routes
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(req.file.path);

    // Extract and validate URLs
    const urls = extractUrls(resumeText);
    const linkResults = await Promise.all(urls.map(url => checkUrl(url)));

    // Get optional fields from form data
    const industry = req.body.industry || '';
    const jobDescription = req.body.jobDescription || '';
    const keywords = req.body.keywords || '';
    const formattingPreferences = req.body.formattingPreferences || '';

    // Analyze resume with structured output
    const analysis = await analyzeResumeWithAI(
      resumeText,
      linkResults,
      industry,
      jobDescription,
      keywords,
      formattingPreferences
    );

    if (!analysis || typeof analysis !== 'object') {
      throw new Error('Model did not return a structured JSON response');
    }

    const atsScore = analysis.atsScore || 0;

    // Save to history if user is authenticated
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByEmail(decoded.email);
        await db.collection('resumeHistory').insertOne({
          userId: user._id,
          fileName: req.file.originalname,
          analyzedAt: new Date(),
          atsScore,
          industry,
          analysis
        });
        // Increment resumeAnalysed for the user
        await User.incrementResumeAnalysed(decoded.email);
      } catch (error) {
        console.error('Failed to save resume history or increment counter:', error);
      }
    }

    res.json({
      atsScore,
      linkResults,
      suggestionsBySection: analysis.suggestionsBySection || {},
      keySkills: analysis.keySkills || [],
      areasNeedingImprovement: analysis.areasNeedingImprovement || [],
      fullAnalysis: analysis // optionally send entire raw analysis too
    });
  } catch (error) {
    console.error('Resume analysis failed:', error);
    res.status(500).json({ error: 'Resume analysis failed' });
  }
});


app.post('/api/update-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(req.file.path);

    // Get suggestions for improvements using GitHub AI
    const response = await axios.post(
      "https://models.github.ai/inference/chat/completions",
      {
        model: "openai/gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Provide specific improvements to make the resume more ATS-friendly."
          },
          {
            role: "user",
            content: `Based on this resume, provide specific improvements to make it more ATS-friendly:
            ${resumeText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const improvements = response.data.choices?.[0]?.message?.content;

    if (!improvements) {
      throw new Error('Model did not return a response');
    }

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      improvements,
      originalText: resumeText
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error updating resume' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, cvDetails, analysisData } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required.'
      });
    }

    // Check if CV details are available
    if (!cvDetails) {
      return res.json({
        message: "Please upload your CV to get started.",
        timestamp: new Date().toISOString()
      });
    }

    // Always use the career advisor model for all questions
    const advisorMessage = await chatWithCareerAdvisor(message, cvDetails, analysisData);
    return res.json({
      message: advisorMessage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Error processing chat request' });
  }
});

// Verify Authentication
app.get('/api/verify-auth', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Extract CV details from an uploaded resume file
app.post('/api/cv-details', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from the uploaded PDF
    const cvDetails = await extractTextFromPDF(req.file.path);

    // Optionally, clean up the uploaded file after extraction
    fs.unlinkSync(req.file.path);

    res.json({
      cvDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error extracting CV details:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: 'Failed to extract CV details',
      details: error.message
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
