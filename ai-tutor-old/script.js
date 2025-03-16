// Select all necessary elements
const personalityButtons = document.querySelectorAll('.personality-btn');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const contentSections = document.querySelectorAll('.content-section');

// Store the user's selected AI personality
let selectedPersonality = 'friendly';

// Your Gemini API key - this should be handled securely in production
// In a production environment, this should be managed server-side
let geminiApiKey = 'AIzaSyCR4mgi5FgyHeIcRthwSlzdIDOoA44p9E0';

// Anime characters for leaderboard
const animeCharacters = [
    { name: "Sasuke Uchiha", points: 750, avatar: "🥷" },
    { name: "Itachi Uchiha", points: 680, avatar: "👹" },
    { name: "Naruto Uzumaki", points: 620, avatar: "🦊" },
    { name: "Kakashi Hatake", points: 550, avatar: "📚" },
    { name: "Sakura Haruno", points: 480, avatar: "🌸" },
    { name: "Hinata Hyuga", points: 410, avatar: "👀" },
    { name: "Shikamaru Nara", points: 340, avatar: "🧠" },
    { name: "Rock Lee", points: 270, avatar: "🥋" },
    { name: "Gaara", points: 200, avatar: "🏜️" },
    { name: "Tsunade", points: 130, avatar: "👩‍⚕️" }
];

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

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Function to increment user stats (gamification feature) - MODIFIED
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
    
    // Update level based on points - New tier system
    let level = 'Iron';
    if (points >= 1000) level = 'Radiant';
    else if (points >= 800) level = 'Immortal';
    else if (points >= 600) level = 'Ascendant';
    else if (points >= 400) level = 'Diamond';
    else if (points >= 300) level = 'Platinum';
    else if (points >= 200) level = 'Gold';
    else if (points >= 100) level = 'Bronze';
    
    // Update UI
    streakEl.textContent = `${streak} days`;
    pointsEl.textContent = points;
    levelEl.textContent = level;
    
    // Update leaderboard position
    updateLeaderboard(points);
  }
}

// NEW FUNCTIONS FOR GOALS, JOURNAL, PROGRESS, AND LEADERBOARD FEATURES

// Goals management
let goals = JSON.parse(localStorage.getItem('userGoals') || '[]');

// Function to add a new goal
function addGoal(title, description, dueDate, category) {
  const newGoal = {
    id: Date.now(),
    title,
    description,
    category,
    dueDate,
    progress: 0,
    created: new Date().toISOString(),
    completed: false
  };
  
  goals.push(newGoal);
  saveGoals();
  renderGoals();
  updateProgressView();
}

// Function to update goal progress
function updateGoalProgress(goalId, progress) {
  const goalIndex = goals.findIndex(g => g.id === parseInt(goalId));
  if (goalIndex !== -1) {
    goals[goalIndex].progress = progress;
    if (progress >= 100) {
      goals[goalIndex].completed = true;
      // Add bonus points for completing a goal
      const userPoints = parseInt(localStorage.getItem('userPoints') || '0');
      localStorage.setItem('userPoints', userPoints + 50);
      updateUserStats();
    }
    saveGoals();
    renderGoals();
    updateProgressView();
  }
}

// Function to delete a goal
function deleteGoal(goalId) {
  goals = goals.filter(g => g.id !== parseInt(goalId));
  saveGoals();
  renderGoals();
  updateProgressView();
}

// Function to save goals to localStorage
function saveGoals() {
  localStorage.setItem('userGoals', JSON.stringify(goals));
}

