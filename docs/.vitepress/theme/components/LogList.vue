<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as log } from '../../../log.data'
import { CHANNELS, pad, type Channel } from '../channels'

const props = defineProps<{
  /** 只看某个频道；不传就是全站，并显示频道筛选 */
  channel?: Channel
  /** 置顶 #000 README */
  pinned?: boolean
}>()

const active = ref<Channel | 'all'>(props.channel ?? 'all')
const shown = computed(() => (active.value === 'all' ? log : log.filter((e) => e.channel === active.value)))
const count = (c: Channel | 'all') => (c === 'all' ? log.length : log.filter((e) => e.channel === c).length)
</script>

<template>
  <div class="sx-log">
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
      <li v-if="pinned && active === 'all'">
        <a class="row pinned" href="/readme">
          <span class="r-date">pinned</span>
          <span class="r-ch">readme</span>
          <span class="r-no">#000</span>
          <span class="r-main">
            <span class="r-title">README.md <span class="todo">(TODO)</span></span>
            <span class="r-ex">这里写什么、为什么写，以及三个频道分别装什么。</span>
          </span>
        </a>
      </li>
      <li v-for="e in shown" :key="e.url">
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
      <li v-if="!shown.length" class="note">
        <span class="lvl">[info]</span> {{ active }}/ 还没有条目 —— 第一篇在路上
      </li>
      <li v-else class="note eof">-- eof · {{ shown.length }} {{ shown.length > 1 ? 'entries' : 'entry' }} --</li>
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
.todo { font-family: var(--vp-font-family-mono); font-size: 12px; font-weight: 400; color: var(--vp-c-text-3); }
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

@media (max-width: 640px) {
  .row { grid-template-columns: auto auto 1fr; gap: 4px 10px; padding: 14px 8px 14px 10px; }
  .r-no { justify-self: end; }
  .r-main { grid-column: 1 / -1; }
}
</style>
