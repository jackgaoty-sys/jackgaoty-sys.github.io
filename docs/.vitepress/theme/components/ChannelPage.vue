<script setup lang="ts">
import { data as roadmap } from '../../../roadmap.data'
import { VISIBLE_SERIES } from '../../series'
import { CHANNEL_META, type Channel } from '../channels'
import LogList from './LogList.vue'

const props = defineProps<{ channel: Channel }>()
const meta = CHANNEL_META[props.channel]

// 系列卡片上的进度条：已写 / 路线图总数，画成 [■■□□□□]
const progress = (dir: string) => {
  const rows = roadmap[dir] || []
  const done = rows.filter((r) => r.link).length
  return { done, total: rows.length, bar: '■'.repeat(done) + '□'.repeat(rows.length - done) }
}
</script>

<template>
  <div class="sx-channel" :class="'c-' + channel">
    <header class="head">
      <h1 class="title">{{ channel }}<span class="slash">/</span></h1>
      <p class="subtitle">{{ meta.desc }}</p>
      <p class="desc">{{ meta.long }}</p>
    </header>

    <section v-if="channel === 'dump'" class="series">
      <h2 class="sec">series/</h2>
      <div class="cards">
        <a v-for="s in VISIBLE_SERIES" :key="s.dir" class="card" :href="'/' + s.dir + '/'">
          <span class="card-title">{{ s.title }}</span>
          <span class="card-intro">{{ s.intro }}</span>
          <span class="card-bar">
            [{{ progress(s.dir).bar }}] {{ progress(s.dir).done }}/{{ progress(s.dir).total }}
          </span>
        </a>
      </div>
      <h2 class="sec">entries/</h2>
    </section>

    <LogList :channel="channel" />
  </div>
</template>

<style scoped>
.sx-channel { max-width: 920px; margin: 0 auto; padding: 56px 24px 96px; }

.head { margin-bottom: 36px; }
.title {
  margin: 0; font-family: var(--vp-font-family-mono);
  font-size: 44px; line-height: 1.2; font-weight: 700; color: var(--sx-c);
}
.slash { color: var(--vp-c-text-3); font-weight: 400; }
.subtitle { margin: 10px 0 0; font-size: 18px; font-weight: 600; color: var(--vp-c-text-1); }
.desc { margin: 6px 0 0; max-width: 40rem; font-size: 15.5px; line-height: 1.8; color: var(--vp-c-text-2); }

.sec {
  margin: 0 0 14px; font-family: var(--vp-font-family-mono);
  font-size: 13px; font-weight: 600; color: var(--vp-c-text-3); letter-spacing: 0.04em;
}
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-bottom: 40px; }
.card {
  display: flex; flex-direction: column; gap: 8px;
  padding: 18px; border-radius: 8px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  color: inherit; text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}
.card:hover { border-color: var(--sx-c); transform: translateY(-2px); }
.card-title { font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); }
.card-intro { flex: 1; font-size: 13.5px; line-height: 1.7; color: var(--vp-c-text-2); }
.card-bar { font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--sx-c); letter-spacing: 0.06em; }

@media (max-width: 640px) {
  .sx-channel { padding: 32px 16px 72px; }
  .title { font-size: 34px; }
}
</style>
