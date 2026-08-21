# Transformer

1

## 路线图

<script setup>
import { data as roadmap } from '../../roadmap.data.ts'
const rows = roadmap['teardown/transformer'] || []
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
