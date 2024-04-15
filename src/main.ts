// 样式
import './assets/main.css' // 自定义样式
import "element-plus/dist/index.css"; // 默认样式
import 'element-plus/theme-chalk/dark/css-vars.css' // 深色样式

import { createApp } from 'vue'

// 组件库
import ElementPlus from 'element-plus'
// 路由
import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

// 绑定到 index.html 里id=app的元素
app.mount('#app')