// Function to render all goals
function renderGoals() {
  const goalsContainer = document.getElementById('goals-container');
  if (!goalsContainer) return;
  
  // Clear the content-body div inside goals-container
  const contentBody = goalsContainer.querySelector('.content-body');
  if (!contentBody) return;
  
  contentBody.innerHTML = '';
  
  if (goals.length === 0) {
    contentBody.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tasks"></i>
        <p>You haven't created any goals yet. Click "Add Goal" to get started!</p>
      </div>
    `;
    return;
  }
  
  goals.forEach(goal => {
    const dueDate = new Date(goal.dueDate).toLocaleDateString();
    const goalEl = document.createElement('div');
    goalEl.classList.add('goal-item');
    if (goal.completed) {
      goalEl.classList.add('completed');
    }
    
    goalEl.innerHTML = `
      <div class="goal-header">
        <h3>${goal.title}</h3>
        <div class="goal-actions">
          <button class="goal-edit-btn" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
          <button class="goal-delete-btn" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <p>${goal.description}</p>
      <div class="goal-meta">
        <span class="goal-category">${goal.category}</span>
        <span class="goal-due">Due: ${dueDate}</span>
      </div>
      <div class="goal-progress-container">
        <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
      </div>
      <div class="goal-progress-input">
        <label for="progress-${goal.id}">Update progress:</label>
        <input type="range" id="progress-${goal.id}" min="0" max="100" value="${goal.progress}" data-id="${goal.id}">
        <span>${goal.progress}%</span>
      </div>
    `;
    
    contentBody.appendChild(goalEl);
    
    // Add event listeners to the new elements
    const progressInput = goalEl.querySelector(`#progress-${goal.id}`);
    progressInput.addEventListener('input', (e) => {
      const progress = parseInt(e.target.value);
      const goalId = e.target.getAttribute('data-id');
      e.target.nextElementSibling.textContent = `${progress}%`;
      goalEl.querySelector('.goal-progress-bar').style.width = `${progress}%`;
    });
    
    progressInput.addEventListener('change', (e) => {
      const progress = parseInt(e.target.value);
      const goalId = e.target.getAttribute('data-id');
      updateGoalProgress(goalId, progress);
    });
    
    goalEl.querySelector('.goal-delete-btn').addEventListener('click', (e) => {
      const goalId = e.target.closest('.goal-delete-btn').getAttribute('data-id');
      deleteGoal(goalId);
    });

    // Edit goal button event listener
    goalEl.querySelector('.goal-edit-btn').addEventListener('click', (e) => {
      const goalId = e.target.closest('.goal-edit-btn').getAttribute('data-id');
      const goal = goals.find(g => g.id === parseInt(goalId));
      if (goal) {
        document.getElementById('edit-goal-id').value = goal.id;
        document.getElementById('edit-goal-title').value = goal.title;
        document.getElementById('edit-goal-description').value = goal.description;
        document.getElementById('edit-goal-category').value = goal.category;
        document.getElementById('edit-goal-date').value = new Date(goal.dueDate).toISOString().split('T')[0];
        
        // Show edit modal
        document.getElementById('edit-goal-modal').classList.add('show');
      }
    });
  });
}

// Function to handle goal form submission
function handleGoalFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('goal-title').value;
  const description = document.getElementById('goal-description').value;
  const category = document.getElementById('goal-category').value;
  const dueDate = document.getElementById('goal-date').value;
  
  if (title && dueDate) {
    addGoal(title, description, dueDate, category);
    // Reset form
    document.getElementById('goal-form').reset();
    // Hide modal
    document.getElementById('goal-modal').classList.remove('show');
    // Show success notification
    showNotification('Goal added successfully!', 'success');
  }
}

// Function to handle goal edit form submission
function handleGoalEditFormSubmit(e) {
  e.preventDefault();
  
  const goalId = parseInt(document.getElementById('edit-goal-id').value);
  const title = document.getElementById('edit-goal-title').value;
  const description = document.getElementById('edit-goal-description').value;
  const category = document.getElementById('edit-goal-category').value;
  const dueDate = document.getElementById('edit-goal-date').value;
  
  const goalIndex = goals.findIndex(g => g.id === goalId);
  if (goalIndex !== -1 && title && dueDate) {
    goals[goalIndex].title = title;
    goals[goalIndex].description = description;
    goals[goalIndex].category = category;
    goals[goalIndex].dueDate = dueDate;
    
    saveGoals();
    renderGoals();
    updateProgressView();
    
    // Hide edit modal
    document.getElementById('edit-goal-modal').classList.remove('show');
    // Show success notification
    showNotification('Goal updated successfully!', 'success');
  }
}

