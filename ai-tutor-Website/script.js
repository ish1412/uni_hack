// Select the necessary elements
const personalityButtons = document.querySelectorAll('.personality-btn');
const taskList = document.querySelector('#task-list');
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskProgress = document.querySelector('#task-progress');

// Store the user's selected AI personality
let selectedPersonality = 'friendly';

// Function to update the AI personality
function updatePersonality(personality) {
    selectedPersonality = personality;
    alert(`AI Personality set to: ${personality}`);
}

// Add event listeners to personality buttons
personalityButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const personality = e.target.getAttribute('data-personality');
        updatePersonality(personality);
    });
});

// Function to create a task and append it to the task list
function addTask(taskText) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    taskItem.textContent = taskText;
    taskList.appendChild(taskItem);
}

// Handle task form submission
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
        updateProgress();
    }
});

// Function to update task progress (e.g., for gamification)
function updateProgress() {
    const tasks = taskList.querySelectorAll('.task-item');
    const progress = Math.round((tasks.length / 10) * 100); // 10 tasks to reach 100%
    taskProgress.textContent = `Task Progress: ${progress}%`;
}
