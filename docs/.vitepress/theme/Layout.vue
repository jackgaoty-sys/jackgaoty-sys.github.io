<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import PostMeta from './components/PostMeta.vue'
import NotFound from './components/NotFound.vue'
import { loadUnlocked, unlock } from './escape'

// 包一层默认布局：文章正文上方挂日志头（频道 · 编号 · 日期），404 换成终端版，
// 顺带在每个页面读一次 escape/ 的解锁状态，访问 /escape/ 下的页面时直接解锁。
const Layout = DefaultTheme.Layout
const route = useRoute()

onMounted(() => {
  loadUnlocked()
  watch(
    () => route.path,
    (p) => {
      if (p.startsWith('/escape/')) unlock()
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