// Progress View
function updateProgressView() {
  const progressContainer = document.getElementById('progress-container');
  if (!progressContainer) return;
  
  // Clear the content-body div inside progress-container
  const contentBody = progressContainer.querySelector('.content-body');
  if (!contentBody) return;
  
  contentBody.innerHTML = '';
  
  if (goals.length === 0) {
    contentBody.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-bar"></i>
        <p>No goals to track yet. Add some goals to see your progress!</p>
      </div>
    `;
    return;
  }
  
  // Create progress summary
  const summary = document.createElement('div');
  summary.classList.add('progress-summary');
  
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const averageProgress = goals.reduce((acc, goal) => acc + goal.progress, 0) / totalGoals;
  
  summary.innerHTML = `
    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-value">${completedGoals}/${totalGoals}</span>
        <span class="stat-label">Goals Completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${averageProgress.toFixed(0)}%</span>
        <span class="stat-label">Average Progress</span>
      </div>
    </div>
  `;
  
  contentBody.appendChild(summary);
  
  // Create progress bars for each goal
  const progressBars = document.createElement('div');
  progressBars.classList.add('progress-bars');
  
  goals.forEach(goal => {
    const progressItem = document.createElement('div');
    progressItem.classList.add('progress-item');
    
    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-ok';
    if (daysLeft < 0) {
      statusClass = 'status-overdue';
    } else if (daysLeft < 3) {
      statusClass = 'status-urgent';
    }
    
    progressItem.innerHTML = `
      <div class="progress-header">
        <h3>${goal.title}</h3>
        <span class="progress-percent">${goal.progress}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${goal.progress}%"></div>
      </div>
      <div class="progress-meta">
        <span class="progress-category">${goal.category}</span>
        <span class="progress-due ${statusClass}">
          ${daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
        </span>
      </div>
    `;
    
    progressBars.appendChild(progressItem);
  });
  
  contentBody.appendChild(progressBars);
}

// Journal Management
let journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');

// Function to add a new journal entry
function addJournalEntry(title, content) {
  const newEntry = {
    id: Date.now(),
    title,
    content,
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  
  journalEntries.push(newEntry);
  saveJournalEntries();
  renderJournalList();
  return newEntry.id;
}

// Function to update a journal entry
function updateJournalEntry(id, title, content) {
  const entryIndex = journalEntries.findIndex(e => e.id === parseInt(id));
  if (entryIndex !== -1) {
    journalEntries[entryIndex].title = title;
    journalEntries[entryIndex].content = content;
    journalEntries[entryIndex].updated = new Date().toISOString();
    saveJournalEntries();
    renderJournalList();
  }
}

// Function to delete a journal entry
function deleteJournalEntry(id) {
  journalEntries = journalEntries.filter(e => e.id !== parseInt(id));
  saveJournalEntries();
  renderJournalList();
}

// Function to save journal entries to localStorage
function saveJournalEntries() {
  localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
}

// Function to render journal entries list
function renderJournalList() {
  const journalList = document.getElementById('journal-list');
  if (!journalList) return;
  
  journalList.innerHTML = '';
  
  if (journalEntries.length === 0) {
    journalList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <p>No journal entries yet. Click the "New Entry" button to start writing!</p>
      </div>
    `;
    return;
  }
  
  // Sort entries by updated date (newest first)
  const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.updated) - new Date(a.updated));
  
  sortedEntries.forEach(entry => {
    const date = new Date(entry.updated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const entryItem = document.createElement('div');
    entryItem.classList.add('journal-item');
    entryItem.setAttribute('data-id', entry.id);
    
    entryItem.innerHTML = `
      <div class="journal-item-title">${entry.title}</div>
      <div class="journal-item-date">${date}</div>
    `;
    
    entryItem.addEventListener('click', () => {
      document.querySelectorAll('.journal-item').forEach(item => item.classList.remove('active'));
      entryItem.classList.add('active');
      
      // Load entry into editor
      document.getElementById('journal-title').value = entry.title;
      document.getElementById('journal-content').value = entry.content;
      document.getElementById('current-journal-id').value = entry.id;
      
      // Enable delete button
      document.getElementById('delete-journal-btn').disabled = false;
    });
    
    journalList.appendChild(entryItem);
  });
}

