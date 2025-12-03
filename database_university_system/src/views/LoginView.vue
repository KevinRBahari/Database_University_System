<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Login</h1>
      <LoginForm @submit="handleLogin" />
    </div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = (credentials) => {
  // Handle login logic
  console.log('Login with:', credentials)
  router.push('/dashboard')
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
</style>