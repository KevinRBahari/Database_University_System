<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="student_id">Student ID</label>
      <input 
        id="student_id"
        v-model="studentId" 
        type="number" 
        required
        placeholder="Enter your student ID"
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password"
        v-model="password" 
        type="password" 
        required
        placeholder="Enter your password"
      />
    </div>
    
    <button type="submit" class="btn-primary">Login</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const studentId = ref('')
const password = ref('')

const handleSubmit = () => {
  emit('submit', {
    student_id: studentId.value,
    password: password.value
  })
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary:hover {
  background: #45a049;
}
</style>
