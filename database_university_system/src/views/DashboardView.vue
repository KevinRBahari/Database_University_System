<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Welcome, {{ authStore.studentName }}!</h1>
        <p class="student-id">Student ID: {{ authStore.studentId }}</p>
      </div>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </div>
    
    <div class="dashboard-content">
      <div class="card">
        <h2>Your Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Student ID:</span>
            <span class="value">{{ authStore.user?.student_id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Name:</span>
            <span class="value">{{ authStore.user?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ authStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Program:</span>
            <span class="value">{{ authStore.user?.program }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
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

.student-id {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
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

.dashboard-content {
  display: grid;
  gap: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card h2 {
  margin: 0 0 1.5rem 0;
  color: #374151;
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
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
</style>
