<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>👨‍💼 Admin Dashboard</h1>
      <p class="subtitle">Manage courses, students, and instructors</p>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button 
        @click="activeTab = 'courses'" 
        :class="['tab-btn', { active: activeTab === 'courses' }]"
      >
        📚 Courses
      </button>
      <button 
        @click="activeTab = 'students'" 
        :class="['tab-btn', { active: activeTab === 'students' }]"
      >
        👨‍🎓 Students
      </button>
      <button 
        @click="activeTab = 'instructors'" 
        :class="['tab-btn', { active: activeTab === 'instructors' }]"
      >
        👨‍🏫 Instructors
      </button>
    </div>

    <!-- Courses Tab -->
    <div v-if="activeTab === 'courses'" class="tab-content">
      <div class="action-bar">
        <h2>Course Management</h2>
        <button @click="openCourseModal()" class="btn-create">
          ➕ Create New Course
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading courses...</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Department</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course.id">
              <td class="course-code">{{ course.course_code }}</td>
              <td>{{ course.course_name }}</td>
              <td>{{ course.credits }}</td>
              <td>{{ course.dept_name }}</td>
              <td>
                <span class="type-badge" :class="course.course_type">
                  {{ formatCourseType(course.course_type) }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="openCourseModal(course)" class="btn-action btn-edit">
                  ✏️ Edit
                </button>
                <button @click="deleteCourse(course)" class="btn-action btn-delete">
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Students Tab -->
    <div v-if="activeTab === 'students'" class="tab-content">
      <div class="action-bar">
        <h2>Student Management</h2>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading students...</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Major</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td class="student-id">{{ student.student_id }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.email }}</td>
              <td>{{ student.major }}</td>
              <td>Year {{ student.year_of_study }}</td>
              <td class="actions-cell">
                <button @click="openStudentModal(student)" class="btn-action btn-edit">
                  ✏️ Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Instructors Tab -->
    <div v-if="activeTab === 'instructors'" class="tab-content">
      <div class="action-bar">
        <h2>Instructor Management</h2>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading instructors...</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Instructor ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="instructor in instructors" :key="instructor.id">
              <td class="instructor-id">{{ instructor.instructor_id }}</td>
              <td>{{ instructor.name }}</td>
              <td>{{ instructor.email }}</td>
              <td>{{ instructor.dept_name }}</td>
              <td>{{ instructor.title }}</td>
              <td class="actions-cell">
                <button @click="openInstructorModal(instructor)" class="btn-action btn-edit">
                  ✏️ Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

   
    <!-- Course Modal -->
    <div v-if="showCourseModal" class="modal-overlay" @click="closeCourseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCourse ? 'Edit Course' : 'Create New Course' }}</h2>
          <button @click="closeCourseModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCourse" class="form">
            <div class="form-row">
              <div class="form-group">
                <label>Course Code *</label>
                <input 
                  v-model="courseForm.course_code" 
                  type="text" 
                  placeholder="e.g., CS101"
                  required
                  :disabled="editingCourse"
                />
              </div>
              <div class="form-group">
                <label>Credits *</label>
                <input 
                  v-model.number="courseForm.credits" 
                  type="number" 
                  min="1" 
                  max="10"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Course Name *</label>
              <input 
                v-model="courseForm.course_name" 
                type="text" 
                placeholder="e.g., Introduction to Programming"
                required
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="courseForm.description" 
                rows="3"
                placeholder="Course description..."
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Department *</label>
                <select v-model.number="courseForm.dept_id" required>
                  <option value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.dept_name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Course Type *</label>
                <select v-model="courseForm.course_type" required>
                  <option value="">Select Type</option>
                  <option value="general_required">General Required</option>
                  <option value="major_required">Major Required</option>
                  <option value="major_elective">Major Elective</option>
                  <option value="university_elective">University Elective</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Assign Instructor</label>
              <select v-model.number="courseForm.instructor_id" >
                <option :value="null">No Instructor Assigned</option>
                <option v-for="instructor in instructors" :key="instructor.id" :value="instructor.id">
                  {{ instructor.name }} ({{ instructor.instructor_id }}) - {{ instructor.dept_name }}
                </option>
              </select>
              <p class="form-hint">Select an instructor to assign to this course</p>
            </div>

            <div v-if="saveError" class="alert alert-error">
              {{ saveError }}
            </div>

            <div class="form-actions">
              <button type="button" @click="closeCourseModal" class="btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Student Modal -->
    <div v-if="showStudentModal" class="modal-overlay" @click="closeStudentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Student Information</h2>
          <button @click="closeStudentModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveStudent" class="form">
            <div class="form-group">
              <label>Student ID</label>
              <input v-model="studentForm.student_id" type="text" disabled class="disabled-input" />
            </div>

            <div class="form-group">
              <label>Name *</label>
              <input v-model="studentForm.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="studentForm.email" type="email" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Major</label>
                <select v-model="studentForm.major">
                  <option value="">Select Major</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div class="form-group">
                <label>College</label>
                <input v-model="studentForm.college" type="text" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Year of Study</label>
                <select v-model.number="studentForm.year_of_study">
                  <option :value="1">1st Year</option>
                  <option :value="2">2nd Year</option>
                  <option :value="3">3rd Year</option>
                  <option :value="4">4th Year</option>
                  <option :value="5">5th Year</option>
                </select>
              </div>

              <div class="form-group">
                <label>Gender</label>
                <select v-model="studentForm.gender">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Contact Phone</label>
              <input v-model="studentForm.contact_phone" type="tel" />
            </div>

            <div v-if="saveError" class="alert alert-error">
              {{ saveError }}
            </div>

            <div class="form-actions">
              <button type="button" @click="closeStudentModal" class="btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Saving...' : 'Update Student' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Instructor Modal -->
    <div v-if="showInstructorModal" class="modal-overlay" @click="closeInstructorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Instructor Information</h2>
          <button @click="closeInstructorModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveInstructor" class="form">
            <div class="form-group">
              <label>Instructor ID</label>
              <input v-model="instructorForm.instructor_id" type="text" disabled class="disabled-input" />
            </div>

            <div class="form-group">
              <label>Name *</label>
              <input v-model="instructorForm.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="instructorForm.email" type="email" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Department *</label>
                <select v-model.number="instructorForm.dept_id" required>
                  <option value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.dept_name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Title</label>
                <select v-model="instructorForm.title">
                  <option value="">Select Title</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Teaching Assistant">Teaching Assistant</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Office Location</label>
              <input v-model="instructorForm.office_location" type="text" placeholder="e.g., Building A, Room 301" />
            </div>

            <div class="form-group">
              <label>Office Hours</label>
              <input v-model="instructorForm.office_hours" type="text" placeholder="e.g., Mon-Wed 2-4 PM" />
            </div>

            <div class="form-group">
              <label>Contact Phone</label>
              <input v-model="instructorForm.contact_phone" type="tel" />
            </div>

            <div v-if="saveError" class="alert alert-error">
              {{ saveError }}
            </div>

            <div class="form-actions">
              <button type="button" @click="closeInstructorModal" class="btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Saving...' : 'Update Instructor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/components/stores/auth';

