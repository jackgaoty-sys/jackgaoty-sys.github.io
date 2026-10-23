import DefaultTheme from 'vitepress/theme'
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
