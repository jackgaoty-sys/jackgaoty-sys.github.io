# Agent系统设计

从意图识别、任务规划到工具调用与结果验证，拆解 AI Agent 如何理解目标并完成任务。

## 路线图

<script setup>
import { data as roadmap } from '../../roadmap.data.ts'
const rows = roadmap['learn/agentic-system-design'] || []
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
