import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/views/menuView/App.vue'
import router from '@/components/routers/router.js'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
