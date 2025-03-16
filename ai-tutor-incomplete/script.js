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
    // First check hardcoded key
    if (geminiApiKey && geminiApiKey !== 'AIzaSyCR4mgi5FgyHeIcRthwSlzdIDOoA44p9E0') {
      localStorage.setItem('geminiApiKey', geminiApiKey);
      addAIMessage("Hello! I'm KittenAI. How can I help you today?");
      return;
    }
  
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      geminiApiKey = storedKey;
      addAIMessage("Welcome back! How can I assist you today?");
    } else {
      setTimeout(() => {
        const key = prompt('Please enter your Gemini API Key:');
        if (key) setGeminiApiKey(key);
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

// Goals and Progress Enhancement

// Global Variables
let goals = [];
let actionHistory = [];

// Initialize goals and progress
document.addEventListener('DOMContentLoaded', () => {
    // Check if we need to initialize sections
    const goalsSection = document.getElementById('goals-section');
    const progressSection = document.getElementById('progress-section');
    
    if(!goalsSection || !progressSection) {
        console.error("Goals or Progress section not found in DOM");
        return;
    }
    
    // Set up section switching
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Don't switch to locked sections
            if(item.classList.contains('locked')) {
                return;
            }
            
            const section = item.dataset.section;
            if(section) {
                switchSection(section);
            }
        });
    });
    
    // Load goals from localStorage
    loadGoals();
    
    // Set up event listeners
    setupGoalsEventListeners();
    
    // Initial render of sections
    refreshGoalsUI();
    updateProgressUI();
    
    // Default to chat section
    switchSection('chat');
});

// Section Switching Logic
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.active-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show selected section
    const sectionToShow = document.getElementById(`${sectionName}-section`);
    if(sectionToShow) {
        sectionToShow.classList.add('active-section');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if(item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update UI for specific sections
    if(sectionName === 'goals') {
        refreshGoalsUI();
    } else if(sectionName === 'progress') {
        updateProgressUI();
    }
    
    // Toggle chat input and footer visibility
    const chatInput = document.querySelector('.chat-input');
    const chatFooter = document.querySelector('.chat-footer');
    
    if(chatInput && chatFooter) {
        chatInput.style.display = sectionName === 'chat' ? 'flex' : 'none';
        chatFooter.style.display = sectionName === 'chat' ? 'block' : 'none';
    }
}

// Goals Functions
function loadGoals() {
    // Get goals from localStorage
    const storedGoals = localStorage.getItem('goals');
    
    if(storedGoals) {
        try {
            goals = JSON.parse(storedGoals);
        } catch(e) {
            console.error('Error parsing goals from localStorage:', e);
            goals = [];
        }
    } else {
        // Initialize with sample goals if none exist
        goals = [
            { id: generateID(), text: 'Complete productivity tutorial', completed: false, createdAt: new Date().toISOString() },
            { id: generateID(), text: 'Set up weekly goals routine', completed: false, createdAt: new Date().toISOString() },
            { id: generateID(), text: 'Try 25-minute focus session', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() }
        ];
        saveGoals();
    }
    
    // Load action history
    loadActionHistory();
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
    updateProgressUI();
}

function setupGoalsEventListeners() {
    // Add goal button
    const addGoalBtn = document.getElementById('add-goal-btn');
    const newGoalInput = document.getElementById('new-goal');
    
    if(addGoalBtn && newGoalInput) {
        // Add goal on button click
        addGoalBtn.addEventListener('click', () => {
            addNewGoal();
        });
        
        // Add goal on Enter key
        newGoalInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                addNewGoal();
            }
        });
    }
}

