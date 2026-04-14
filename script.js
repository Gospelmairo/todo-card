// ── State ─────────────────────────────────────────────────────
const state = {
  title:       'Design landing page content',
  description: 'Write a polished, accessible hero section for the new project launch and prepare all assets for the design review meeting.',
  priority:    'High',
  status:      'In Progress',
  dueDate:     new Date('2026-06-01T18:00:00'),
  isExpanded:  false,
  isEditMode:  false,
  timerId:     null,
};

// Snapshot before entering edit mode (for cancel)
let snapshot = null;

// Description length that triggers collapse
const COLLAPSE_THRESHOLD = 100;

// ── DOM refs ──────────────────────────────────────────────────
const card             = document.querySelector('[data-testid="test-todo-card"]');
const viewEl           = document.querySelector('.todo-card__view');
const editFormEl       = document.querySelector('[data-testid="test-todo-edit-form"]');

const titleEl          = document.querySelector('[data-testid="test-todo-title"]');
const descriptionEl    = document.querySelector('[data-testid="test-todo-description"]');
const priorityBadge    = document.querySelector('[data-testid="test-todo-priority"]');
const statusBadge      = document.querySelector('[data-testid="test-todo-status"]');
const dueDateEl        = document.getElementById('due-date');
const timeRemainingEl  = document.getElementById('time-remaining');
const overdueIndicator = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
const boardLabel       = document.getElementById('board-label');

const toggle           = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const statusControl    = document.querySelector('[data-testid="test-todo-status-control"]');
const expandToggle     = document.querySelector('[data-testid="test-todo-expand-toggle"]');
const expandLabel      = expandToggle.querySelector('.expand-toggle__label');
const collapsibleEl    = document.querySelector('[data-testid="test-todo-collapsible-section"]');
const editBtn          = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteBtn        = document.querySelector('[data-testid="test-todo-delete-button"]');

const editTitleInput       = document.querySelector('[data-testid="test-todo-edit-title-input"]');
const editDescInput        = document.querySelector('[data-testid="test-todo-edit-description-input"]');
const editPrioritySelect   = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
const editDueDateInput     = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
const saveBtn              = document.querySelector('[data-testid="test-todo-save-button"]');
const cancelBtn            = document.querySelector('[data-testid="test-todo-cancel-button"]');

