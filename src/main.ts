import { createApp } from 'vue'
import './assets/main.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useTagsStore } from '@/store/tags'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(router)
app.use(pinia)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const tagStore = useTagsStore()
tagStore.loadTags()
tagStore.startAutoUpdate(60000)

// 绑定到 index.html 里id=app的元素
app.mount('#app')
