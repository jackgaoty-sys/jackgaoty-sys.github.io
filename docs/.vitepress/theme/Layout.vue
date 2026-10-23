<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom, { type Zoom } from 'medium-zoom'
import PostMeta from './components/PostMeta.vue'
import NotFound from './components/NotFound.vue'
import { loadUnlocked, unlock } from './escape'

// 包一层默认布局：文章正文上方挂日志头（频道 · 编号 · 日期），404 换成终端版，
// 顺带在每个页面读一次 escape/ 的解锁状态，访问 /escape/ 下的页面时直接解锁；
// 正文里的图片点击放大（架构图、流程图看得清）。
const Layout = DefaultTheme.Layout
const route = useRoute()

// 换页后正文是新的 DOM，旧的绑定作废，每次换页重新绑一遍。
// 包在链接里的图片点了是要跳转的，不放大。
let zoom: Zoom | undefined
function bindZoom() {
  zoom?.detach()
  zoom = mediumZoom('.vp-doc img:not(a img)', { margin: 24, background: 'var(--vp-c-bg)' })
}

onMounted(() => {
  loadUnlocked()
  watch(
    () => route.path,
    (p) => {
      if (p.startsWith('/escape/')) unlock()
      nextTick(bindZoom)
    },
    { immediate: true }
  )
})
</script>

<template>
  <Layout>
    <template #doc-before><PostMeta /></template>
    <template #not-found><NotFound /></template>
  </Layout>
</template>
