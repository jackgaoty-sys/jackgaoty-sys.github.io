<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { data as log } from '../../../log.data'
import { CHANNELS, pad, type Channel } from '../channels'
import { unlocked } from '../escape'
import StageTag from './StageTag.vue'

const props = defineProps<{
  /** 只看某个频道；不传就是全站，并显示频道筛选 */
  channel?: Channel
  /** 置顶 #000 README */
  pinned?: boolean
  /** 首页用：接在终端的 tail -f 后面，条目一行行「打印」出来 */
  stream?: boolean
  /** 首页用：escape/ 没解锁之前，它的筛选按钮和条目都不出现 */
  hideLocked?: boolean
}>()

const locked = computed(() => !!props.hideLocked && !unlocked.value)
const channels = computed(() => (locked.value ? CHANNELS.filter((c) => c !== 'escape') : CHANNELS))
const visible = computed(() => (locked.value ? log.filter((e) => e.channel !== 'escape') : log))

const active = ref<Channel | 'all'>(props.channel ?? 'all')
const shown = computed(() =>
  active.value === 'all' ? visible.value : visible.value.filter((e) => e.channel === active.value)
)
const count = (c: Channel | 'all') =>
  c === 'all' ? visible.value.length : visible.value.filter((e) => e.channel === c).length

// 打印动画纯 CSS（服务端渲染出来就会播），这里只负责播完后摘掉 class，
// 免得之后切换频道筛选时新出现的条目又排队等一遍
const printing = ref(!!props.stream)
const lead = computed(() => (props.pinned && active.value === 'all' ? 1 : 0))
onMounted(() => {
  if (printing.value) setTimeout(() => (printing.value = false), 1300 + (log.length + 3) * 60)
  canPeek.value = matchMedia('(hover: hover) and (min-width: 960px)').matches
})

// 悬停预览：鼠标停在某条上，旁边浮出这篇的分享卡片（/og/<网址>.png，构建时生成）。
// 只在能悬停的大屏上开；图片加载失败（dev 下还没生成）就记下来不再显示。
const PEEK_W = 360
const PEEK_H = 189
const canPeek = ref(false)
const peek = ref<{ src: string; x: number; y: number } | null>(null)
const missing = new Set<string>()

function onMove(ev: MouseEvent, url: string) {
  const src = '/og' + url + '.png'
  if (!canPeek.value || missing.has(src)) return
  let x = ev.clientX + 24
  let y = ev.clientY + 18
  if (x + PEEK_W > innerWidth - 16) x = ev.clientX - 24 - PEEK_W
  if (y + PEEK_H > innerHeight - 16) y = innerHeight - 16 - PEEK_H
  peek.value = { src, x, y }
}
function onPeekError() {
  if (peek.value) missing.add(peek.value.src)
  peek.value = null
}
</script>

<template>
  <div class="sx-log" :class="{ printing }">
    <div v-if="!channel" class="tabs" role="group" aria-label="按频道筛选">
      <button
        v-for="c in ['all', ...channels] as const"
        :key="c"
        type="button"
        :aria-pressed="active === c"
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
        <a class="row" :class="'c-' + e.channel" :href="e.url" @mousemove="onMove($event, e.url)" @mouseleave="peek = null">
          <span class="r-date">{{ e.date ?? '----------' }}</span>
          <span :class="['r-ch', 'c-' + e.channel]">{{ e.channel }}</span>
          <span class="r-no">#{{ pad(e.no) }}</span>
          <span class="r-main">
            <span class="r-title">{{ e.title }}</span>
            <StageTag v-if="e.stage" :stage="e.stage" />
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

    <Teleport to="body">
      <img
        v-if="peek"
        class="sx-peek"
        :src="peek.src"
        alt=""
        :width="PEEK_W"
        :height="PEEK_H"
        :style="{ transform: `translate(${peek.x}px, ${peek.y}px)` }"
        @error="onPeekError"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.sx-log { font-family: var(--vp-font-family-mono); }

.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tab {
  font-size: 13px; padding: 4px 10px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2);
  cursor: pointer;
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
/* 悬停时左边亮一道频道色（trace 蓝 / dump 绿 / escape 橙），一眼看出这条属于哪个频道 */
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

.sx-peek {
  position: fixed; top: 0; left: 0; z-index: 100;
  width: 360px; height: 189px;
  border-radius: 8px; border: 1px solid var(--vp-c-divider);
  box-shadow: 0 18px 50px -12px rgba(0, 0, 0, 0.55);
  pointer-events: none;
  animation: sx-peek-in 0.18s ease-out both;
}
@keyframes sx-peek-in { from { opacity: 0; } }

/* ---- tail -f：首页终端最后一行出现后（约 0.7s），条目从左往右一行行「打印」出来，1 秒多就出齐 ---- */
.printing .tabs { animation: sx-fade 0.25s 0.75s both; }
.printing .rows > li { animation: sx-print 0.3s calc(0.85s + var(--i) * 0.06s) steps(12, end) both; }

@keyframes sx-fade { from { opacity: 0; } }
@keyframes sx-print {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .printing .tabs, .printing .rows > li { animation: none; }
}

/* 触屏：筛选按钮撑到 44px 高 */
@media (pointer: coarse) {
  .tab { min-height: 44px; padding: 0 14px; }
}

@media (max-width: 640px) {
  .row { grid-template-columns: auto auto 1fr; gap: 4px 10px; padding: 14px 8px 14px 10px; }
  .r-no { justify-self: end; }
  .r-main { grid-column: 1 / -1; }
}
</style>
