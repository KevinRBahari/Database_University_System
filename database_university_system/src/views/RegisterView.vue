<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Create Account</h1>
      <RegisterForm @submit="handleRegister" @switch-to-login="switchToLogin" />
    </div>
  </div>
</template>

<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleRegister = async (credentials) => {
  const result = await authStore.register(
    credentials.student_id,
    credentials.name,
    credentials.email,
    credentials.password,
    credentials.program,
    credentials.year
  )

  if (result.success) {
    router.push('/dashboard')
  }
}

const switchToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #374151;
}
</style>
