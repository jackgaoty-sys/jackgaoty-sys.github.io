# 拆解 Pi Agent：学习笔记

源码来自 [earendil-works/pi](https://github.com/earendil-works/pi)，我 fork 了一份在
[jackgaoty-sys/pi-Learn-by-deconstructing](https://github.com/jackgaoty-sys/pi-Learn-by-deconstructing)。

这里记录我逐层拆解这个 Agent Harness 的过程 —— 不是抄文档，是自己读源码、自己推、自己写。

## 仓库地图

三层洋葱，从内到外：

```
packages/ai            最内层：把 OpenAI / Anthropic / Google 抹平成一套 API
      ↑
packages/agent         中间层：agent loop（多步循环 + 工具调用 + 上下文管理）
      ↑
packages/coding-agent  最外层：CLI 外壳、TUI、扩展、配置
```

其余包（tui / server / protocol / session-backends / telemetry / evals / client）暂时不看。

## 路线图

<script setup>
import { data as roadmap } from '../../roadmap.data.ts'
const rows = roadmap['teardown/pi'] || []
const ICON = { '未开始': '🔲', '进行中': '🚧', '完成': '✅' }
</script>

<table class="roadmap">
  <thead>
    <tr><th>#</th><th>主题</th><th>源码落点</th><th>状态</th></tr>
  </thead>
  <tbody>
    <tr v-for="(r, i) in rows" :key="r.title">
      <td>{{ i + 1 }}</td>
      <td>
        <a v-if="r.link" :href="r.link">{{ r.title }}</a>
        <span v-else class="pending">{{ r.title }}</span>
      </td>
      <td><code v-if="r.source">{{ r.source }}</code><span v-else>—</span></td>
      <td>{{ ICON[r.status] || '' }} {{ r.status }}</td>
    </tr>
  </tbody>
</table>

<style scoped>
.roadmap { display: table; width: 100%; }
.roadmap .pending { color: var(--vp-c-text-3); }
</style>

<!--
这张表和左侧「路线图」侧边栏来自同一份数据，不用手写：
- 已写的文章自动扫出来，标题取文件里的一级标题
- 还没写的条目在 docs/.vitepress/series.ts 的 pending 里
- 写好同编号的文件（如 01-xxx.md）会自动顶掉 '01 · ...' 那条占位

文章可选 frontmatter：
---
source: packages/agent/src/agent-loop.ts
status: 进行中
---
-->
