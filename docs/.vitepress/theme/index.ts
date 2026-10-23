import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './style.css'
import Home from './components/Home.vue'
import ChannelPage from './components/ChannelPage.vue'
import Roadmap from './components/Roadmap.vue'
import PostMeta from './components/PostMeta.vue'
import NotFound from './components/NotFound.vue'

export default {
  extends: DefaultTheme,
  // 每篇文章正文上方挂一行日志头（频道 · 编号 · 日期）；404 换成终端版
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PostMeta),
      'not-found': () => h(NotFound),
    }),
  enhanceApp({ app }) {
    app.component('Home', Home)
    app.component('ChannelPage', ChannelPage)
    app.component('Roadmap', Roadmap)
  },
} satisfies Theme
