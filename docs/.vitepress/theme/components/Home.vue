<script setup lang="ts">
import { data as log } from '../../../log.data'
import { CHANNELS, CHANNEL_META } from '../channels'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Avatar from './Avatar.vue'
import LogList from './LogList.vue'
import { unlock, unlocked } from '../escape'

const count = (c: string) => log.filter((e) => e.channel === c).length

// Esc 彩蛋：escape/ 默认藏着，头像是一个封闭的沙箱，ls 里只列两个目录（但 total 3 —— 留给细心的人的提示）。
// 按 Esc（或点头像、点标语里的 Esc 键帽）：
// - 第一次：沙箱右上角被冲开，光标逃到框外、不再回来；ls 里 escape/ 那一行补出来；导航栏多出 escape；
//   终端回显 ^[（真实终端里按 Esc 就是这么显示的）。
// - 之后再按：光标在框外闪几下回应。
const avatar = ref<InstanceType<typeof Avatar>>()
const echoed = ref(false) // 终端里回显过 ^[
const revealed = ref(false) // 这一次访问里刚解锁：escape/ 那一行用打字动画补出来
async function escape() {
  echoed.value = true
  if (unlocked.value) {
    avatar.value?.poke()
    return
  }
  // 先让头像挂上「冲出去」的动画，等 DOM 更新完再解锁（给 <html> 加 class）——
  // 两者同一帧生效，光标才是从框里冲出去，而不是先闪到框外再播动画
  avatar.value?.breakOut()
  revealed.value = true
  await nextTick()
  unlock()
  document.documentElement.classList.add('sx-just-unlocked')
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  // 搜索框、手机菜单开着的时候，Esc 是在关它们，别抢
  if (document.querySelector('.VPLocalSearchBox, .VPNavScreen')) return
  const el = document.activeElement
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
  escape()
}
// 捕获阶段监听：赶在搜索框自己的 Esc 处理（会把搜索框关掉）之前判断它是否开着
onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true))

// 点 tail -f 那一行 = 订阅：把 RSS 地址复制到剪贴板，终端里回显一行结果。
// 剪贴板不可用（非 https、浏览器拒绝）时就把地址直接摆出来让人自己复制。
const feedUrl = 'https://jackgaoty-sys.github.io/feed.xml'
const subscribed = ref<'copied' | 'manual' | null>(null)
async function subscribe() {
  try {
    await navigator.clipboard.writeText(feedUrl)
    subscribed.value = 'copied'
  } catch {
    subscribed.value = 'manual'
  }
}

// 闪烁光标只挂在终端最后一行上
const lastLine = computed(() => (echoed.value ? 'echo' : subscribed.value ? 'sub' : 'tail'))
</script>

