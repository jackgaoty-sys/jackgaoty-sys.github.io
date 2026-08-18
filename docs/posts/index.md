# 散篇

不成系列的短文。踩过的坑、想明白的问题、工具链上的小结论。

<script setup>
import { data as posts } from './posts.data.ts'
</script>

<div v-if="!posts.length" class="tip custom-block">
  <p class="custom-block-title">还没开始写</p>
  <p>第一篇在路上。成系列的内容在 <a href="/teardown/pi/">拆解 Pi Agent</a>。</p>
</div>

<ul v-else class="post-list">
  <li v-for="p in posts" :key="p.url">
    <a :href="p.url">{{ p.title }}</a>
    <span v-if="p.date" class="post-date">{{ p.date }}</span>
    <p v-if="p.summary" class="post-summary">{{ p.summary }}</p>
  </li>
</ul>

<style scoped>
.post-list { list-style: none; padding: 0; margin: 24px 0 0; }
.post-list li {
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.post-list a { font-size: 1.05rem; font-weight: 600; }
.post-date {
  margin-left: 10px;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}
.post-summary {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}
</style>

<!--
加文章只要在 docs/posts/ 下新建 md，第一行写 `# 标题`。
列表和侧边栏都会自动出现，不用改 config.ts。

可选 frontmatter：
---
title: 覆盖标题
date: 2026-08-17
---
有 date 的按时间倒序排在前面。
-->
