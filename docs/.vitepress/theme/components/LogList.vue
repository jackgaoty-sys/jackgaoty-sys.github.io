<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { data as log } from '../../../log.data'
import { CHANNELS, pad, type Channel } from '../channels'

const props = defineProps<{
  /** 只看某个频道；不传就是全站，并显示频道筛选 */
  channel?: Channel
  /** 置顶 #000 README */
  pinned?: boolean
  /** 首页用：接在终端的 tail -f 后面，条目一行行「打印」出来 */
  stream?: boolean
}>()

const active = ref<Channel | 'all'>(props.channel ?? 'all')
const shown = computed(() => (active.value === 'all' ? log : log.filter((e) => e.channel === active.value)))
const count = (c: Channel | 'all') => (c === 'all' ? log.length : log.filter((e) => e.channel === c).length)

// 打印动画纯 CSS（服务端渲染出来就会播），这里只负责播完后摘掉 class，
// 免得之后切换频道筛选时新出现的条目又排队等一遍
const printing = ref(!!props.stream)
const lead = computed(() => (props.pinned && active.value === 'all' ? 1 : 0))
onMounted(() => {
  if (printing.value) setTimeout(() => (printing.value = false), 1800 + (log.length + 3) * 140)
})
</script>

<template>
  <div class="sx-log" :class="{ printing }">
    <div v-if="!channel" class="tabs" role="tablist" aria-label="按频道筛选">
      <button
        v-for="c in ['all', ...CHANNELS] as const"
        :key="c"
        role="tab"
        :aria-selected="active === c"
        :class="['tab', 'c-' + c, { on: active === c }]"
        @click="active = c"
      >
        {{ c }}<span class="tab-n">{{ count(c) }}</span>
      </button>
    </div>

    <ol class="rows">
      <li v-if="pinned && active === 'all'" style="--i: 0">
        <a class="row pinned" href="/readme">
          <span class="r-date">pinned</span>
          <span class="r-ch">readme</span>
          <span class="r-no">#000</span>
          <span class="r-main">
            <span class="r-title">README.md</span>
            <span class="r-ex">本站的记录范围、三个频道的划分，以及文章编号规则。</span>
          </span>
        </a>
      </li>
      <li v-for="(e, i) in shown" :key="e.url" :style="{ '--i': lead + i }">
        <a class="row" :href="e.url">
          <span class="r-date">{{ e.date ?? '----------' }}</span>
          <span :class="['r-ch', 'c-' + e.channel]">{{ e.channel }}</span>
          <span class="r-no">#{{ pad(e.no) }}</span>
          <span class="r-main">
            <span class="r-title">{{ e.title }}</span>
            <span v-if="e.series" class="r-series">{{ e.series }}</span>
            <span v-if="e.excerpt" class="r-ex">{{ e.excerpt }}</span>
          </span>
        </a>
      </li>
      <li v-if="!shown.length" class="note" :style="{ '--i': lead }">
        <span class="lvl">[info]</span> {{ active }}/ 还没有条目 —— 第一篇在路上
      </li>
      <li v-else class="note eof" :style="{ '--i': lead + shown.length }">
        -- eof · {{ shown.length }} {{ shown.length > 1 ? 'entries' : 'entry' }} --
      </li>
    </ol>
  </div>
</template>

<style scoped>
.sx-log { font-family: var(--vp-font-family-mono); }

.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tab {
  font-size: 13px; padding: 4px 10px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2);
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.tab:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-text-3); }
.tab.on { color: var(--sx-c); border-color: var(--sx-c); background: var(--vp-c-bg-soft); }
.tab-n { margin-left: 6px; font-size: 11px; color: var(--vp-c-text-3); }
.tab.c-all { --sx-c: var(--vp-c-brand-1); }

.rows { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--vp-c-divider); }

.row {
  display: grid;
  grid-template-columns: 96px 64px 46px 1fr;
  align-items: baseline;
  gap: 0 14px;
  padding: 14px 12px 14px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  border-left: 2px solid transparent;
  color: inherit;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.row:hover { background: var(--vp-c-bg-soft); border-left-color: var(--sx-c, var(--vp-c-brand-1)); }
.row:hover .r-title { color: var(--vp-c-brand-1); }

.r-date, .r-no { font-size: 12.5px; color: var(--vp-c-text-3); font-variant-numeric: tabular-nums; }
.r-ch { font-size: 12.5px; font-weight: 600; color: var(--sx-c, var(--vp-c-text-2)); }
.pinned { --sx-c: var(--vp-c-text-1); }
.pinned .r-date { color: var(--vp-c-brand-1); }

.r-main { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; min-width: 0; }
.r-title {
  font-family: var(--vp-font-family-base);
  font-size: 15.5px; font-weight: 600; color: var(--vp-c-text-1);
  transition: color 0.15s;
}
.r-series {
  font-size: 11.5px; padding: 0 6px; border-radius: 3px;
  border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2);
}
.r-ex {
  flex-basis: 100%;
  font-family: var(--vp-font-family-base);
  font-size: 13.5px; line-height: 1.7; color: var(--vp-c-text-2);
}

.note { padding: 14px; font-size: 13px; color: var(--vp-c-text-3); }
.lvl { color: var(--c-trace); }
.eof { text-align: center; font-size: 12px; }

/* ---- tail -f：首页终端最后一行出现后（约 1.6s），条目从左往右一行行「打印」出来 ---- */
.printing .tabs { animation: sx-fade 0.3s 1.55s both; }
.printing .rows > li { animation: sx-print 0.42s calc(1.75s + var(--i) * 0.14s) steps(14, end) both; }

@keyframes sx-fade { from { opacity: 0; } }
@keyframes sx-print {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .printing .tabs, .printing .rows > li { animation: none; }
}

@media (max-width: 640px) {
  .row { grid-template-columns: auto auto 1fr; gap: 4px 10px; padding: 14px 8px 14px 10px; }
  .r-no { justify-self: end; }
  .r-main { grid-column: 1 / -1; }
}
</style>