// Function to handle creating a new journal entry
function handleNewJournalEntry() {
  // Clear editor
  document.getElementById('journal-title').value = '';
  document.getElementById('journal-content').value = '';
  document.getElementById('current-journal-id').value = '';
  
  // Disable delete button for new entries
  document.getElementById('delete-journal-btn').disabled = true;
  
  // Remove active class from all entries
  document.querySelectorAll('.journal-item').forEach(item => item.classList.remove('active'));
}

// Function to handle saving a journal entry
function handleSaveJournalEntry() {
  const title = document.getElementById('journal-title').value.trim() || 'Untitled Entry';
  const content = document.getElementById('journal-content').value;
  const currentId = document.getElementById('current-journal-id').value;
  
  if (currentId) {
    // Update existing entry
    updateJournalEntry(currentId, title, content);
  } else {
    // Create new entry
    const newId = addJournalEntry(title, content);
    document.getElementById('current-journal-id').value = newId;
    
    // Enable delete button
    document.getElementById('delete-journal-btn').disabled = false;
  }
  
  // Show success notification
  showNotification('Journal entry saved!', 'success');
}

// Function to handle deleting a journal entry
function handleDeleteJournalEntry() {
  const currentId = document.getElementById('current-journal-id').value;
  
  if (currentId && confirm('Are you sure you want to delete this journal entry?')) {
    deleteJournalEntry(currentId);
    handleNewJournalEntry();
    
    // Show notification
    showNotification('Journal entry deleted!', 'info');
  }
}

// Leaderboard
function updateLeaderboard(userPoints) {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (!leaderboardContainer) return;
  
  // Clear the content-body div inside leaderboard-container
  const contentBody = leaderboardContainer.querySelector('.content-body');
  if (!contentBody) return;
  
  contentBody.innerHTML = '';
  
  // Clone the anime characters array
  const leaderboard = [...animeCharacters];
  
  // Add user to leaderboard
  leaderboard.push({
    name: 'You',
    points: userPoints,
    avatar: '👤',
    isUser: true
  });
  
  // Sort by points (descending)
  leaderboard.sort((a, b) => b.points - a.points);
  
  // Render leaderboard
  leaderboard.forEach((character, index) => {
    const rank = index + 1;
    let trophy = '';
    
    if (rank === 1) trophy = '🏆';
    else if (rank === 2) trophy = '🥈';
    else if (rank === 3) trophy = '🥉';
    
    const leaderboardItem = document.createElement('div');
    leaderboardItem.classList.add('leaderboard-item');
    if (character.isUser) {
      leaderboardItem.classList.add('user-item');
    }
    
    leaderboardItem.innerHTML = `
      <div class="rank">${rank} ${trophy}</div>
      <div class="character-avatar">${character.avatar}</div>
      <div class="character-name">${character.name}</div>
      <div class="character-points">${character.points} pts</div>
    `;
    
    contentBody.appendChild(leaderboardItem);
  });
  
  // Find user rank
  const userRank = leaderboard.findIndex(char => char.isUser) + 1;
  
  // Update rank display
  const userRankDisplay = document.getElementById('user-rank');
  if (userRankDisplay) {
    const rankText = getRankText(userRank);
    userRankDisplay.textContent = rankText;
  }
}

// Function to get rank text
function getRankText(rank) {
  if (rank === 1) return 'You are #1! 🏆';
  else if (rank === 2) return 'You are #2! 🥈';
  else if (rank === 3) return 'You are #3! 🥉';
  else return `You are #${rank}`;
}

