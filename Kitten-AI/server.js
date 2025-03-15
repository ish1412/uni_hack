const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle chat requests
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, userState } = req.body;
    
    // Optional: Log the incoming request
    console.log(`Received message from ${userId}: ${message}`);
    
    // Call to Gemini AI API with your fine-tuned model
    try {
      const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        contents: [{
          parts: [{
            text: `User Profile: Level: ${userState.level}, Study Streak: ${userState.studyStreak} days, Points: ${userState.points}
            
User Message: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        }
      });
      
      // Extract the AI response
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Send the response back to the frontend
      res.json({ message: aiResponse });
    } catch (apiError) {
      console.error('Error with Gemini API:', apiError.message);
      
      // If API key is invalid or not set up yet, return a fallback response
      res.json({ 
        message: "Hi there! I'm KittenAI. I'm having trouble connecting to my brain right now, but I'll be fully functional once my API connection is properly set up. How can I help you today?" 
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`KittenAI server running on http://localhost:${PORT}`);
});