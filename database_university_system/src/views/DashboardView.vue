<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome, {{ username }}!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('User')
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
</style>