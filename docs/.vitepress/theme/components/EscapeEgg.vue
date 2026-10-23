<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 首页彩蛋：按一下 Esc，整个窗口变成头像里那个虚线沙箱，光标从右上角的缺口逃出去。
// 手机没有 Esc 键，Home 里点头像或标语里的 Esc 键帽也会调 trigger()。

const running = ref(false)
const toast = ref(false)
const size = ref({ w: 0, h: 0 })
let timers: number[] = []

function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

function trigger() {
  if (running.value) return
  clearTimers()
  size.value = { w: window.innerWidth, h: window.innerHeight }
  running.value = true
  toast.value = true
  timers.push(window.setTimeout(() => (running.value = false), 1900))
  timers.push(window.setTimeout(() => (toast.value = false), 5200))
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  // 搜索框、手机菜单开着的时候，Esc 是在关它们，别抢
  if (document.querySelector('.VPLocalSearchBox, .VPNavScreen')) return
  const el = document.activeElement
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
  trigger()
}

// 捕获阶段监听：赶在搜索框自己的 Esc 处理（会把搜索框关掉）之前判断它是否开着
onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, true)
  clearTimers()
})

defineExpose({ trigger })

// 沙箱框：沿窗口内缩一圈的虚线，右上角留缺口（和头像一样，上边右段和右边上段是空的）
const INSET = 14
const framePath = () => {
  const { w, h } = size.value
  const r = w - INSET
  const b = h - INSET
  return `M${r} ${Math.round(h * 0.42)}V${b}H${INSET}V${INSET}H${Math.round(w * 0.58)}`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="running" class="sx-escape" aria-hidden="true">
      <svg class="frame" :viewBox="`0 0 ${size.w} ${size.h}`">
        <path :d="framePath()" />
      </svg>
      <span class="blk b1" />
      <span class="blk b2" />
      <span class="blk b3" />
    </div>

    <Transition name="sx-toast">
      <a v-if="toast" class="sx-toast" href="/escape/">
        <span class="key">Esc</span> 你逃出了沙箱 <span class="go">escape/ →</span>
      </a>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sx-escape {
  position: fixed; inset: 0; z-index: 200;
  pointer-events: none;
  animation: sx-veil 1.9s ease both;
}
.frame { position: absolute; inset: 0; width: 100%; height: 100%; }
.frame path {
  fill: none;
  stroke: var(--sx-green-2);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 18 26;
  animation: sx-frame 1.9s ease both;
}

/* 三格光标：从缺口内侧依次冲出右上角，越往外越大越亮 */
.blk {
  position: absolute; right: 9%; top: 34%;
  border-radius: 2px;
  transform: rotate(18deg);
  opacity: 0;
}
.b1 { width: 10px; height: 14px; background: var(--sx-green-4); animation: sx-fly 1.1s 0.3s cubic-bezier(0.3, 0, 0.2, 1) both; }
.b2 { width: 16px; height: 24px; background: var(--sx-green-3); animation: sx-fly 1.1s 0.45s cubic-bezier(0.3, 0, 0.2, 1) both; }
.b3 { width: 26px; height: 38px; background: var(--sx-green-1); animation: sx-fly 1.1s 0.6s cubic-bezier(0.3, 0, 0.2, 1) both; box-shadow: 0 0 24px var(--sx-glow); }

@keyframes sx-veil {
  0% { background: transparent; }
  15%, 70% { background: color-mix(in srgb, var(--vp-c-bg) 55%, transparent); }
  100% { background: transparent; }
}
@keyframes sx-frame {
  0% { opacity: 0; transform: scale(1.03); }
  18%, 70% { opacity: 1; transform: none; }
  100% { opacity: 0; }
}
@keyframes sx-fly {
  0% { opacity: 0; transform: translate(-40px, 40px) rotate(18deg) scale(0.6); }
  15%, 75% { opacity: 1; }
  100% { opacity: 0; transform: translate(min(40vw, 420px), max(-45vh, -420px)) rotate(18deg) scale(1.4); }
}

.sx-toast {
  position: fixed; left: 50%; bottom: 32px; z-index: 201;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.5);
  font-family: var(--vp-font-family-mono); font-size: 13px;
  color: var(--vp-c-text-1); text-decoration: none; white-space: nowrap;
}
.sx-toast:hover .go { text-decoration: underline; }
.key {
  padding: 0 6px; border-radius: 4px;
  border: 1px solid var(--vp-c-divider); border-bottom-width: 2px;
  font-size: 12px; color: var(--vp-c-text-2);
}
.go { color: var(--c-escape); font-weight: 600; }

.sx-toast-enter-active, .sx-toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.sx-toast-enter-from, .sx-toast-leave-to { opacity: 0; transform: translate(-50%, 8px); }

@media (prefers-reduced-motion: reduce) {
  .sx-escape { display: none; }
}
</style>
