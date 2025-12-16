<template>
  <div class="students-page">
    <div class="page-header">
      <h1>👨‍🎓 Students Directory</h1>
      <p class="subtitle">
        {{ isInstructor ? 'Manage student grades and information' : 'Browse student information' }}
      </p>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Search:</label>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Search by name, ID, or email..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <label>Major:</label>
        <select v-model="selectedMajor" class="filter-select">
          <option value="">All Majors</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Year:</label>
        <select v-model="selectedYear" class="filter-select">
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
          <option value="5">5th Year</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading students...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="fetchStudents" class="btn-retry">Retry</button>
    </div>

    <!-- Students Table -->
    <div v-else class="students-container">
      <div class="table-wrapper">
        <table class="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Major</th>
              <th>College</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td class="student-id">{{ student.student_id }}</td>
              <td class="student-name">
                <div class="name-cell">
                  <div class="avatar">
                    {{ student.name.charAt(0).toUpperCase() }}
                  </div>
                  {{ student.name }}
                </div>
              </td>
              <td class="student-email">{{ student.email }}</td>
              <td class="student-major">{{ student.major || 'N/A' }}</td>
              <td class="student-college">{{ student.college || 'N/A' }}</td>
              <td class="student-year">
                <span class="year-badge">Year {{ student.year_of_study }}</span>
              </td>
              <td class="actions-cell">
                <button 
                  @click="viewStudent(student)"
                  class="btn-action btn-view"
                  title="View Details"
                >
                  👁️
                </button>
                <button 
                  v-if="isInstructor"
                  @click="manageGrades(student)"
                  class="btn-action btn-grade"
                  title="Manage Grades"
                >
                  📝
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredStudents.length === 0" class="empty-state">
        <p>🔭 No students found matching your criteria</p>
      </div>
    </div>

    <!-- Student Details Modal -->
    <div v-if="selectedStudent && !showGradeModal" class="modal-overlay" @click="selectedStudent = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Student Details</h2>
          <button @click="selectedStudent = null" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="student-profile">
            <div class="profile-avatar-large">
              {{ selectedStudent.name.charAt(0).toUpperCase() }}
            </div>
            <h3>{{ selectedStudent.name }}</h3>
            <p class="profile-id">{{ selectedStudent.student_id }}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <strong>Email:</strong>
              <span>{{ selectedStudent.email }}</span>
            </div>
            <div class="info-item">
              <strong>Major:</strong>
              <span>{{ selectedStudent.major || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>College:</strong>
              <span>{{ selectedStudent.college || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>Year of Study:</strong>
              <span>{{ selectedStudent.year_of_study }}</span>
            </div>
            <div class="info-item">
              <strong>Enrollment Year:</strong>
              <span>{{ selectedStudent.enrollment_year || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>Gender:</strong>
              <span>{{ selectedStudent.gender || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>Phone:</strong>
              <span>{{ selectedStudent.contact_phone || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>Date of Birth:</strong>
              <span>{{ formatDate(selectedStudent.date_of_birth) || 'N/A' }}</span>
            </div>
          </div>

          <div class="enrollments-section" v-if="studentEnrollments.length > 0">
            <h4>Enrolled Courses</h4>
            <div class="enrollment-list">
              <div 
                v-for="enrollment in studentEnrollments" 
                :key="enrollment.id"
                class="enrollment-item"
              >
                <div class="enrollment-info">
                  <strong>{{ enrollment.course_code }}</strong>
                  <span>{{ enrollment.course_name }}</span>
                  <span class="status-badge" :class="enrollment.enrollment_status">
                    {{ enrollment.enrollment_status }}
                  </span>
                </div>
                <div class="enrollment-grade" v-if="enrollment.final_grade">
                  Grade: <strong>{{ enrollment.final_grade }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grade Management Modal (Instructor Only) -->
    <div v-if="showGradeModal && selectedStudent" class="modal-overlay" @click="closeGradeModal">
      <div class="modal-content grade-modal" @click.stop>
        <div class="modal-header">
          <h2>Manage Grades - {{ selectedStudent.name }}</h2>
          <button @click="closeGradeModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingGrades" class="loading-container">
            <div class="spinner"></div>
            <p>Loading grades...</p>
          </div>
          <div v-else-if="studentEnrollments.length === 0" class="empty-state">
            <p>This student has no enrollments</p>
          </div>
          <div v-else class="grades-list">
            <div 
              v-for="enrollment in studentEnrollments" 
              :key="enrollment.id"
              class="grade-item"
            >
              <div class="grade-item-header">
                <div>
                  <strong>{{ enrollment.course_code }}</strong>
                  <span class="course-name">{{ enrollment.course_name }}</span>
                </div>
                <span class="status-badge" :class="enrollment.enrollment_status">
                  {{ enrollment.enrollment_status }}
                </span>
              </div>
              
              <div class="grade-inputs">
                <div class="input-group">
                  <label>Numeric Grade (0-100):</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="enrollment.numeric_grade"
                    @change="calculateLetterGrade(enrollment)"
                    :disabled="enrollment.enrollment_status !== 'enrolled'"
                  />
                </div>
                
                <div class="input-group">
                  <label>Letter Grade:</label>
                  <input 
                    type="text" 
                    v-model="enrollment.final_grade"
                    disabled
                    class="readonly-input"
                  />
                </div>
                
                <div class="input-group">
                  <label>Status:</label>
                  <select 
                    v-model="enrollment.enrollment_status"
                    :disabled="enrollment.enrollment_status === 'dropped'"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <button 
                  @click="saveGrade(enrollment)"
                  class="btn-save-grade"
                  :disabled="savingGrade === enrollment.id"
                >
                  {{ savingGrade === enrollment.id ? 'Saving...' : 'Save Grade' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/components/stores/auth';

const authStore = useAuthStore();

// State
const students = ref([]);
const selectedStudent = ref(null);
const studentEnrollments = ref([]);
const loading = ref(false);
const loadingGrades = ref(false);
const error = ref(null);
const searchTerm = ref('');
const selectedMajor = ref('');
const selectedYear = ref('');
const showGradeModal = ref(false);
const savingGrade = ref(null);

// Computed
const isInstructor = computed(() => authStore.user?.user_type === 'instructor');

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    const matchesMajor = !selectedMajor.value || student.major === selectedMajor.value;
    const matchesYear = !selectedYear.value || student.year_of_study == selectedYear.value;
    
    return matchesSearch && matchesMajor && matchesYear;
  });
});

// Methods
const fetchStudents = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/api/students', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    students.value = await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.message.includes('Failed to fetch')) {
      error.value = 'Cannot connect to server. Please ensure the backend is running.';
    } else {
      error.value = err.message || 'Failed to load students';
    }
  } finally {
    loading.value = false;
  }
};

const viewStudent = async (student) => {
  selectedStudent.value = student;
  showGradeModal.value = false;
  
  try {
    const response = await fetch(`http://localhost:3000/api/students/${student.id}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      studentEnrollments.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch enrollments:', err);
    studentEnrollments.value = [];
  }
};

const manageGrades = async (student) => {
  selectedStudent.value = student;
  showGradeModal.value = true;
  loadingGrades.value = true;
  
  try {
    const response = await fetch(`http://localhost:3000/api/students/${student.id}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      studentEnrollments.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch enrollments:', err);
    studentEnrollments.value = [];
  } finally {
    loadingGrades.value = false;
  }
};

const closeGradeModal = () => {
  showGradeModal.value = false;
  selectedStudent.value = null;
  studentEnrollments.value = [];
};

const calculateLetterGrade = (enrollment) => {
  const score = enrollment.numeric_grade;
  
  if (score >= 95) enrollment.final_grade = 'A+';
  else if (score >= 90) enrollment.final_grade = 'A';
  else if (score >= 85) enrollment.final_grade = 'A-';
  else if (score >= 80) enrollment.final_grade = 'B+';
  else if (score >= 75) enrollment.final_grade = 'B';
  else if (score >= 70) enrollment.final_grade = 'B-';
  else if (score >= 65) enrollment.final_grade = 'C+';
  else if (score >= 60) enrollment.final_grade = 'C';
  else if (score >= 55) enrollment.final_grade = 'C-';
  else if (score >= 50) enrollment.final_grade = 'D';
  else enrollment.final_grade = 'F';
  
  // Auto-set status based on grade
  if (score >= 50 && enrollment.enrollment_status === 'enrolled') {
    enrollment.enrollment_status = 'passed';
  } else if (score < 50 && enrollment.enrollment_status === 'enrolled') {
    enrollment.enrollment_status = 'failed';
  }
};

const saveGrade = async (enrollment) => {
  savingGrade.value = enrollment.id;
  
  try {
    const response = await fetch(`http://localhost:3000/api/enrollments/${enrollment.id}/grade`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        numeric_grade: enrollment.numeric_grade,
        final_grade: enrollment.final_grade,
        enrollment_status: enrollment.enrollment_status
      })
    });
    
    if (response.ok) {
      alert('Grade saved successfully!');
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to save grade');
    }
  } catch (err) {
    alert('Error saving grade: ' + err.message);
  } finally {
    savingGrade.value = null;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
/* Previous styles... */
.students-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.students-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table thead {
  background: #f9fafb;
}

.students-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.students-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
}

.students-table tbody tr:hover {
  background: #f9fafb;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.student-id {
  font-weight: 600;
  color: #667eea;
}

.year-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-view {
  background: #f3f4f6;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-grade {
  background: #fef3c7;
}

.btn-grade:hover {
  background: #fde68a;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.grade-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  color: #1f2937;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.student-profile {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.profile-id {
  color: #6b7280;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.info-item strong {
  color: #6b7280;
  font-size: 0.85rem;
}

.info-item span {
  color: #1f2937;
  font-size: 1rem;
}

.enrollments-section h4 {
  color: #374151;
  margin-bottom: 1rem;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.enrollment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.enrollment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.status-badge.enrolled {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.passed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.enrollment-grade {
  color: #374151;
  font-weight: 600;
}

/* Grade Management Styles */
.grades-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.grade-item {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.grade-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.course-name {
  display: block;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.grade-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.input-group input,
.input-group select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
}

.readonly-input {
  background: #f3f4f6;
  cursor: not-allowed;
}

.btn-save-grade {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: fit-content;
}

.btn-save-grade:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-save-grade:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .students-page {
    padding: 1rem;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .grade-inputs {
    grid-template-columns: 1fr;
  }
}
</style>