function addNewGoal() {
    const newGoalInput = document.getElementById('new-goal');
    
    if(!newGoalInput) return;
    
    const goalText = newGoalInput.value.trim();
    
    if(goalText) {
        // Create new goal object
        const newGoal = {
            id: generateID(),
            text: goalText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to goals array
        goals.unshift(newGoal);
        
        // Save to localStorage
        saveGoals();
        
        // Clear input
        newGoalInput.value = '';
        
        // Update UI
        refreshGoalsUI();
        
        // Add to action history
        addActionToHistory('added', goalText);
        
        // Update user engagement
        incrementUserEngagement();
    }
}

function toggleGoalCompletion(goalId) {
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if(goalIndex !== -1) {
        const goal = goals[goalIndex];
        goal.completed = !goal.completed;
        
        // Add completion timestamp if completed
        if(goal.completed) {
            goal.completedAt = new Date().toISOString();
            addActionToHistory('completed', goal.text);
        } else {
            delete goal.completedAt;
            addActionToHistory('reopened', goal.text);
        }
        
        // Save and refresh
        saveGoals();
        refreshGoalsUI();
        updateProgressUI();
        
        // Update user engagement
        if(goal.completed) {
            incrementUserEngagement(10); // Extra points for completing a goal
        }
    }
}

function deleteGoal(goalId) {
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if(goalIndex !== -1) {
        const goalText = goals[goalIndex].text;
        
        // Remove goal
        goals.splice(goalIndex, 1);
        
        // Save and refresh
        saveGoals();
        refreshGoalsUI();
        
        // Add to action history
        addActionToHistory('deleted', goalText);
    }
}

function refreshGoalsUI() {
    const goalsList = document.querySelector('.goals-list');
    
    if(!goalsList) return;
    
    // Clear current list
    goalsList.innerHTML = '';
    
    // Show empty state if no goals
    if(goals.length === 0) {
        goalsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>You haven't added any goals yet.</p>
                <p>Add your first goal below to get started!</p>
            </div>
        `;
        return;
    }
    
    // Add each goal
    goals.forEach(goal => {
        const goalItem = document.createElement('div');
        goalItem.className = `goal-item ${goal.completed ? 'completed' : ''}`;
        goalItem.dataset.id = goal.id;
        
        goalItem.innerHTML = `
            <div class="goal-checkbox ${goal.completed ? 'checked' : ''}" onclick="toggleGoalCompletion('${goal.id}')">
                ${goal.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <span class="goal-text">${goal.text}</span>
            <div class="goal-actions">
                <button class="goal-action-btn delete" onclick="deleteGoal('${goal.id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        goalsList.appendChild(goalItem);
    });
}

// Progress Functions
function updateProgressUI() {
    if(!document.getElementById('progress-section')) return;
    
    // Calculate statistics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.completed).length;
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Update total goals stat
    const totalGoalsElement = document.getElementById('total-goals');
    if(totalGoalsElement) {
        totalGoalsElement.textContent = totalGoals;
    }
    
    // Update completed goals stat
    const completedGoalsElement = document.getElementById('completed-goals');
    if(completedGoalsElement) {
        completedGoalsElement.textContent = completedGoals;
    }
    
    // Update percentage
    const completionPercentElement = document.getElementById('completion-percent');
    if(completionPercentElement) {
        completionPercentElement.textContent = `${completionPercentage}%`;
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if(progressFill) {
        progressFill.style.width = `${completionPercentage}%`;
    }
    
    // Update circular progress
    const circularProgress = document.querySelector('.circular-progress');
    if(circularProgress) {
        circularProgress.style.setProperty('--end-progress', `${completionPercentage}%`);
    }
    
    // Update action history display
    refreshActionHistory();
}

// Action History Functions
function loadActionHistory() {
    const storedHistory = localStorage.getItem('actionHistory');
    
    if(storedHistory) {
        try {
            actionHistory = JSON.parse(storedHistory);
        } catch(e) {
            console.error('Error parsing action history:', e);
            actionHistory = [];
        }
    } else {
        // Initialize with empty array
        actionHistory = [];
        saveActionHistory();
    }
}

function saveActionHistory() {
    // Keep only the last 20 actions
    if(actionHistory.length > 20) {
        actionHistory = actionHistory.slice(0, 20);
    }
    
    localStorage.setItem('actionHistory', JSON.stringify(actionHistory));
}

function addActionToHistory(action, goalText) {
    // Create new action
    const newAction = {
        type: action, 
        goal: goalText,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    actionHistory.unshift(newAction);
    
    // Save and refresh
    saveActionHistory();
    refreshActionHistory();
}

function refreshActionHistory() {
    const historyContainer = document.querySelector('.action-history-items');
    
    if(!historyContainer) return;
    
    // Clear current list
    historyContainer.innerHTML = '';
    
    // Show message if no history
    if(actionHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state small">
                <p>No recent activity to display.</p>
            </div>
        `;
        return;
    }
    
    // Add each action (max 5)
    const actionsToShow = actionHistory.slice(0, 5);
    
    actionsToShow.forEach(action => {
        const actionItem = document.createElement('div');
        actionItem.className = 'action-history-item';
        
        // Determine icon based on action type
        let icon = '';
        let actionText = '';
        
        switch(action.type) {
            case 'added':
                icon = 'fa-plus';
                actionText = `Added goal: "${action.goal}"`;
                break;
            case 'completed':
                icon = 'fa-check';
                actionText = `Completed: "${action.goal}"`;
                break;
            case 'reopened':
                icon = 'fa-redo';
                actionText = `Reopened: "${action.goal}"`;
                break;
            case 'deleted':
                icon = 'fa-trash-alt';
                actionText = `Deleted: "${action.goal}"`;
                break;
            default:
                icon = 'fa-circle';
                actionText = `Updated: "${action.goal}"`;
        }
        
        // Format timestamp to relative time
        const timeAgo = getRelativeTimeString(new Date(action.timestamp));
        
        actionItem.innerHTML = `
            <div class="action-history-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="action-history-text">${actionText}</div>
            <div class="action-history-time">${timeAgo}</div>
        `;
        
        historyContainer.appendChild(actionItem);
    });
}

// Utility Functions
function generateID() {
    return Math.random().toString(36).substr(2, 9);
}

function getRelativeTimeString(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if(diffInSeconds < 60) {
        return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if(diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if(diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if(diffInDays < 30) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date for older items
    return date.toLocaleDateString();
}

// Add these functions to window object so they can be called from inline event handlers
window.toggleGoalCompletion = toggleGoalCompletion;
window.deleteGoal = deleteGoal;
window.addNewGoal = addNewGoal;