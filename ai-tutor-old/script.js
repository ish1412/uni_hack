// Select all necessary elements
const personalityButtons = document.querySelectorAll('.personality-btn');
const taskList = document.querySelector('#task-list');
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskProgress = document.querySelector('#task-progress');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Store the user's selected AI personality
let selectedPersonality = 'friendly';

// Your Gemini API key - this should be handled securely in production
// In a production environment, this should be managed server-side
let geminiApiKey = 'AIzaSyCR4mgi5FgyHeIcRthwSlzdIDOoA44p9E0';

// Function to set the API key
function setGeminiApiKey(key) {
  geminiApiKey = key;
  localStorage.setItem('geminiApiKey', key);
  console.log('Gemini API key has been set');
  
  // Show a welcome message when API key is set
  addAIMessage("Hello! I'm KittenAI, your productivity companion. How can I help you today?");
}

// Check if API key exists in local storage
function checkForApiKey() {
  const storedKey = localStorage.getItem('geminiApiKey');
  if (storedKey) {
    geminiApiKey = storedKey;
    console.log('API key loaded from local storage');
    addAIMessage("Welcome back! How can I assist you with your goals today?");
  } else {
    // Prompt user for API key on first visit
    setTimeout(() => {
      const key = prompt('Please enter your Gemini API Key to enable chat functionality:');
      if (key) {
        setGeminiApiKey(key);
      } else {
        addAIMessage("I notice you haven't added your Gemini API key yet. Please enter it when prompted to unlock my full capabilities!");
      }
    }, 1000);
  }
}

// Function to update the AI personality
function updatePersonality(personality) {
  selectedPersonality = personality;
  addAIMessage(`My personality has been updated to: ${personality}. How would you like me to help you now?`);
}

// Add event listeners to personality buttons
if (personalityButtons) {
  personalityButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const personality = e.target.getAttribute('data-personality');
      updatePersonality(personality);
    });
  });
}

// Function to create a task and append it to the task list
function addTask(taskText) {
  if (!taskList) return;
  
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  taskItem.textContent = taskText;
  taskList.appendChild(taskItem);
}

// Handle task form submission
if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
      addTask(taskText);
      taskInput.value = '';
      updateProgress();
    }
  });
}

// Function to update task progress (e.g., for gamification)
function updateProgress() {
  if (!taskProgress || !taskList) return;
  
  const tasks = taskList.querySelectorAll('.task-item');
  const progress = Math.round((tasks.length / 10) * 100); // 10 tasks to reach 100%
  taskProgress.textContent = `Task Progress: ${progress}%`;
}

// Function to add an AI message to the chat
function addAIMessage(text) {
  const message = document.createElement('div');
  message.classList.add('message');
  
  message.innerHTML = `
    <div class="message-avatar">
      <img src="./Images/kitty2 fix.png" alt="AI Avatar">
    </div>
    <div class="message-content">
      <strong>KittenAI:</strong> ${text}
    </div>
  `;
  
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  
  // Update streak and points for user engagement (gamification)
  incrementUserEngagement();
}

// Function to add a user message to the chat
function addUserMessage(text) {
  const message = document.createElement('div');
  message.classList.add('message', 'user-message');
  
  message.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="message-content">
      <strong>You:</strong> ${text}
    </div>
  `;
  
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Function to show typing indicator
function showTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.classList.add('message', 'typing-indicator');
  typingIndicator.id = 'typing-indicator';
  
  typingIndicator.innerHTML = `
    <div class="message-avatar">
      <img src="./Images/kitty2 fix.png" alt="AI Avatar">
    </div>
    <div class="message-content">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  chatHistory.appendChild(typingIndicator);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Function to remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Function to make API call to Gemini 1.5 Pro
async function getAIResponse(userMessage) {
  if (!geminiApiKey) {
    addAIMessage("Please set your Gemini API key first to enable AI chat functionality.");
    return;
  }
  
  showTypingIndicator();
  
  try {
    // Gemini 1.5 Pro API endpoint - Updated to use the correct model
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    
    // Building the request with personality context
    let personalityContext = "";
    
    switch(selectedPersonality) {
      case 'friendly':
        personalityContext = "You are KittenAI, a friendly and supportive productivity assistant. Be encouraging and warm.";
        break;
      case 'strict':
        personalityContext = "You are KittenAI, a strict productivity coach. Be direct and push the user to stay on track.";
        break;
      case 'analytical':
        personalityContext = "You are KittenAI, an analytical productivity assistant. Focus on data and logical approaches.";
        break;
      default:
        personalityContext = "You are KittenAI, a helpful productivity assistant.";
    }
    
    const payload = {
      contents: [{
        parts: [{
          text: `${personalityContext}\n\nUser message: ${userMessage}\n\nRespond in a way that helps the user with productivity, goal-setting, or motivation.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };
    
    const response = await fetch(`${endpoint}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error communicating with Gemini API');
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      return aiResponse;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return `Sorry, I encountered an error when trying to process your request. ${error.message}`;
  } finally {
    removeTypingIndicator();
  }
}

// Function to handle sending messages
async function sendMessage() {
  const message = userInput.value.trim();
  
  if (message) {
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    userInput.value = '';
    
    // Get and display AI response
    const aiResponse = await getAIResponse(message);
    addAIMessage(aiResponse);
  }
}

// Event listeners for chat
if (sendBtn && userInput) {
  sendBtn.addEventListener('click', sendMessage);
  
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Function to increment user stats (gamification feature)
function incrementUserEngagement() {
  const streakEl = document.getElementById('streak');
  const pointsEl = document.getElementById('points');
  const levelEl = document.getElementById('level');
  
  if (streakEl && pointsEl && levelEl) {
    // Get current values
    let streak = parseInt(localStorage.getItem('userStreak') || '0');
    let points = parseInt(localStorage.getItem('userPoints') || '0');
    let lastInteraction = localStorage.getItem('lastInteraction') || null;
    
    // Check if this is a new day for streak counting
    const today = new Date().toDateString();
    if (lastInteraction !== today) {
      streak += 1;
      localStorage.setItem('userStreak', streak);
      localStorage.setItem('lastInteraction', today);
    }
    
    // Update points
    points += 5;
    localStorage.setItem('userPoints', points);
    
    // Update level based on points
    let level = 'Beginner';
    if (points >= 500) level = 'Expert';
    else if (points >= 250) level = 'Advanced';
    else if (points >= 100) level = 'Intermediate';
    
    // Update UI
    streakEl.textContent = `${streak} days`;
    pointsEl.textContent = points;
    levelEl.textContent = level;
  }
}

// Initialize the chat when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the chat section
  if (chatHistory) {
    checkForApiKey();
    
    // Load user stats from localStorage
    const streak = localStorage.getItem('userStreak') || '0';
    const points = localStorage.getItem('userPoints') || '0';
    let level = 'Beginner';
    if (parseInt(points) >= 500) level = 'Expert';
    else if (parseInt(points) >= 250) level = 'Advanced';
    else if (parseInt(points) >= 100) level = 'Intermediate';
    
    const streakEl = document.getElementById('streak');
    const pointsEl = document.getElementById('points');
    const levelEl = document.getElementById('level');
    
    if (streakEl) streakEl.textContent = `${streak} days`;
    if (pointsEl) pointsEl.textContent = points;
    if (levelEl) levelEl.textContent = level;
  }
});