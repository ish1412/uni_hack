// script.js - Gemini AI Chat Integration

// Configuration for Gemini AI
const GEMINI_API_KEY = "AIzaSyCR4mgi5FgyHeIcRthwSlzdIDOoA44p9E0"; // Replace with your actual API key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    
    // Points and gamification elements
    const streakElement = document.getElementById('streak');
    const pointsElement = document.getElementById('points');
    const levelElement = document.getElementById('level');
    
    // User data (would typically be stored in a database)
    let userData = {
        streak: 0,
        points: 0,
        level: 'Beginner',
        lastInteraction: null
    };
    
    // Load user data from localStorage if available
    loadUserData();
    
    // Initialize chat with welcome message if chat is empty
    if (chatHistory.children.length === 0) {
        addAIMessage("Hello! I'm your AI productivity companion powered by Gemini. How can I help you today?");
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
    
    // Handle user message submission
    function handleUserMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input field
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process with Gemini AI
        processWithGeminiAI(message);
        
        // Update user data
        updateUserData();
    }
    
    // Process message with Gemini AI
    async function processWithGeminiAI(message) {
        try {
            // Prepare the request body
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `You are a productivity and motivation AI assistant named FocusAI. 
                              Respond to this user message in a helpful, motivating way. Keep responses 
                              relatively brief (2-3 paragraphs maximum) and focused on productivity, 
                              motivation, and personal growth. Add emojis occasionally for a friendly tone.
                              
                              User message: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            };
            
            // Send request to Gemini API
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            // Process the response
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Check for valid response
            if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
                // Get AI response text
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                // Add AI message to chat
                addAIMessage(aiResponse);
                
                // Award points for meaningful interaction
                awardPoints(5);
            } else {
                // Handle error or unexpected response format
                addAIMessage("I'm having trouble processing your request right now. Could you try again?");
            }
        } catch (error) {
            console.error("Error communicating with Gemini AI:", error);
            removeTypingIndicator();
            addAIMessage("I'm experiencing a technical issue. Please try again in a moment.");
        }
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${escapeHTML(message)}</p>
            </div>
        `;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Add AI message to chat
    function addAIMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="ai_avatar.svg" alt="AI">
            </div>
            <div class="message-content">
                <p>${formatAIMessage(message)}</p>
            </div>
        `;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <img src="ai_avatar.svg" alt="AI">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatHistory.appendChild(typingElement);
        scrollToBottom();
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Format AI message (convert newlines to <br>, etc.)
    function formatAIMessage(message) {
        return escapeHTML(message)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    // Escape HTML to prevent XSS
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Scroll to bottom of chat history
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // Award points for user actions
    function awardPoints(points) {
        userData.points += points;
        updateLevelBasedOnPoints();
        updateUIWithUserData();
        saveUserData();
    }
    
    // Update level based on points
    function updateLevelBasedOnPoints() {
        if (userData.points >= 1000) {
            userData.level = 'Expert';
        } else if (userData.points >= 500) {
            userData.level = 'Advanced';
        } else if (userData.points >= 200) {
            userData.level = 'Intermediate';
        } else if (userData.points >= 50) {
            userData.level = 'Novice';
        } else {
            userData.level = 'Beginner';
        }
    }
    
    // Update user data (streak, etc.)
    function updateUserData() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (userData.lastInteraction) {
            const lastDate = new Date(userData.lastInteraction);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Check if last interaction was yesterday
            if (lastDate.toDateString() === yesterday.toDateString()) {
                userData.streak++;
                // Award bonus points for maintaining streak
                awardPoints(userData.streak);
            } 
            // If more than a day has passed, reset streak
            else if (lastDate < yesterday) {
                userData.streak = 1;
            }
        } else {
            userData.streak = 1;
        }
        
        userData.lastInteraction = today.toISOString();
        updateUIWithUserData();
        saveUserData();
    }
    
    // Update UI with user data
    function updateUIWithUserData() {
        streakElement.textContent = `${userData.streak} days`;
        pointsElement.textContent = userData.points;
        levelElement.textContent = userData.level;
    }
    
    // Save user data to localStorage
    function saveUserData() {
        localStorage.setItem('focusAI_userData', JSON.stringify(userData));
    }
    
    // Load user data from localStorage
    function loadUserData() {
        const savedData = localStorage.getItem('focusAI_userData');
        if (savedData) {
            userData = JSON.parse(savedData);
            updateUIWithUserData();
        }
    }
});