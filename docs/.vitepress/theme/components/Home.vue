<script setup lang="ts">
import { data as log } from '../../../log.data'
import { CHANNELS, CHANNEL_META } from '../channels'
import Avatar from './Avatar.vue'
import LogList from './LogList.vue'

const count = (c: string) => log.filter((e) => e.channel === c).length
</script>

<template>
  <div class="sx-home">
    <section class="hero">
      <Avatar class="hero-avatar" animated />
      <div class="hero-text">
        <h1 class="hero-title">沙箱逃逸<span class="ext">.log</span></h1>
        <p class="hero-lead">在确定性的代码沙箱里，记录一些不确定的构建过程。</p>
        <p class="hero-sub">读源码、拆项目、记踩坑，<span class="nowrap">偶尔按一下 <kbd>Esc</kbd>。</span></p>
      </div>
    </section>

    <section class="channels" aria-label="频道">
      <a v-for="c in CHANNELS" :key="c" class="channel" :class="'c-' + c" :href="'/' + c + '/'">
        <span class="ch-head">
          <span class="ch-name">{{ c }}</span>
          <span class="ch-count">{{ count(c) }} 篇</span>
        </span>
        <span class="ch-title">{{ CHANNEL_META[c].desc }}</span>
        <span class="ch-long">{{ CHANNEL_META[c].long }}</span>
      </a>
    </section>

    <section class="feed">
      <h2 class="sec">最近更新</h2>
      <LogList pinned />
    </section>
  </div>
</template>

<style scoped>
.sx-home {
  max-width: 920px;
  margin: 0 auto;
  padding: 64px 24px 96px;
}

/* ---- hero：头像 + 名字 + 两行字 ---- */
.hero { display: flex; align-items: center; gap: 32px; }
.hero-avatar { width: 128px; height: 128px; flex-shrink: 0; }
.hero-title {
  margin: 0;
  font-size: 44px; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
.ext { font-family: var(--vp-font-family-mono); font-weight: 600; color: var(--vp-c-brand-1); }
.hero-lead { margin: 14px 0 0; font-size: 17px; line-height: 1.6; color: var(--vp-c-text-1); }
.hero-sub { margin: 4px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--vp-c-text-2); }
.nowrap { white-space: nowrap; }
kbd {
  font-family: var(--vp-font-family-mono); font-size: 0.8em;
  padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); border-bottom-width: 2px;
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1);
}

/* ---- 三个频道 ---- */
.channels {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  margin: 52px 0 64px;
}
.channel {
  display: flex; flex-direction: column; gap: 8px;
  padding: 18px 18px 20px; border-radius: 8px;
  border: 1px solid var(--vp-c-divider); border-top: 2px solid var(--sx-c);
  background: var(--vp-c-bg-soft);
  color: inherit; text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}
.channel:hover { border-color: var(--sx-c); transform: translateY(-2px); }
.ch-head { display: flex; align-items: baseline; justify-content: space-between; }
.ch-name { font-family: var(--vp-font-family-mono); font-size: 15px; font-weight: 600; color: var(--sx-c); }
.ch-count { font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-text-3); }
.ch-title { font-size: 15.5px; font-weight: 600; color: var(--vp-c-text-1); }
.ch-long { font-size: 13.5px; line-height: 1.75; color: var(--vp-c-text-2); }

.sec {
  margin: 0 0 14px; font-family: var(--vp-font-family-mono);
  font-size: 13px; font-weight: 600; color: var(--vp-c-text-3); letter-spacing: 0.04em;
}

@media (max-width: 760px) {
  .channels { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .sx-home { padding: 36px 16px 72px; }
  .hero { gap: 18px; }
  .hero-avatar { width: 80px; height: 80px; }
  .hero-title { font-size: 32px; }
  .hero-lead { font-size: 15.5px; }
  .channels { margin: 36px 0 48px; }
}
</style>
