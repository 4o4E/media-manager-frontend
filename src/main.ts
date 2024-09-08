// 样式
import './assets/main.css' // 自定义样式
import "element-plus/dist/index.css"; // 默认样式
import 'element-plus/theme-chalk/dark/css-vars.css' // 深色样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 图标

import { createApp } from 'vue'

// 组件库
import ElementPlus from 'element-plus'
// 路由
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useTagsStore } from '@/store/tags'

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
