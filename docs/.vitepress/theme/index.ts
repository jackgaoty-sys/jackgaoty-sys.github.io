// 不带字体的版本：默认主题会加载 Inter，但本站正文用系统中文字体、等宽用 JetBrains Mono，Inter 用不上
import DefaultTheme from 'vitepress/theme-without-fonts'
import type { Theme } from 'vitepress'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './style.css'
import Layout from './Layout.vue'
import Home from './components/Home.vue'
import ChannelPage from './components/ChannelPage.vue'
import Roadmap from './components/Roadmap.vue'

export default {
  extends: DefaultTheme,
  // 日志头、终端版 404、escape/ 解锁状态都在 Layout.vue 里
  Layout,
  enhanceApp({ app }) {
    app.component('Home', Home)
    app.component('ChannelPage', ChannelPage)
    app.component('Roadmap', Roadmap)
  },
} satisfies Theme
