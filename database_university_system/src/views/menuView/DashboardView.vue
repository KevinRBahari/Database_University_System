<template>
  <div class="dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div>
        <h1>Welcome, {{ displayName }}!</h1>
        <p class="user-role">{{ displayRole }}</p>
        <p class="user-id">{{ displayId }}</p>
      </div>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>⚠️ {{ error }}</p>
      <button @click="loadProfile" class="btn-retry">Retry</button>
    </div>

    <!-- Student Dashboard -->
    <div v-else-if="authStore.isStudent" class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>Enrolled Courses</h3>
            <p class="stat-value">{{ enrollments.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h3>GPA</h3>
            <p class="stat-value">{{ profile?.gpa || '0.00' }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>Completed</h3>
            <p class="stat-value">{{ completedCourses }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <h3>In Progress</h3>
            <p class="stat-value">{{ inProgressCourses }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Personal Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Student ID:</span>
            <span class="value">{{ profile?.student_id || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Name:</span>
            <span class="value">{{ profile?.name || authStore.user?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ profile?.email || authStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Major:</span>
            <span class="value">{{ profile?.major || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">College:</span>
            <span class="value">{{ profile?.college || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Year of Study:</span>
            <span class="value">{{ profile?.year_of_study || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Enrollment Year:</span>
            <span class="value">{{ profile?.enrollment_year || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Gender:</span>
            <span class="value">{{ profile?.gender || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="card" v-if="enrollments.length > 0">
        <h2>Current Enrollments</h2>
        <div class="enrollments-list">
          <div v-for="enrollment in enrollments" :key="enrollment.id" class="enrollment-item">
            <div class="enrollment-header">
              <strong>{{ enrollment.course_code }}</strong>
              <span class="status-badge" :class="enrollment.enrollment_status">
                {{ enrollment.enrollment_status }}
              </span>
            </div>
            <p class="enrollment-name">{{ enrollment.course_name }}</p>
            <div class="enrollment-details">
              <span>{{ enrollment.credits }} credits</span>
              <span>{{ enrollment.section_code }}</span>
              <span v-if="enrollment.final_grade" class="grade">Grade: {{ enrollment.final_grade }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <router-link to="/courses" class="action-card">
            <span class="action-icon">📚</span>
            <span>Browse Courses</span>
          </router-link>
          <button @click="loadProfile" class="action-card">
            <span class="action-icon">🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Instructor Dashboard -->
    <div v-else-if="authStore.isInstructor" class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>Total Students</h3>
            <p class="stat-value">{{ instructorStats.totalStudents }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <h3>Courses Teaching</h3>
            <p class="stat-value">{{ instructorCourses.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <h3>Sections</h3>
            <p class="stat-value">{{ instructorStats.totalSections }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-info">
            <h3>Department</h3>
            <p class="stat-value-small">{{ profile?.dept_name || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Instructor Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Instructor ID:</span>
            <span class="value">{{ profile?.instructor_id || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Name:</span>
            <span class="value">{{ profile?.name || authStore.user?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ profile?.email || authStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Title:</span>
            <span class="value">{{ profile?.title || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Department:</span>
            <span class="value">{{ profile?.dept_name || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Office Location:</span>
            <span class="value">{{ profile?.office_location || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Office Hours:</span>
            <span class="value">{{ profile?.office_hours || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Phone:</span>
            <span class="value">{{ profile?.contact_phone || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="card" v-if="instructorCourses.length > 0">
        <h2>Teaching This Semester</h2>
        <div class="courses-list">
          <div v-for="course in instructorCourses" :key="course.id" class="course-item">
            <div class="course-header">
              <strong>{{ course.course_code }} - {{ course.course_name }}</strong>
              <span class="capacity-badge">
                {{ course.current_enrollment }}/{{ course.max_capacity }} students
              </span>
            </div>
            <div class="course-details">
              <span>Section: {{ course.section_code }}</span>
              <span>Room: {{ course.room_location }}</span>
              <span>{{ course.credits }} credits</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button @click="loadInstructorCourses" class="action-card">
            <span class="action-icon">📖</span>
            <span>View My Courses</span>
          </button>
          <button @click="loadProfile" class="action-card">
            <span class="action-icon">🔄</span>
            <span>Refresh Data</span>
          </button>
          <router-link to="/students" class="action-card">
            <span class="action-icon">👥</span>
            <span>View Students</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else-if="authStore.isAdmin" class="dashboard-content">
      <div class="card admin-welcome">
        <h2>Administrator Panel</h2>
        <p>Manage the university system from the admin panel.</p>
        <router-link to="/admin" class="btn-admin-panel">
          <span class="icon">👨‍💼</span>
          <span>Go to Admin Panel</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref(null)
const profile = ref(null)
const enrollments = ref([])
const instructorCourses = ref([])

// Computed
const displayName = computed(() => {
  if (profile.value?.name) return profile.value.name
  if (authStore.user?.name) return authStore.user.name
  return 'User'
})

const displayRole = computed(() => {
  const role = authStore.userType || 'user'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

const displayId = computed(() => {
  if (authStore.isStudent) {
    return `Student ID: ${profile.value?.student_id || authStore.user?.user_id || 'N/A'}`
  } else if (authStore.isInstructor) {
    return `Instructor ID: ${profile.value?.instructor_id || authStore.user?.user_id || 'N/A'}`
  }
  return `User ID: ${authStore.user?.user_id || 'N/A'}`
})

const completedCourses = computed(() => {
  return enrollments.value.filter(e => e.enrollment_status === 'passed').length
})

const inProgressCourses = computed(() => {
  return enrollments.value.filter(e => e.enrollment_status === 'enrolled').length
})

const instructorStats = computed(() => {
  const totalSections = instructorCourses.value.length
  const totalStudents = instructorCourses.value.reduce((sum, course) => {
    return sum + (course.current_enrollment || 0)
  }, 0)
  return { totalSections, totalStudents }
})

// Methods
const loadProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch profile from auth store
    await authStore.fetchFullProfile()
    profile.value = authStore.profile

    // Load additional data based on user type
    if (authStore.isStudent) {
      await loadStudentEnrollments()
    } else if (authStore.isInstructor) {
      await loadInstructorCourses()
    }
  } catch (err) {
    error.value = 'Failed to load profile data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadStudentEnrollments = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/student/enrollments', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (response.ok) {
      enrollments.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to load enrollments:', err)
  }
}

const loadInstructorCourses = async () => {
  try {
    if (!profile.value?.id) return
    
    const response = await fetch(`http://localhost:3000/api/instructors/${profile.value.id}/courses`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (response.ok) {
      instructorCourses.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to load instructor courses:', err)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 2rem;
}

.user-role {
  color: #667eea;
  font-weight: 600;
  margin: 0.25rem 0;
}

.user-id {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
}

.btn-logout {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

.dashboard-content {
  display: grid;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  color: #111827;
  font-size: 2rem;
  font-weight: 700;
}

.stat-value-small {
  margin: 0;
  color: #111827;
  font-size: 1.2rem;
  font-weight: 700;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h2 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.5rem;
}

.admin-welcome {
  text-align: center;
  padding: 3rem;
}

.admin-welcome p {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.btn-admin-panel {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-admin-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-admin-panel .icon {
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #6b7280;
}

.value {
  color: #111827;
}

.enrollments-list,
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.enrollment-item,
.course-item {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.enrollment-header,
.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.enrollment-header strong,
.course-header strong {
  color: #111827;
  font-size: 1.1rem;
}

.status-badge,
.capacity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
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

.capacity-badge {
  background: #e0e7ff;
  color: #3730a3;
}

.enrollment-name {
  color: #6b7280;
  margin: 0.5rem 0;
}

.enrollment-details,
.course-details {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.grade {
  color: #059669;
  font-weight: 600;
}

.quick-actions h3 {
  color: #374151;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.action-card:hover {
  border-color: #667eea;
  background: #f9fafb;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
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
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>