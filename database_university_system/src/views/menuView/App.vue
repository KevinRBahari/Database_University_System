<template>
  <div id="app">
    <!-- Complex Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo/Brand Section -->
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <img src="@/assets/scut_logo.png" alt="SCUT Logo" class="brand-logo" />
            <span class="brand-text">University System</span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="navbar-menu" :class="{ active: isMenuOpen }">
          <div class="navbar-links">
            <router-link to="/" class="nav-link" active-class="active" @click="closeMenu">
              <span class="nav-icon">🏠</span>
              <span>Home</span>
            </router-link>
            
            <!-- Show Dashboard only when authenticated -->
            <router-link 
              v-if="authStore.isAuthenticated" 
              to="/dashboard" 
              class="nav-link" 
              active-class="active"
              @click="closeMenu"
            >
              <span class="nav-icon">📊</span>
              <span>Dashboard</span>
            </router-link>

            <!-- Academics Dropdown - Show only when authenticated -->
            <div v-if="authStore.isAuthenticated" class="nav-dropdown">
              <button class="nav-link dropdown-trigger" @click="toggleDropdown">
                <span class="nav-icon">📚</span>
                <span>Academics</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div class="dropdown-menu" :class="{ show: isDropdownOpen }">
                <router-link to="/courses" class="dropdown-item" @click="closeAll">
                  Courses
                </router-link>
                <router-link to="/students" class="dropdown-item" @click="closeAll">
                  Students
                </router-link>
                <router-link to="/faculty" class="dropdown-item" @click="closeAll">
                  Faculty
                </router-link>
              </div>
            </div>

            <!-- Admin Panel Link - Show only for admin users -->
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="nav-link admin-link" 
              active-class="active"
              @click="closeMenu"
            >
              <span class="nav-icon">👨‍💼</span>
              <span>Admin Panel</span>
            </router-link>
          </div>

          <!-- User Section -->
          <div class="navbar-user">
            <!-- Show Login/Register when not authenticated -->
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="nav-link login-btn" @click="closeMenu">
                <span class="nav-icon">👤</span>
                <span>Login</span>
              </router-link>
              <router-link to="/register" class="nav-link register-btn" @click="closeMenu">
                <span class="nav-icon">📝</span>
                <span>Register</span>
              </router-link>
            </template>

            <!-- Show User Info and Logout when authenticated -->
            <template v-else>
              <div class="user-info">
                <div class="user-avatar">
                  {{ getUserInitial() }}
                </div>
                <div class="user-details">
                  <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
                  <span class="user-role">{{ formatRole(authStore.userType) }}</span>
                </div>
              </div>
              <button @click="handleLogout" class="nav-link logout-btn">
                <span class="nav-icon">🚪</span>
                <span>Logout</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="navbar-toggle" @click="toggleMenu" aria-label="Toggle navigation">
          <span class="toggle-icon"></span>
          <span class="toggle-icon"></span>
          <span class="toggle-icon"></span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const isDropdownOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) {
    isDropdownOpen.value = false
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
  isDropdownOpen.value = false
}

const closeAll = () => {
  isMenuOpen.value = false
  isDropdownOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  closeMenu()
  router.push('/')
}

const getUserInitial = () => {
  const name = authStore.user?.name || 'U'
  return name.charAt(0).toUpperCase()
}

const formatRole = (role) => {
  if (!role) return ''
  return role.charAt(0).toUpperCase() + role.slice(1)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: #f5f5f5;
}

/* Navbar - Fixed at Top Only */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 70px;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Brand Section */
.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0.75rem;
  transition: transform 0.3s ease;
}

.brand-link:hover {
  transform: translateY(-2px);
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex: 1;
  justify-content: flex-end;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-link:hover::before {
  width: 80%;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

/* Admin Link Special Styling */
.admin-link {
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.admin-link:hover {
  background: rgba(255, 215, 0, 0.3);
  border-color: gold;
}

.admin-link.active {
  background: rgba(255, 215, 0, 0.4);
  border-color: gold;
}

/* Dropdown */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  background: transparent;
}

.dropdown-arrow {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.dropdown-trigger:hover .dropdown-arrow,
.dropdown-menu.show ~ .dropdown-trigger .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f0f0f0;
  padding-left: 2rem;
}

/* User Section */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: capitalize;
}

.login-btn,
.register-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1.5rem;
  font-weight: 600;
}

.login-btn:hover,
.register-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1.5rem;
  font-weight: 600;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

/* Mobile Toggle */
.navbar-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.toggle-icon {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Main Content - Pushes content below fixed navbar */
.main-content {
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .navbar-links {
    gap: 1rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .brand-logo {
    height: 35px;
  }

  .navbar-toggle {
    display: flex;
  }

  .navbar-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    gap: 0;
    padding: 1rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .navbar-menu.active {
    transform: translateX(0);
  }

  .navbar-links {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
  }

  .navbar-user {
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;
  }

  .user-info {
    width: 100%;
    justify-content: center;
  }

  .login-btn,
  .register-btn,
  .logout-btn {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 0.5rem;
  }

  .dropdown-item {
    color: white;
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .main-content {
    margin-top: 60px;
    min-height: calc(100vh - 60px);
  }
}
</style>