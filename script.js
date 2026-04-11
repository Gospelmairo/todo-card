const dueDateElement = document.getElementById('due-date');
const timeRemainingElement = document.getElementById('time-remaining');
const statusBadge = document.querySelector('[data-testid="test-todo-status"]');
const titleElement = document.querySelector('[data-testid="test-todo-title"]');
const completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');

const dueDate = new Date("2026-06-01T18:00:00Z");

dueDateElement.dateTime = dueDate.toISOString();
dueDateElement.textContent = 'Due ' + dueDate.toLocaleDateString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

function formatTimeRemaining(target) {
  const now = new Date();
  const difference = target - now;
  const absMs = Math.abs(difference);
  const minutes = Math.floor(absMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (Math.abs(difference) < 60000) {
    return 'Due now!';
  }

  if (difference > 0) {
    if (days >= 2) return `Due in ${days} days`;
    if (days === 1) return 'Due tomorrow';
    if (hours >= 1) return `Due in ${hours} hours`;
    return `Due in ${minutes} minutes`;
  }

  // difference < 0 means overdue (abs values are used for magnitude)
  if (days >= 1) return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
  if (hours >= 1) return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
  return `Overdue by ${minutes} minutes`;
}

function updateTimeRemaining() {
  timeRemainingElement.textContent = formatTimeRemaining(dueDate);
}

function updateCompletedState() {
  const completed = completeToggle.checked;
  titleElement.classList.toggle('completed', completed);
  statusBadge.textContent = completed ? 'Done' : 'Pending';
  statusBadge.setAttribute('aria-label', completed ? 'Status done' : 'Status pending');
}

completeToggle.addEventListener('change', updateCompletedState);

const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');

editButton.addEventListener('click', () => {
  const newTitle = prompt("Edit title", titleElement.textContent);
  if (newTitle && newTitle.trim()) {
    titleElement.textContent = newTitle.trim();
  }
});

deleteButton.addEventListener('click', () => {
  if (confirm("Delete this task?")) {
    document.querySelector('[data-testid="test-todo-card"]').style.display = 'none';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  updateTimeRemaining();
  updateCompletedState();
  setInterval(updateTimeRemaining, 60000);
});