// Function to toggle sidebar items and content
function toggleSidebarContent() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const contentContainers = document.querySelectorAll('.content-container');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isLocked = item.classList.contains('locked');
      if (isLocked) {
        showNotification('This feature will be unlocked soon!', 'info');
        return;
      }
      
      // Remove active class from all items
      sidebarItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Hide all content containers
      contentContainers.forEach(container => {
        container.style.display = 'none';
      });
      
      // Show selected content container
      const target = item.getAttribute('data-target');
      const targetContainer = document.getElementById(target);
      if (targetContainer) {
        targetContainer.style.display = 'block';
      }
    });
  });
}

// Function to initialize the application
function initApp() {
  // Check for API key
  checkForApiKey();
  
  // Initialize content toggle
  toggleSidebarContent();
  
  // Initialize leaderboard
  updateUserStats();
  
  // Initialize goals
  renderGoals();
  
  // Initialize progress view
  updateProgressView();
  
  // Initialize journal
  renderJournalList();
  
  // Attach event listeners for forms
  const goalForm = document.getElementById('goal-form');
  if (goalForm) {
    goalForm.addEventListener('submit', handleGoalFormSubmit);
  }
  
  const editGoalForm = document.getElementById('edit-goal-form');
  if (editGoalForm) {
    editGoalForm.addEventListener('submit', handleGoalEditFormSubmit);
  }
  
  // Add button event listeners
  const newGoalBtn = document.getElementById('new-goal-btn');
  if (newGoalBtn) {
    newGoalBtn.addEventListener('click', () => {
      document.getElementById('goal-modal').classList.add('show');
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
      });
    });
  });
  
  // Journal buttons
  const newJournalBtn = document.getElementById('new-journal-btn');
  if (newJournalBtn) {
    newJournalBtn.addEventListener('click', handleNewJournalEntry);
  }
  
  const saveJournalBtn = document.getElementById('save-journal-btn');
  if (saveJournalBtn) {
    saveJournalBtn.addEventListener('click', handleSaveJournalEntry);
  }
  
  const deleteJournalBtn = document.getElementById('delete-journal-btn');
  if (deleteJournalBtn) {
    deleteJournalBtn.addEventListener('click', handleDeleteJournalEntry);
  }
  
  // Unlock sidebar items that are implemented
  const goalsItem = document.querySelector('.sidebar-item[data-target="goals-container"]');
  if (goalsItem) {
    goalsItem.classList.remove('locked');
  }
  
  const progressItem = document.querySelector('.sidebar-item[data-target="progress-container"]');
  if (progressItem) {
    progressItem.classList.remove('locked');
  }
  
  const journalItem = document.querySelector('.sidebar-item[data-target="journal-container"]');
  if (journalItem) {
    journalItem.classList.remove('locked');
  }
  
  const leaderboardItem = document.querySelector('.sidebar-item[data-target="leaderboard-container"]');
  if (leaderboardItem) {
    leaderboardItem.classList.remove('locked');
  }
  
  // Settings item remains locked for now
}

// Function to update user stats
function updateUserStats() {
  const streak = parseInt(localStorage.getItem('userStreak') || '0');
  const points = parseInt(localStorage.getItem('userPoints') || '0');
  
  const streakEl = document.getElementById('streak');
  const pointsEl = document.getElementById('points');
  const levelEl = document.getElementById('level');
  
  if (streakEl && pointsEl && levelEl) {
    // Update level based on points - New tier system
    let level = 'Iron';
    if (points >= 1000) level = 'Radiant';
    else if (points >= 800) level = 'Immortal';
    else if (points >= 600) level = 'Ascendant';
    else if (points >= 400) level = 'Diamond';
    else if (points >= 300) level = 'Platinum';
    else if (points >= 200) level = 'Gold';
    else if (points >= 100) level = 'Bronze';
    
    // Update UI
    streakEl.textContent = `${streak} days`;
    pointsEl.textContent = points;
    levelEl.textContent = level;
    
    // Update leaderboard
    updateLeaderboard(points);
  }
}

// Function to show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    </div>
    <div class="notification-message">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);}