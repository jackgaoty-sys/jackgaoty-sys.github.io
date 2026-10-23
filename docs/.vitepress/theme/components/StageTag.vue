<script setup lang="ts">
import { STAGE_META, type Stage } from '../channels'

// 笔记成熟度标签，长得像日志级别：[draft] [wip] [stable]，悬停看说明
defineProps<{ stage: Stage }>()
</script>

<template>
  <span class="sx-stage" :class="'s-' + stage" :title="STAGE_META[stage]">[{{ stage }}]</span>
</template>

<style scoped>
.sx-stage {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: help;
}
.s-draft { color: var(--vp-c-text-3); }
.s-wip { color: var(--c-wip); }
.s-stable { color: var(--vp-c-brand-1); }
</style>
