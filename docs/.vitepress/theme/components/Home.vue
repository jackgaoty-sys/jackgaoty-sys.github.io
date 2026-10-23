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
        <p class="hero-tag">读源码、拆项目、记踩坑；<span class="nowrap">偶尔按一下 <kbd>Esc</kbd>。</span></p>
      </div>
    </section>

    <section class="term" aria-label="频道">
      <div class="term-bar" aria-hidden="true"><i /><i /><i /><span>tat@sandbox: ~</span></div>
      <div class="term-body">
        <p class="ln" style="--d: 0"><span class="ps">$</span> whoami</p>
        <p class="ln out" style="--d: 1">
          TAT · AI Agent 工程 / 交付方向 <a class="more" href="/about">cat about.md →</a>
        </p>
        <p class="ln" style="--d: 2"><span class="ps">$</span> ls -l channels/</p>
        <a
          v-for="(c, i) in CHANNELS"
          :key="c"
          class="ln out ch"
          :class="'c-' + c"
          :href="'/' + c + '/'"
          :style="{ '--d': 3 + i }"
        >
          <span class="perm">drwxr-xr-x</span>
          <span class="cnt">{{ count(c) }}</span>
          <span class="name">{{ c }}/</span>
          <span class="desc"># {{ CHANNEL_META[c].desc }}</span>
        </a>
        <p class="ln" style="--d: 6"><span class="ps">$</span> tail -f sandbox-escape.log<span class="cursor" /></p>
      </div>
    </section>

    <section class="feed">
      <LogList pinned />
    </section>
  </div>
</template>

<style scoped>
.sx-home {
  max-width: 920px;
  margin: 0 auto;
  padding: 56px 24px 96px;
}

/* ---- hero：头像 + 名字 ---- */
.hero { display: flex; align-items: center; gap: 28px; }
.hero-avatar { width: 132px; height: 132px; flex-shrink: 0; }
.hero-title {
  margin: 0;
  font-size: 46px; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
.ext { font-family: var(--vp-font-family-mono); font-weight: 600; color: var(--vp-c-brand-1); }
.hero-tag { margin: 10px 0 0; font-size: 16px; color: var(--vp-c-text-2); }
.nowrap { white-space: nowrap; }
kbd {
  font-family: var(--vp-font-family-mono); font-size: 0.8em;
  padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); border-bottom-width: 2px;
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1);
}

/* ---- 终端：频道入口 ---- */
.term {
  margin: 40px 0 56px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--sx-term-bg);
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02), 0 24px 60px -30px var(--sx-glow);
}
.term-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 14px; border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-text-3);
}
.term-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--vp-c-divider); }
.term-bar span { margin-left: 8px; }
.term-body { padding: 16px 20px 18px; font-family: var(--vp-font-family-mono); font-size: 14px; }

.ln {
  display: block; margin: 0; line-height: 1.95;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: var(--vp-c-text-1);
  animation: sx-line 0.01s calc(0.25s + var(--d) * 0.22s) both;
}
.out { color: var(--vp-c-text-2); }
.ps { color: var(--vp-c-brand-1); margin-right: 4px; user-select: none; }
.more { margin-left: 10px; color: var(--vp-c-text-3); text-decoration: none; }
.more:hover { color: var(--vp-c-brand-1); }

.ch { text-decoration: none; border-radius: 4px; margin: 0 -8px; padding: 0 8px; transition: background 0.15s; }
.ch:hover { background: var(--vp-c-bg-soft); }
.ch:hover .desc { color: var(--vp-c-text-1); }
.perm { color: var(--vp-c-text-3); }
.cnt { display: inline-block; width: 3ch; text-align: right; margin: 0 14px 0 6px; color: var(--vp-c-text-3); }
.name { display: inline-block; width: 8ch; font-weight: 600; color: var(--sx-c); }
.desc { color: var(--vp-c-text-2); transition: color 0.15s; }

.cursor {
  display: inline-block; width: 0.6em; height: 1.1em; margin-left: 6px;
  vertical-align: -0.2em; background: var(--vp-c-brand-1);
  animation: sx-blink 1.1s steps(1) infinite;
}

@keyframes sx-line { from { opacity: 0; } }
@keyframes sx-blink { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .ln, .cursor { animation: none; }
}

@media (max-width: 640px) {
  .sx-home { padding: 32px 16px 72px; }
  .hero { gap: 18px; }
  .hero-avatar { width: 84px; height: 84px; }
  .hero-title { font-size: 32px; }
  .hero-tag { font-size: 14.5px; }
  .term { margin: 28px 0 40px; }
  .term-body { padding: 14px; font-size: 13px; }
  .perm { display: none; }
  .cnt { margin-left: 0; }
}
</style>
