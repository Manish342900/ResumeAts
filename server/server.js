const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// User routes
app.use('/api', userRoutes);

// Resume analysis endpoint
app.post('/api/analyze-resume', auth, async (req, res) => {
    try {
        // Your existing resume analysis logic here
        
        // After successful analysis, increment the counter
        await User.incrementResumeAnalysed(req.user.email);
        
        // Return the analysis results
        res.json({
            success: true,
            message: 'Resume analyzed successfully',
            // Include your analysis results here
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// No-op endpoint


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 