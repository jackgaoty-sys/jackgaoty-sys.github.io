<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vitepress'
import { data as log } from '../../../log.data'
import { CHANNELS, CHANNEL_META, pad } from '../channels'

// 404：终端里 cd 进一个不存在的目录。给出最像的几个页面，按 Esc（或点 cd ~）回首页。
// 访问的路径只在浏览器里才知道（404.html 是同一份静态页），所以挂载后再读。

interface Hit {
  url: string
  label: string
}

const router = useRouter()
const path = ref('')
const hits = ref<Hit[]>([])

const pages: Hit[] = [
  ...log.map((e) => ({ url: e.url, label: `${e.channel} #${pad(e.no)} · ${e.title}` })),
  ...CHANNELS.map((c) => ({ url: `/${c}/`, label: `${c}/ · ${CHANNEL_META[c].desc}` })),
  { url: '/readme', label: 'README.md' },
  { url: '/about', label: 'about.md' },
]

// 按路径里的词去匹配网址和标题，命中的词越长分越高；一个都没命中就给最近的几篇
function suggest(p: string): Hit[] {
  const words = p.toLowerCase().split(/[\/\-_.\s]+/).filter((w) => w.length >= 2)
  const scored = pages
    .map((h) => {
      const hay = (h.url + ' ' + h.label).toLowerCase()
      return { h, score: words.reduce((s, w) => s + (hay.includes(w) ? w.length : 0), 0) }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.h)
  return (scored.length ? scored : pages).slice(0, 3)
}

const goHome = () => router.go('/')
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && !document.querySelector('.VPLocalSearchBox')) goHome()
}

onMounted(() => {
  path.value = decodeURIComponent(location.pathname)
  hits.value = suggest(path.value)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="sx-404">
    <p class="code">exit <span>404</span></p>
    <div class="term">
      <div class="term-bar" aria-hidden="true"><i /><i /><i /><span>tat@sandbox: ~</span></div>
      <div class="term-body">
        <p><span class="ps">$</span> cd {{ path || '…' }}</p>
        <p class="err">zsh: no such file or directory: {{ path || '…' }}</p>
        <p><span class="ps">$</span> ls | grep 最像的</p>
        <a v-for="h in hits" :key="h.url" class="hit" :href="h.url">
          <span class="arrow">→</span> <span class="url">{{ h.url }}</span> <span class="label">{{ h.label }}</span>
        </a>
        <p>
          <span class="ps">$</span> <button class="home" type="button" @click="goHome">cd ~</button>
          <span class="tip">（或按 <kbd>Esc</kbd>）</span><span class="cursor" />
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sx-404 { max-width: 760px; margin: 0 auto; padding: 72px 24px 96px; }

.code {
  margin: 0 0 20px; font-family: var(--vp-font-family-mono);
  font-size: 15px; color: var(--vp-c-text-3);
}
.code span { font-size: 56px; font-weight: 600; color: var(--c-escape); margin-left: 10px; letter-spacing: -0.02em; }

.term {
  border: 1px solid var(--vp-c-divider); border-radius: 10px;
  background: var(--sx-term-bg); overflow: hidden;
  box-shadow: 0 24px 60px -30px var(--sx-glow);
}
.term-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 14px; border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-text-3);
}
.term-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--vp-c-divider); }
.term-bar span { margin-left: 8px; }
.term-body { padding: 16px 20px 18px; font-family: var(--vp-font-family-mono); font-size: 14px; line-height: 1.95; }
.term-body p { margin: 0; overflow-wrap: anywhere; }

.ps { color: var(--vp-c-brand-1); margin-right: 4px; }
.err { color: var(--c-escape); }

.hit {
  display: flex; gap: 10px; align-items: baseline;
  margin: 0 -8px; padding: 0 8px; border-radius: 4px;
  color: var(--vp-c-text-2); text-decoration: none;
  transition: background 0.15s;
}
.hit:hover { background: var(--vp-c-bg-soft); }
.hit:hover .url { color: var(--vp-c-brand-1); }
.arrow { color: var(--vp-c-text-3); }
.url { color: var(--vp-c-text-1); white-space: nowrap; }
.label {
  font-family: var(--vp-font-family-base); font-size: 13px; color: var(--vp-c-text-3);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.home {
  font: inherit; color: var(--vp-c-brand-1); cursor: pointer;
  text-decoration: underline; text-underline-offset: 3px;
}
.tip { color: var(--vp-c-text-3); font-size: 12.5px; }
kbd {
  font-family: var(--vp-font-family-mono); font-size: 11px;
  padding: 0 5px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); border-bottom-width: 2px;
}
.cursor {
  display: inline-block; width: 0.6em; height: 1.1em; margin-left: 6px;
  vertical-align: -0.2em; background: var(--vp-c-brand-1);
  animation: sx-blink 1.1s steps(1) infinite;
}
@keyframes sx-blink { 50% { opacity: 0; } }

@media (max-width: 640px) {
  .sx-404 { padding: 40px 16px 72px; }
  .term-body { padding: 14px; font-size: 13px; }
  .hit { flex-wrap: wrap; gap: 0 8px; }
  .label { flex-basis: 100%; padding-left: 1.6em; }
}
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
}
</style>
