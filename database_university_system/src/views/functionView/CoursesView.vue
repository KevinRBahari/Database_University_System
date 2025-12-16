<template>
  <div class="courses-page">
    <div class="page-header">
      <h1>📚 Course Catalog</h1>
      <p class="subtitle">Browse and enroll in available courses</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Search:</label>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Search courses..."
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
        <label>Course Type:</label>
        <select v-model="selectedType" class="filter-select">
          <option value="">All Types</option>
          <option value="general_required">General Required</option>
          <option value="major_required">Major Required</option>
          <option value="major_elective">Major Elective</option>
          <option value="university_elective">University Elective</option>
          <option value="practical">Practical</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading courses...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="fetchCourses" class="btn-retry">Retry</button>
    </div>

    <!-- Courses Grid -->
    <div v-else class="courses-grid">
      <div 
        v-for="course in filteredCourses" 
        :key="course.id"
        class="course-card"
      >
        <div class="course-header">
          <div class="course-code-badge">{{ course.course_code }}</div>
          <div class="course-type-badge" :class="course.course_type">
            {{ formatCourseType(course.course_type) }}
          </div>
        </div>
        
        <h3 class="course-title">{{ course.course_name }}</h3>
        <p class="course-description">{{ course.description }}</p>
        
        <div class="course-details">
          <div class="detail-item">
            <span class="icon">🎓</span>
            <span>{{ course.credits }} Credits</span>
          </div>
          <div class="detail-item">
            <span class="icon">🏢</span>
            <span>{{ course.dept_name }}</span>
          </div>
        </div>

        <div class="course-actions">
          <button 
            @click="viewCourseDetails(course)"
            class="btn-view"
          >
            View Details
          </button>
          <button 
            v-if="isStudent"
            @click="enrollInCourse(course)"
            class="btn-enroll"
            :disabled="isEnrolled(course.id)"
          >
            {{ isEnrolled(course.id) ? 'Enrolled' : 'Enroll Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredCourses.length === 0" class="empty-state">
      <p>🔭 No courses found matching your criteria</p>
    </div>

    <!-- Course Details Modal -->
    <div v-if="selectedCourse" class="modal-overlay" @click="selectedCourse = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedCourse.course_code }} - {{ selectedCourse.course_name }}</h2>
          <button @click="selectedCourse = null" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <h3>Course Information</h3>
            <p><strong>Credits:</strong> {{ selectedCourse.credits }}</p>
            <p><strong>Department:</strong> {{ selectedCourse.dept_name }}</p>
            <p><strong>Type:</strong> {{ formatCourseType(selectedCourse.course_type) }}</p>
            <p><strong>Description:</strong> {{ selectedCourse.description }}</p>
          </div>
          
          <div class="info-section" v-if="courseSections.length > 0">
            <h3>Available Sections</h3>
            <div v-for="section in courseSections" :key="section.id" class="section-item">
              <div class="section-info">
                <strong>{{ section.section_code }}</strong>
                <span>Instructor: {{ section.instructor_name }}</span>
                <span>Room: {{ section.room_location }}</span>
                <span>Capacity: {{ section.current_enrollment }}/{{ section.max_capacity }}</span>
              </div>
              <button 
                v-if="isStudent"
                @click="enrollInSection(section)"
                class="btn-enroll-section"
                :disabled="section.current_enrollment >= section.max_capacity"
              >
                {{ section.current_enrollment >= section.max_capacity ? 'Full' : 'Enroll' }}
              </button>
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
const courses = ref([]);
const courseSections = ref([]);
const selectedCourse = ref(null);
const loading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const selectedDept = ref('');
const selectedType = ref('');
const enrolledCourses = ref([]);

// Computed
const isStudent = computed(() => authStore.user?.user_type === 'student');

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         course.course_code.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesDept = !selectedDept.value || course.dept_code === selectedDept.value;
    const matchesType = !selectedType.value || course.course_type === selectedType.value;
    return matchesSearch && matchesDept && matchesType;
  });
});

// Methods
const fetchCourses = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/api/courses', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    courses.value = data;
    
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.message.includes('Failed to fetch')) {
      error.value = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
    } else {
      error.value = err.message || 'Failed to load courses';
    }
  } finally {
    loading.value = false;
  }
};

const fetchEnrolledCourses = async () => {
  if (!isStudent.value) return;
  try {
    const response = await fetch('http://localhost:3000/api/student/enrollments', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      const enrollments = await response.json();
      enrolledCourses.value = enrollments.map(e => e.course_id);
    }
  } catch (err) {
    console.error('Failed to fetch enrollments:', err);
  }
};

const isEnrolled = (courseId) => {
  return enrolledCourses.value.includes(courseId);
};

const viewCourseDetails = async (course) => {
  selectedCourse.value = course;
  try {
    const response = await fetch(`http://localhost:3000/api/courses/${course.id}/sections`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      courseSections.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch sections:', err);
  }
};

const enrollInCourse = async (course) => {
  await viewCourseDetails(course);
};

const enrollInSection = async (section) => {
  if (!authStore.profile?.id) {
    alert('Please refresh your profile data');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/enrollments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ section_id: section.id })
    });
    
    if (response.ok) {
      alert('Successfully enrolled!');
      selectedCourse.value = null;
      await fetchEnrolledCourses();
      await fetchCourses(); // Refresh course list
    } else {
      const data = await response.json();
      alert(data.message || 'Enrollment failed');
    }
  } catch (err) {
    console.error('Enrollment error:', err);
    alert('Error enrolling in course: ' + err.message);
  }
};

const formatCourseType = (type) => {
  const types = {
    'general_required': 'General Required',
    'major_required': 'Major Required',
    'major_elective': 'Major Elective',
    'university_elective': 'University Elective',
    'practical': 'Practical'
  };
  return types[type] || type;
};

// Lifecycle
onMounted(() => {
  fetchCourses();
  fetchEnrolledCourses();
});
</script>

<style scoped>
/* Previous styles remain the same */
.courses-page {
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
  transition: border-color 0.2s;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
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

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.course-code-badge {
  background: #667eea;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
}

.course-type-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #4b5563;
}

.course-type-badge.general_required { background: #dbeafe; color: #1e40af; }
.course-type-badge.major_required { background: #fee2e2; color: #991b1b; }
.course-type-badge.major_elective { background: #fef3c7; color: #92400e; }
.course-type-badge.university_elective { background: #d1fae5; color: #065f46; }
.course-type-badge.practical { background: #e9d5ff; color: #6b21a8; }

.course-title {
  font-size: 1.3rem;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.course-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
  min-height: 48px;
}

.course-details {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.icon {
  font-size: 1.2rem;
}

.course-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-view,
.btn-enroll {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background: #f3f4f6;
  color: #374151;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-enroll {
  background: #667eea;
  color: white;
}

.btn-enroll:hover:not(:disabled) {
  background: #5568d3;
}

.btn-enroll:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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
  max-width: 700px;
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
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.info-section p {
  margin-bottom: 0.75rem;
  color: #4b5563;
  line-height: 1.6;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-info span {
  font-size: 0.9rem;
  color: #6b7280;
}

.btn-enroll-section {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-enroll-section:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .courses-page {
    padding: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
}
</style>