const authStore = useAuthStore();

// State
const activeTab = ref('courses');
const loading = ref(false);
const saving = ref(false);
const saveError = ref(null);

const courses = ref([]);
const students = ref([]);
const instructors = ref([]);
const departments = ref([]);

const showCourseModal = ref(false);
const showStudentModal = ref(false);
const showInstructorModal = ref(false);

const editingCourse = ref(null);
const editingStudent = ref(null);
const editingInstructor = ref(null);

const courseForm = ref({
  course_code: '',
  course_name: '',
  description: '',
  credits: 3,
  dept_id: '',
  course_type: ''
});

const studentForm = ref({
  id: null,
  student_id: '',
  name: '',
  email: '',
  major: '',
  college: '',
  year_of_study: 1,
  gender: '',
  contact_phone: ''
});

const instructorForm = ref({
  id: null,
  instructor_id: '',
  name: '',
  email: '',
  dept_id: '',
  title: '',
  office_location: '',
  office_hours: '',
  contact_phone: ''
});

// Methods
const fetchCourses = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/courses', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      courses.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch courses:', err);
  } finally {
    loading.value = false;
  }
};

const fetchStudents = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/students', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      students.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch students:', err);
  } finally {
    loading.value = false;
  }
};

const fetchInstructors = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/instructors', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (response.ok) {
      instructors.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch instructors:', err);
  } finally {
    loading.value = false;
  }
};

const fetchDepartments = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/departments');
    if (response.ok) {
      departments.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch departments:', err);
  }
};

