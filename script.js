// ── Elements ────────────────────────────────────────────────
const card           = document.querySelector('[data-testid="test-todo-card"]');
const titleEl        = document.querySelector('[data-testid="test-todo-title"]');
const descriptionEl  = document.querySelector('[data-testid="test-todo-description"]');
const priorityBadge  = document.querySelector('[data-testid="test-todo-priority"]');
const statusBadge    = document.querySelector('[data-testid="test-todo-status"]');
const dueDateEl      = document.getElementById('due-date');
const timeRemainingEl= document.getElementById('time-remaining');
const toggle         = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editBtn        = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteBtn      = document.querySelector('[data-testid="test-todo-delete-button"]');

// ── Due date ─────────────────────────────────────────────────
const dueDate = new Date('2026-06-01T18:00:00Z');

dueDateEl.dateTime   = dueDate.toISOString();
dueDateEl.textContent = 'Due ' + dueDate.toLocaleDateString('en-US', {
  month: 'short', day: '2-digit', year: 'numeric',
});

// ── Time remaining ───────────────────────────────────────────
function formatTimeRemaining(target) {
  const diff   = target - Date.now();
  const absMs  = Math.abs(diff);
  const mins   = Math.floor(absMs / 60_000);
  const hours  = Math.floor(mins  / 60);
  const days   = Math.floor(hours / 24);

  if (absMs < 60_000) return 'Due now!';

  if (diff > 0) {
    if (days >= 2)   return `Due in ${days} days`;
    if (days === 1)  return 'Due tomorrow';
    if (hours >= 1)  return `Due in ${hours} hour${hours === 1 ? '' : 's'}`;
    return `Due in ${mins} minutes`;
  }

  // overdue
  if (days >= 1)   return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
  if (hours >= 1)  return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
  return `Overdue by ${mins} minutes`;
}

function updateTimeRemaining() {
  const text    = formatTimeRemaining(dueDate);
  const overdue = dueDate - Date.now() < 0;
  timeRemainingEl.textContent = text;
  timeRemainingEl.classList.toggle('overdue', overdue);
}

// ── Priority cycling ─────────────────────────────────────────
const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_CLASSES = { Low: 'badge--low', Medium: 'badge--medium', High: 'badge--high' };
let currentPriority = 'High';

function applyPriority(value) {
  currentPriority = value;
  priorityBadge.textContent = value;
  priorityBadge.setAttribute('aria-label', `${value} priority`);
  priorityBadge.classList.remove('badge--low', 'badge--medium', 'badge--high');
  priorityBadge.classList.add(PRIORITY_CLASSES[value]);
}

function cyclePriority() {
  const next = PRIORITIES[(PRIORITIES.indexOf(currentPriority) + 1) % PRIORITIES.length];
  applyPriority(next);
}

priorityBadge.addEventListener('click', cyclePriority);
priorityBadge.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cyclePriority(); }
});

// ── Completion toggle ────────────────────────────────────────
function applyCompletedState() {
  const done = toggle.checked;
  card.classList.toggle('is-done', done);

  statusBadge.textContent = done ? 'Done' : 'In Progress';
  statusBadge.setAttribute('aria-label', done ? 'Status: Done' : 'Status: In Progress');
  statusBadge.classList.toggle('is-done', done);
}

toggle.addEventListener('change', applyCompletedState);

// ── Edit button ──────────────────────────────────────────────
editBtn.addEventListener('click', () => {
  const newTitle = prompt('Edit task title:', titleEl.textContent.trim());
  if (newTitle && newTitle.trim()) {
    titleEl.textContent = newTitle.trim();
  }
});

// ── Delete button ────────────────────────────────────────────
deleteBtn.addEventListener('click', () => {
  if (confirm('Delete this task?')) {
    card.style.display = 'none';
  }
});

// ── Tag toggle ───────────────────────────────────────────────
document.querySelectorAll('.todo-card__tags .tag').forEach(tag => {
  tag.setAttribute('tabindex', '0');
  tag.setAttribute('role', 'button');
  tag.setAttribute('aria-pressed', 'true');

  function toggleTag() {
    const off = tag.classList.toggle('is-off');
    tag.setAttribute('aria-pressed', String(!off));
  }

  tag.addEventListener('click', toggleTag);
  tag.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTag(); }
  });
});

// ── Init ─────────────────────────────────────────────────────
applyPriority('High');
applyCompletedState();
updateTimeRemaining();
setInterval(updateTimeRemaining, 60_000);
