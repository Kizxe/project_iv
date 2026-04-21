const API = '/api/students';
let allStudents = [];
let editingId = null;

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  checkConnection();
});

// ─── NAV ─────────────────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');

  if (name === 'list') loadStudents();
  if (name === 'add' && !editingId) resetForm();
}

// ─── CONNECTION STATUS ────────────────────────────────────────────────────────
async function checkConnection() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  try {
    await fetch(API);
    dot.className = 'status-dot online';
    txt.textContent = 'Connected';
  } catch {
    dot.className = 'status-dot offline';
    txt.textContent = 'Offline';
  }
}

// ─── LOAD ALL STUDENTS ────────────────────────────────────────────────────────
async function loadStudents() {
  const tbody = document.getElementById('student-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-row">Loading...</td></tr>';
  try {
    const res = await fetch(API);
    allStudents = await res.json();
    renderTable(allStudents);
    updateCount(allStudents.length);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">Failed to connect to server.</td></tr>';
  }
}

// ─── RENDER TABLE ─────────────────────────────────────────────────────────────
function renderTable(students) {
  const tbody = document.getElementById('student-tbody');
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No students found.</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td><span class="id-cell">#${s.id}</span></td>
      <td><span class="name-cell">${escape(s.name)}</span></td>
      <td><span class="email-cell">${escape(s.email)}</span></td>
      <td><span class="course-pill">${escape(s.course || '—')}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="editStudent(${s.id})">Edit</button>
          <button class="btn-delete" onclick="deleteStudent(${s.id}, '${escape(s.name)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ─── SEARCH / FILTER ──────────────────────────────────────────────────────────
function filterStudents() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.course && s.course.toLowerCase().includes(q)) ||
    s.email.toLowerCase().includes(q)
  );
  renderTable(filtered);
  updateCount(filtered.length);
}

function updateCount(n) {
  document.getElementById('student-count').textContent = `${n} student${n !== 1 ? 's' : ''}`;
}

// ─── SUBMIT FORM (ADD / UPDATE) ────────────────────────────────────────────────
async function submitForm() {
  const name = document.getElementById('input-name').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const course = document.getElementById('input-course').value.trim();

  if (!name || !email) { showToast('Name and email are required.', 'error'); return; }

  const body = JSON.stringify({ name, email, course });
  const isEdit = !!editingId;
  const url = isEdit ? `${API}/${editingId}` : API;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    });
    if (!res.ok) throw new Error('Request failed');
    showToast(isEdit ? 'Student updated!' : 'Student added!', 'success');
    resetForm();
    showSectionById('list');
    loadStudents();
  } catch {
    showToast('Something went wrong. Try again.', 'error');
  }
}

// ─── EDIT ─────────────────────────────────────────────────────────────────────
function editStudent(id) {
  const s = allStudents.find(x => x.id === id);
  if (!s) return;

  editingId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('input-name').value = s.name;
  document.getElementById('input-email').value = s.email;
  document.getElementById('input-course').value = s.course || '';
  document.getElementById('form-title').textContent = 'Edit Student';
  document.getElementById('form-subtitle').textContent = `Editing: ${s.name}`;
  document.getElementById('submit-btn').textContent = 'Update Student';

  showSectionById('add');
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 1);
  });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
async function deleteStudent(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    showToast(`"${name}" deleted.`, 'success');
    loadStudents();
  } catch {
    showToast('Delete failed.', 'error');
  }
}

// ─── RESET FORM ───────────────────────────────────────────────────────────────
function resetForm() {
  editingId = null;
  ['input-name', 'input-email', 'input-course', 'edit-id'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('form-title').textContent = 'Add Student';
  document.getElementById('form-subtitle').textContent = 'Fill in the student details below';
  document.getElementById('submit-btn').textContent = 'Add Student';
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function showSectionById(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
}

function escape(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.className = `toast ${type} show`;
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}