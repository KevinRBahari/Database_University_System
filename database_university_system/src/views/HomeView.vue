<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Welcome to <span class="hero-accent">University System</span>
        </h1>
        <p class="hero-description">
          Your comprehensive platform for managing student information, courses, and academic resources.
        </p>
        <div class="hero-actions">
          <router-link to="/login" class="btn-primary-large">
            <span>🚀</span>
            Get Started
          </router-link>
          <router-link to="/register" class="btn-secondary-large">
            <span>📝</span>
            Create Account
          </router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-placeholder">
          <img src="@/assets/scut_logo.png" alt="SCUT Logo" class="hero-logo" />
          <h3>SCUT University</h3>
          <p>Excellence in Education</p>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup>
// Home page logic
</script>

<style scoped>
.home {
  min-height: calc(100vh - 70px);
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 4rem 2rem;
  background: #667eea;
  color: white;
  min-height: 60vh;
}

.hero-content {
  max-width: 500px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.hero-accent {
  color: #ffd700;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary-large,
.btn-secondary-large {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary-large {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-secondary-large {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary-large:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-placeholder {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-logo {
  width: 120px;
  height: auto;
  margin-bottom: 1rem;
}

.hero-image-placeholder h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.hero-image-placeholder p {
  color: rgba(255, 255, 255, 0.8);
}

/* Features Section */
.features {
  padding: 5rem 2rem;
  background: #f8fafc;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 3rem 1rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-actions,
  .cta-actions {
    flex-direction: column;
  }

  .btn-primary-large,
  .btn-secondary-large {
    width: 100%;
    justify-content: center;
  }

  .features {
    padding: 3rem 1rem;
  }

  .section-title,
  .cta h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-image-placeholder {
    padding: 2rem;
    margin-top: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .section-title,
  .cta h2 {
    font-size: 1.8rem;
  }
}
</style>