<template>
  <div class="sx-home">
    <section class="hero">
      <button class="hero-avatar" type="button" aria-label="逃出沙箱" @click="escape">
        <Avatar ref="avatar" animated />
      </button>
      <div class="hero-text">
        <h1 class="hero-title">沙箱逃逸<span class="ext">.log</span></h1>
        <p class="hero-tag">
          给 Agent 造沙箱的人，<span class="nowrap">偶尔也想按一下 <kbd role="button" tabindex="0" title="真的可以按" @click="escape" @keydown.enter="escape">Esc</kbd>。</span>
        </p>
      </div>
    </section>

    <section class="term" aria-label="频道">
      <div class="term-bar" aria-hidden="true"><i /><i /><i /><span>tat@sandbox: ~</span></div>
      <div class="term-body">
        <p class="ln" style="--d: 0"><span class="ps">$</span> whoami</p>
        <p class="ln out wrap" style="--d: 1">
          TAT · 写代码的，主要折腾 AI Agent 与系统工程 <a class="more" href="/about">cat about.md →</a>
        </p>
        <p class="ln" style="--d: 2"><span class="ps">$</span> ls -l channels/</p>
        <p class="ln out" style="--d: 3">total {{ CHANNELS.length }}</p>
        <a
          v-for="(c, i) in CHANNELS"
          :key="c"
          class="ln out ch"
          :class="['c-' + c, { lock: c === 'escape', reveal: c === 'escape' && revealed }]"
          :href="'/' + c + '/'"
          :style="{ '--d': 4 + i }"
        >
          <span class="perm">drwxr-xr-x</span>
          <span class="cnt">{{ count(c) }}</span>
          <span class="name">{{ c }}/</span>
          <span class="desc"># {{ CHANNEL_META[c].desc }}</span>
        </a>
        <button class="ln tail" type="button" style="--d: 7" title="订阅更新（RSS）" @click="subscribe">
          <span class="ps">$</span> tail -f sandbox-escape.log<span v-if="lastLine === 'tail'" class="cursor" /><span class="hint">↵ 订阅</span>
        </button>
        <p v-if="subscribed" class="ln out sub">
          <template v-if="subscribed === 'copied'">已复制订阅地址，粘贴到 RSS 阅读器即可：</template>
          <template v-else>把这个地址粘贴到 RSS 阅读器：</template>
          <a :href="feedUrl" target="_blank" rel="noopener">{{ feedUrl }}</a><span v-if="lastLine === 'sub'" class="cursor" />
        </p>
        <p v-if="echoed" class="ln echo" title="^[ 是终端里按下 Esc 键时的回显">
          <span class="ps">$</span> ^[<span class="cursor" />
        </p>
      </div>
    </section>

    <section class="feed">
      <LogList pinned stream hide-locked />
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
.hero-avatar {
  width: 132px; height: 132px; flex-shrink: 0;
  padding: 0; border-radius: 12px; cursor: pointer;
  transition: transform 0.2s;
}
.hero-avatar:hover { transform: scale(1.04); }
.hero-avatar:active { transform: scale(0.97); }
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
  cursor: pointer; transition: border-color 0.2s, transform 0.1s;
}
kbd:hover { border-color: var(--vp-c-brand-1); }
kbd:active { transform: translateY(1px); border-bottom-width: 1px; }

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

/* tail -f：可点，悬停时右侧提示「↵ 订阅」 */
.tail {
  text-align: left; font: inherit; cursor: pointer;
  border-radius: 4px; margin: 0 -8px; padding: 0 8px; width: calc(100% + 16px);
  transition: background 0.15s;
}
.tail:hover { background: var(--vp-c-bg-soft); }
.hint { float: right; font-size: 12px; color: var(--vp-c-text-3); opacity: 0; transition: opacity 0.15s; }
.tail:hover .hint, .tail:focus-visible .hint { opacity: 1; color: var(--vp-c-brand-1); }
.sub { white-space: normal; animation: none; }

/* escape/ 刚解锁时像被敲出来一样补上，橙色底闪一下（没解锁时的隐藏规则在文件末尾的非 scoped 块里） */
.reveal { animation: sx-type 0.45s 0.25s steps(18, end) both, sx-flash 1.8s 0.25s ease-out both; }
@keyframes sx-type {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes sx-flash {
  0%, 35% { background: color-mix(in srgb, var(--c-escape) 18%, transparent); }
}

/* Esc 的回显 ^[ */
.echo { animation: none; }
.sub a { color: var(--vp-c-brand-1); word-break: break-all; }

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
  /* whoami 那行比较长，窄屏上允许折行，别把 about 链接截掉 */
  .wrap { white-space: normal; line-height: 1.7; padding: 3px 0; }
  .wrap .more { margin-left: 0; white-space: nowrap; }
}
</style>

<style>
/* escape/ 没解锁之前不在 ls 里（见 theme/escape.ts）。
   挂在 <html class="sx-unlocked"> 上，所以不能放进 scoped 块 —— Vue 的 :global(a) b 会把 b 整个丢掉。 */
html:not(.sx-unlocked) .sx-home .term .ch.lock { display: none; }
</style>
