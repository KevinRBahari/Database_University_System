<template>
  <div class="login-page">
      <LoginForm @submit="handleLogin" />
  </div>
</template>

<script setup>
import LoginForm from '@/views/authView/LoginForm.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'


const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async (credentials) => {
  const { student_id, password } = credentials
  const result = await authStore.login(student_id, password)
  
  if (result.success) {
    router.push('/dashboard')  // Only redirect on success
  }
  // Handle errors through the store's error state
}

</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
}

.register-link .link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
}

.register-link .link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
