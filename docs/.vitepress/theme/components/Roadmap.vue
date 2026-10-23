<script setup lang="ts">
import { data as roadmap } from '../../../roadmap.data'

// 系列页里的路线图表格：已写的文章 + series.ts 里还没写的占位项
const props = defineProps<{ dir: string }>()
const rows = roadmap[props.dir] || []
const MARK: Record<string, string> = { 未开始: '[ ]', 进行中: '[~]', 完成: '[x]' }
</script>

<template>
  <table class="roadmap">
    <thead>
      <tr><th>#</th><th>主题</th><th>源码落点</th><th>状态</th></tr>
    </thead>
    <tbody>
      <tr v-for="(r, i) in rows" :key="r.title" :class="{ pending: !r.link }">
        <td class="num">{{ String(i + 1).padStart(2, '0') }}</td>
        <td>
          <a v-if="r.link" :href="r.link">{{ r.title }}</a>
          <span v-else>{{ r.title }}</span>
        </td>
        <td><code v-if="r.source">{{ r.source }}</code><span v-else class="dim">—</span></td>
        <td class="status" :data-s="r.status">{{ MARK[r.status] || '' }} {{ r.status }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.roadmap { display: table; width: 100%; }
.num, .status { font-family: var(--vp-font-family-mono); font-size: 13px; white-space: nowrap; }
.num, .dim, .pending { color: var(--vp-c-text-3); }
.status[data-s='进行中'] { color: var(--c-trace); }
.status[data-s='完成'] { color: var(--vp-c-brand-1); }
</style>
