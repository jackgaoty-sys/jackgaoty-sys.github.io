<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as log } from '../../../log.data'
import { pad } from '../channels'
import StageTag from './StageTag.vue'

// 文章正文上方的一行「日志头」：dump #001 · [wip] · 2026-08-18 · 约 3 分钟 · 所属系列
const route = useRoute()
const path = computed(() => route.path.replace(/\.html$/, ''))
const entry = computed(() => log.find((e) => e.url === path.value))
</script>

<template>
  <div v-if="entry" class="sx-meta" :class="'c-' + entry.channel">
    <p class="cmd"><span class="ps">$</span> cat {{ entry.url.slice(1) }}.md</p>
    <p class="tags">
      <a class="ch" :href="'/' + entry.channel + '/'">{{ entry.channel }}</a>
      <span class="no">#{{ pad(entry.no) }}</span>
      <StageTag v-if="entry.stage" :stage="entry.stage" />
      <span v-if="entry.date">{{ entry.date }}</span>
      <span>约 {{ entry.minutes }} 分钟</span>
      <span v-if="entry.series" class="series">{{ entry.series }}</span>
    </p>
  </div>
  <div v-else-if="path === '/readme'" class="sx-meta">
    <p class="cmd"><span class="ps">$</span> cat README.md</p>
    <p class="tags"><span class="ch">readme</span><span class="no">#000</span><span>pinned</span></p>
  </div>
</template>

<style scoped>
.sx-meta { margin-bottom: 20px; font-family: var(--vp-font-family-mono); }
.cmd { margin: 0 0 6px; font-size: 12.5px; color: var(--vp-c-text-3); overflow-wrap: anywhere; }
.ps { color: var(--vp-c-brand-1); margin-right: 4px; }
.tags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin: 0; font-size: 13px; color: var(--vp-c-text-2); }
.ch {
  font-weight: 600; color: var(--sx-c, var(--vp-c-text-1)); text-decoration: none;
  padding: 1px 8px; border-radius: 4px; border: 1px solid currentColor;
}
.no { color: var(--vp-c-text-1); font-weight: 600; }
.series { padding: 0 6px; border-radius: 3px; border: 1px solid var(--vp-c-divider); font-size: 12px; }
</style>
