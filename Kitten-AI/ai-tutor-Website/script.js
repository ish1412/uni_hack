document.addEventListener('DOMContentLoaded', function() {
  // Menu toggle functionality
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }

  // Chat functionality
  const chatHistory = document.getElementById('chat-history');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-btn');
  
  // Track user state
  let userState = {
    studyStreak: 0,
    points: 0,
    level: 'Beginner'
  };
  
  // Function to add a message to the chat
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    const img = document.createElement('img');
    img.src = isUser ? 'images/user_avatar.svg' : 'images/ai_avatar.svg';
    img.alt = isUser ? 'User' : 'AI';
    avatarDiv.appendChild(img);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const text = document.createElement('p');
    text.textContent = content;
    contentDiv.appendChild(text);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatHistory.appendChild(messageDiv);
    
    // Scroll to the bottom of the chat
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
  
  // Function to send user message to the backend
  async function sendMessage(message) {
    try {
      // Add user message to chat
      addMessage(message, true);
      
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'message ai-message typing';
      typingIndicator.innerHTML = `
        <div class="message-avatar">
          <img src="images/ai_avatar.svg" alt="AI">
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
      chatHistory.appendChild(typingIndicator);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          userId: 'user-' + Date.now(), // Replace with actual user ID if available
          userState: userState
        })
      });
      
      // Remove typing indicator
      chatHistory.removeChild(typingIndicator);
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      addMessage(data.message);
      
      // Check for potential user state updates in the AI response
      checkForStateUpdates(data.message);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error. Please try again later.');
    }
  }
  
  // Check AI message for potential state updates (points, streak, etc.)
  function checkForStateUpdates(message) {
    // This is a simple example - you might want a more sophisticated approach
    if (message.includes('points added') || message.includes('earned points')) {
      // Extract points from message or add predefined amount
      userState.points += 10;
      updateUserInterface();
    }
    
    if (message.includes('streak increased') || message.includes('daily goal completed')) {
      userState.studyStreak += 1;
      updateUserInterface();
    }
    
    // Check for level ups
    if (userState.points >= 100 && userState.level === 'Beginner') {
      userState.level = 'Intermediate';
      updateUserInterface();
      addMessage("Congratulations! You've reached the Intermediate level!");
    }
  }
  
  // Update the UI with new user state
  function updateUserInterface() {
    const streakEl = document.getElementById('Study streak');
    const pointsEl = document.getElementById('points');
    const levelEl = document.getElementById('level');
    
    if (streakEl) streakEl.textContent = userState.studyStreak + ' days';
    if (pointsEl) pointsEl.textContent = userState.points;
    if (levelEl) levelEl.textContent = userState.level;
    
    // Save to localStorage or your backend
    localStorage.setItem('kittenAI_userState', JSON.stringify(userState));
  }
  
  // Load user state from storage
  function loadUserState() {
    const savedState = localStorage.getItem('kittenAI_userState');
    if (savedState) {
      userState = JSON.parse(savedState);
      updateUserInterface();
    }
  }
  
  // Initialize
  loadUserState();
  
  // Event listeners
  if (sendButton && userInput) {
    sendButton.addEventListener('click', function() {
      const message = userInput.value.trim();
      if (message) {
        sendMessage(message);
        userInput.value = '';
      }
    });
    
    userInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const message = userInput.value.trim();
        if (message) {
          sendMessage(message);
          userInput.value = '';
        }
      }
    });
  }
});