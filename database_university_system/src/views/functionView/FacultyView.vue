<template>
  <div class="faculty-page">
    <div class="page-header">
      <h1>👨‍🏫 Faculty Directory</h1>
      <p class="subtitle">Browse and manage faculty information</p>
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
        <label>Department:</label>
        <select v-model="selectedDept" class="filter-select">
          <option value="">All Departments</option>
          <option value="CSE">Computer Science & Engineering</option>
          <option value="EE">Electrical Engineering</option>
          <option value="ME">Mechanical Engineering</option>
          <option value="MATH">Mathematics</option>
          <option value="PHYS">Physics</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Title:</label>
        <select v-model="selectedTitle" class="filter-select">
          <option value="">All Titles</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
          <option value="Lecturer">Lecturer</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading faculty...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="fetchFaculty" class="btn-retry">Retry</button>
    </div>

    <!-- Faculty Grid -->
    <div v-else class="faculty-grid">
      <div 
        v-for="instructor in filteredFaculty" 
        :key="instructor.id"
        class="faculty-card"
      >
        <div class="faculty-avatar-container">
          <div class="faculty-avatar">
            {{ instructor.name.charAt(0).toUpperCase() }}
          </div>
          <div class="title-badge" :class="getTitleClass(instructor.title)">
            {{ instructor.title || 'Faculty' }}
          </div>
        </div>

        <div class="faculty-info">
          <h3 class="faculty-name">{{ instructor.name }}</h3>
          <p class="faculty-id">{{ instructor.instructor_id }}</p>
          
          <div class="info-details">
            <div class="detail-row">
              <span class="icon">🏢</span>
              <span>{{ instructor.dept_name }}</span>
            </div>
            <div class="detail-row">
              <span class="icon">📧</span>
              <span>{{ instructor.email }}</span>
            </div>
            <div class="detail-row" v-if="instructor.office_location">
              <span class="icon">📍</span>
              <span>{{ instructor.office_location }}</span>
            </div>
            <div class="detail-row" v-if="instructor.office_hours">
              <span class="icon">🕐</span>
              <span>{{ instructor.office_hours }}</span>
            </div>
            <div class="detail-row" v-if="instructor.contact_phone">
              <span class="icon">📞</span>
              <span>{{ instructor.contact_phone }}</span>
            </div>
          </div>
        </div>

        <div class="faculty-actions">
          <button 
            @click="viewFaculty(instructor)"
            class="btn-view-full"
          >
            View Full Profile
          </button>
          <button 
            v-if="isAdmin"
            @click="editFaculty(instructor)"
            class="btn-edit"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredFaculty.length === 0" class="empty-state">
      <p>📭 No faculty members found matching your criteria</p>
    </div>

    <!-- Faculty Details Modal -->
    <div v-if="selectedFaculty" class="modal-overlay" @click="selectedFaculty = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Faculty Profile</h2>
          <button @click="selectedFaculty = null" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="profile-section">
            <div class="profile-avatar-large">
              {{ selectedFaculty.name.charAt(0).toUpperCase() }}
            </div>
            <h3>{{ selectedFaculty.name }}</h3>
            <p class="profile-title">{{ selectedFaculty.title }}</p>
            <p class="profile-dept">{{ selectedFaculty.dept_name }}</p>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h4>Contact Information</h4>
              <div class="info-list">
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>{{ selectedFaculty.email }}</span>
                </div>
                <div class="info-item">
                  <strong>Phone:</strong>
                  <span>{{ selectedFaculty.contact_phone || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <strong>Instructor ID:</strong>
                  <span>{{ selectedFaculty.instructor_id }}</span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h4>Office Information</h4>
              <div class="info-list">
                <div class="info-item">
                  <strong>Office Location:</strong>
                  <span>{{ selectedFaculty.office_location || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <strong>Office Hours:</strong>
                  <span>{{ selectedFaculty.office_hours || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <strong>Department:</strong>
                  <span>{{ selectedFaculty.dept_name }} ({{ selectedFaculty.dept_code }})</span>
                </div>
              </div>
            </div>
          </div>

          <div class="teaching-section" v-if="facultyCourses.length > 0">
            <h4>Teaching This Semester</h4>
            <div class="courses-list">
              <div 
                v-for="course in facultyCourses" 
                :key="course.id"
                class="course-item"
              >
                <div class="course-info">
                  <strong>{{ course.course_code }}</strong>
                  <span>{{ course.course_name }}</span>
                  <span class="section-info">Section: {{ course.section_code }}</span>
                </div>
                <div class="course-details">
                  <span>{{ course.current_enrollment }}/{{ course.max_capacity }} students</span>
                  <span>{{ course.room_location }}</span>
                </div>
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
const faculty = ref([]);
const selectedFaculty = ref(null);
const facultyCourses = ref([]);
const loading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const selectedDept = ref('');
const selectedTitle = ref('');

// Computed
const isAdmin = computed(() => authStore.user?.user_type === 'admin');

const filteredFaculty = computed(() => {
  return faculty.value.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      instructor.instructor_id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    const matchesDept = !selectedDept.value || instructor.dept_code === selectedDept.value;
    const matchesTitle = !selectedTitle.value || instructor.title === selectedTitle.value;
    
    return matchesSearch && matchesDept && matchesTitle;
  });
});

// Methods
const fetchFaculty = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/api/instructors', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    faculty.value = await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.message.includes('Failed to fetch')) {
      error.value = 'Cannot connect to server. Please ensure the backend is running.';
    } else {
      error.value = err.message || 'Failed to load faculty';
    }
  } finally {
    loading.value = false;
  }
};

const viewFaculty = async (instructor) => {
  selectedFaculty.value = instructor;
  try {
    const response = await fetch(`/api/instructors/${instructor.id}/courses`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      facultyCourses.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch courses:', err);
    facultyCourses.value = [];
  }
};

const editFaculty = (instructor) => {
  alert('Edit functionality would be implemented here');
};

const getTitleClass = (title) => {
  if (!title) return 'default';
  if (title.includes('Professor')) return 'professor';
  if (title.includes('Lecturer')) return 'lecturer';
  return 'default';
};

// Lifecycle
onMounted(() => {
  fetchFaculty();
});
</script>

<style scoped>
.faculty-page {
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
.error-container,
.empty-state {
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

.faculty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.faculty-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.faculty-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.faculty-avatar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.faculty-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.title-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #4b5563;
}

.title-badge.professor {
  background: #fef3c7;
  color: #92400e;
}

.title-badge.lecturer {
  background: #dbeafe;
  color: #1e40af;
}

.faculty-info {
  flex: 1;
}

.faculty-name {
  font-size: 1.4rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.faculty-id {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.faculty-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-view-full,
.btn-edit {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-full {
  background: #667eea;
  color: white;
}

.btn-view-full:hover {
  background: #5568d3;
}

.btn-edit {
  background: #fef3c7;
  color: #92400e;
}

.btn-edit:hover {
  background: #fde68a;
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
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.profile-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.profile-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.profile-dept {
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-card h4 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: #6b7280;
  font-size: 0.85rem;
}

.info-item span {
  color: #1f2937;
}

.teaching-section h4 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-info strong {
  color: #667eea;
  font-size: 1rem;
}

.section-info {
  font-size: 0.85rem;
  color: #6b7280;
}

.course-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .faculty-page {
    padding: 1rem;
  }
  
  .faculty-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .course-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .course-details {
    align-items: flex-start;
  }
}
</style>