const openCourseModal = (course = null) => {
  editingCourse.value = course;
  if (course) {
    courseForm.value = { 
      ...course,
      instructor_id: course.instructor_id || null
    };
  } else {
    courseForm.value = {
      course_code: '',
      course_name: '',
      description: '',
      credits: 3,
      dept_id: '',
      course_type: '',
      instructor_id: null
    };
  }
  showCourseModal.value = true;
  saveError.value = null;
};

const closeCourseModal = () => {
  showCourseModal.value = false;
  editingCourse.value = null;
};

const saveCourse = async () => {
  saving.value = true;
  saveError.value = null;

  try {
    const url = editingCourse.value 
      ? `http://localhost:3000/api/courses/${editingCourse.value.id}`
      : 'http://localhost:3000/api/courses';
    
    const method = editingCourse.value ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseForm.value)
    });

    if (response.ok) {
      alert(editingCourse.value ? 'Course updated successfully!' : 'Course created successfully!');
      closeCourseModal();
      await fetchCourses();
    } else {
      const data = await response.json();
      saveError.value = data.message || 'Failed to save course';
    }
  } catch (err) {
    saveError.value = 'Error: ' + err.message;
  } finally {
    saving.value = false;
  }
};

const deleteCourse = async (course) => {
  if (!confirm(`Are you sure you want to delete ${course.course_name}?`)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/courses/${course.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });

    if (response.ok) {
      alert('Course deleted successfully!');
      await fetchCourses();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to delete course');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

const openStudentModal = (student) => {
  editingStudent.value = student;
  studentForm.value = { ...student };
  showStudentModal.value = true;
  saveError.value = null;
};

const closeStudentModal = () => {
  showStudentModal.value = false;
  editingStudent.value = null;
};

const saveStudent = async () => {
  saving.value = true;
  saveError.value = null;

  try {
    const response = await fetch(`http://localhost:3000/api/students/${studentForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentForm.value)
    });

    if (response.ok) {
      alert('Student updated successfully!');
      closeStudentModal();
      await fetchStudents();
    } else {
      const data = await response.json();
      saveError.value = data.message || 'Failed to update student';
    }
  } catch (err) {
    saveError.value = 'Error: ' + err.message;
  } finally {
    saving.value = false;
  }
};

const openInstructorModal = (instructor) => {
  editingInstructor.value = instructor;
  instructorForm.value = { ...instructor };
  showInstructorModal.value = true;
  saveError.value = null;
};

const closeInstructorModal = () => {
  showInstructorModal.value = false;
  editingInstructor.value = null;
};

const saveInstructor = async () => {
  saving.value = true;
  saveError.value = null;

  try {
    const response = await fetch(`http://localhost:3000/api/instructors/${instructorForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instructorForm.value)
    });

    if (response.ok) {
      alert('Instructor updated successfully!');
      closeInstructorModal();
      await fetchInstructors();
    } else {
      const data = await response.json();
      saveError.value = data.message || 'Failed to update instructor';
    }
  } catch (err) {
    saveError.value = 'Error: ' + err.message;
  } finally {
    saving.value = false;
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

// Watch tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'courses') {
    fetchCourses();
  } else if (newTab === 'students') {
    fetchStudents();
  } else if (newTab === 'instructors') {
    fetchInstructors();
  }
});

// Lifecycle
onMounted(() => {
  fetchCourses();
  fetchDepartments();
});
</script>

<style scoped>
.admin-page {
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f3f4f6;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.action-bar h2 {
  color: #374151;
  font-size: 1.5rem;
  margin: 0;
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #059669;
  transform: translateY(-1px);
}

.loading-container {
  text-align: center;
  padding: 3rem;
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

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.course-code,
.student-id,
.instructor-id {
  font-weight: 600;
  color: #667eea;
}

.type-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #4b5563;
}

.type-badge.general_required { background: #dbeafe; color: #1e40af; }
.type-badge.major_required { background: #fee2e2; color: #991b1b; }
.type-badge.major_elective { background: #fef3c7; color: #92400e; }
.type-badge.university_elective { background: #d1fae5; color: #065f46; }
.type-badge.practical { background: #e9d5ff; color: #6b21a8; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-edit {
  background: #fef3c7;
  color: #92400e;
}

.btn-edit:hover {
  background: #fde68a;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
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
  margin: 0;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.disabled-input {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.alert-error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #5568d3;
}

.btn-save:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .btn-create {
    width: 100%;
  }
}
</style>

