<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as log } from '../../../log.data'

// 文章末尾：这篇文章在 GitHub 上的提交历史 —— 它是怎么一步步改成现在这样的。
// 注意 GitHub 的文件历史不跟踪改名，文件挪过目录的话，挪之前的记录要在仓库里另查。
const REPO = 'https://github.com/jackgaoty-sys/jackgaoty-sys.github.io'

const route = useRoute()
const entry = computed(() => log.find((e) => e.url === route.path.replace(/\.html$/, '')))
</script>

<template>
  <a v-if="entry" class="sx-gitlog" :href="`${REPO}/commits/main/docs/${entry.path}`" target="_blank" rel="noopener">
    <span class="ps">$</span> git log -- {{ entry.path }}<span class="go">修订历史 ↗</span>
  </a>
</template>

<style scoped>
.sx-gitlog {
  display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
  margin: 48px 0 0; padding: 10px 14px;
  border: 1px solid var(--vp-c-divider); border-radius: 8px;
  background: var(--sx-term-bg);
  font-family: var(--vp-font-family-mono); font-size: 12.5px;
  color: var(--vp-c-text-2); text-decoration: none;
  overflow-wrap: anywhere;
  transition: border-color 0.2s;
}
.sx-gitlog:hover { border-color: var(--vp-c-brand-1); }
.ps { color: var(--vp-c-brand-1); }
.go { margin-left: auto; color: var(--vp-c-text-3); white-space: nowrap; }
.sx-gitlog:hover .go { color: var(--vp-c-brand-1); }
</style>