// ── Helpers ───────────────────────────────────────────────────
function toSlug(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function toInputDate(date) {
  // Returns YYYY-MM-DD from a Date object
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date) {
  return 'Due ' + date.toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function formatTimeRemaining(target, isDone) {
  if (isDone) return 'Completed';

  const diff  = target - Date.now();
  const absMs = Math.abs(diff);
  const mins  = Math.floor(absMs / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (absMs < 60_000) return diff > 0 ? 'Due now!' : 'Overdue by less than a minute';

  if (diff > 0) {
    if (days >= 2)  return `Due in ${days} days`;
    if (days === 1) return 'Due tomorrow';
    if (hours >= 1) return `Due in ${hours} hour${hours === 1 ? '' : 's'}`;
    return `Due in ${mins} minute${mins === 1 ? '' : 's'}`;
  }

  // Overdue
  if (days >= 1)  return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
  if (hours >= 1) return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
  return `Overdue by ${mins} minute${mins === 1 ? '' : 's'}`;
}

// ── Render helpers ────────────────────────────────────────────
function renderPriority(priority) {
  // Card data attribute (drives top strip + CSS selectors)
  card.dataset.priority = priority.toLowerCase();

  // Priority badge text and class
  priorityBadge.textContent = priority;
  priorityBadge.setAttribute('aria-label', `${priority} priority`);
  priorityBadge.className = `badge badge--priority badge--${priority.toLowerCase()}`;
}

function renderStatus(status) {
  const slug = toSlug(status);

  // Card data attribute
  card.dataset.status = slug;

  // Status badge
  statusBadge.textContent = status;
  statusBadge.setAttribute('aria-label', `Status: ${status}`);
  statusBadge.className = `badge badge--status status--${slug}`;

  // Checkbox sync
  const isDone = status === 'Done';
  toggle.checked = isDone;

  // Status control sync
  statusControl.value = status;

  // Board label
  boardLabel.textContent = `${status} — 1 task`;

  // Time display: stop/start timer
  if (isDone) {
    stopTimer();
    timeRemainingEl.textContent = 'Completed';
    timeRemainingEl.classList.remove('is-overdue');
    overdueIndicator.hidden = true;
    card.classList.remove('is-overdue');
  } else {
    updateTimeDisplay();
    startTimer();
  }
}

function renderTitle(title) {
  titleEl.textContent = title;
}

function renderDescription(description) {
  descriptionEl.textContent = description;
  initCollapsible();
}

function renderDueDate(date) {
  dueDateEl.dateTime    = date.toISOString();
  dueDateEl.textContent = formatDisplayDate(date);
  updateTimeDisplay();
}

// ── Time display ──────────────────────────────────────────────
function updateTimeDisplay() {
  if (state.status === 'Done') {
    timeRemainingEl.textContent = 'Completed';
    timeRemainingEl.classList.remove('is-overdue');
    overdueIndicator.hidden = true;
    card.classList.remove('is-overdue');
    return;
  }

  const isOverdue = state.dueDate - Date.now() < 0;
  timeRemainingEl.textContent = formatTimeRemaining(state.dueDate, false);
  timeRemainingEl.classList.toggle('is-overdue', isOverdue);
  overdueIndicator.hidden = !isOverdue;
  card.classList.toggle('is-overdue', isOverdue);
}

function startTimer() {
  stopTimer();
  state.timerId = setInterval(updateTimeDisplay, 30_000);
}

function stopTimer() {
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
}

// ── Expand / Collapse ─────────────────────────────────────────
function initCollapsible() {
  const needsCollapse = state.description.length > COLLAPSE_THRESHOLD;
  expandToggle.hidden = !needsCollapse;

  if (!needsCollapse) {
    collapsibleEl.classList.remove('is-collapsed');
    state.isExpanded = true;
    return;
  }

  if (!state.isExpanded) {
    collapsibleEl.classList.add('is-collapsed');
    expandToggle.setAttribute('aria-expanded', 'false');
    expandLabel.textContent = 'Show more';
  } else {
    collapsibleEl.classList.remove('is-collapsed');
    expandToggle.setAttribute('aria-expanded', 'true');
    expandLabel.textContent = 'Show less';
  }
}

function toggleExpand() {
  state.isExpanded = !state.isExpanded;

  if (state.isExpanded) {
    const fullHeight = collapsibleEl.scrollHeight;
    collapsibleEl.style.maxHeight = fullHeight + 'px';
    collapsibleEl.classList.remove('is-collapsed');
    collapsibleEl.addEventListener('transitionend', () => {
      collapsibleEl.style.maxHeight = '';
    }, { once: true });
    expandToggle.setAttribute('aria-expanded', 'true');
    expandLabel.textContent = 'Show less';
  } else {
    collapsibleEl.style.maxHeight = collapsibleEl.scrollHeight + 'px';
    void collapsibleEl.offsetHeight;
    collapsibleEl.classList.add('is-collapsed');
    collapsibleEl.style.maxHeight = '';
    expandToggle.setAttribute('aria-expanded', 'false');
    expandLabel.textContent = 'Show more';
  }
}

// ── Edit mode (form is always visible) ────────────────────────
function populateForm() {
  editTitleInput.value     = state.title;
  editDescInput.value      = state.description;
  editPrioritySelect.value = state.priority;
  editDueDateInput.value   = toInputDate(state.dueDate);
}

function openEditMode() {
  // Snapshot current values so Cancel can restore them
  snapshot = {
    title:       state.title,
    description: state.description,
    priority:    state.priority,
    dueDate:     new Date(state.dueDate),
  };
  populateForm();
  state.isEditMode = true;
  // Scroll form into view and focus the title field
  editTitleInput.focus();
}

function closeEditMode(save) {
  if (save) {
    const newTitle = editTitleInput.value.trim();
    if (!newTitle) {
      editTitleInput.focus();
      editTitleInput.setAttribute('aria-invalid', 'true');
      return;
    }
    editTitleInput.removeAttribute('aria-invalid');

    state.title       = newTitle;
    state.description = editDescInput.value.trim();
    state.priority    = editPrioritySelect.value;

    const dateVal = editDueDateInput.value;
    if (dateVal) {
      const [y, m, d] = dateVal.split('-').map(Number);
      state.dueDate = new Date(y, m - 1, d, 18, 0, 0);
    }

    renderTitle(state.title);
    renderDescription(state.description);
    renderPriority(state.priority);
    renderDueDate(state.dueDate);
    // Keep form in sync with saved values
    populateForm();
  } else {
    // Cancel: reset form fields back to last saved state
    populateForm();
  }

  state.isEditMode = false;
  editBtn.focus();
}

// Focus trap inside edit form
function onEditKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeEditMode(false);
    return;
  }

  if (e.key !== 'Tab') return;

  const focusable = Array.from(
    editFormEl.querySelectorAll('input, textarea, select, button')
  ).filter(el => !el.disabled && el.offsetParent !== null);

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// ── Status sync ───────────────────────────────────────────────
function handleStatusChange(newStatus) {
  state.status = newStatus;
  renderStatus(newStatus);
}

// ── Event listeners ───────────────────────────────────────────

// Checkbox
toggle.addEventListener('change', () => {
  const newStatus = toggle.checked ? 'Done' : 'Pending';
  handleStatusChange(newStatus);
});

// Status control dropdown
statusControl.addEventListener('change', () => {
  handleStatusChange(statusControl.value);
});

// Expand/collapse
expandToggle.addEventListener('click', toggleExpand);
expandToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); }
});

// Edit button
editBtn.addEventListener('click', openEditMode);

// Save button
saveBtn.addEventListener('click', () => closeEditMode(true));

// Cancel button
cancelBtn.addEventListener('click', () => closeEditMode(false));

// Focus trap in edit form
editFormEl.addEventListener('keydown', onEditKeydown);

// Delete button
deleteBtn.addEventListener('click', () => {
  if (confirm('Delete this task?')) {
    stopTimer();
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(0.97)';
    setTimeout(() => { card.style.display = 'none'; }, 300);
  }
});

// Tag toggle — tabindex="-1" keeps tags out of the primary Tab flow
// (spec requires: Checkbox → Status → Expand → Edit → Delete)
// Tags are still clickable and discoverable by screen readers via role/aria-pressed.
document.querySelectorAll('.todo-card__tags .tag').forEach(tag => {
  tag.setAttribute('tabindex', '-1');
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

// ── Init ──────────────────────────────────────────────────────
renderPriority(state.priority);
renderTitle(state.title);
renderDescription(state.description);
renderDueDate(state.dueDate);
renderStatus(state.status);
populateForm(); // pre-fill form fields on page load
startTimer();
