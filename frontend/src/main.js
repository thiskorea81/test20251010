import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const pinia = createPinia()
// localStorage 영속화(간단)
pinia.use(({ store }) => {
  const key = `td:${store.$id}`
  const saved = localStorage.getItem(key)
  if (saved) store.$patch(JSON.parse(saved))
  store.$subscribe((_, state) => localStorage.setItem(key, JSON.stringify(state)))
})

createApp(App).use(pinia).use(router).mount('#app')
