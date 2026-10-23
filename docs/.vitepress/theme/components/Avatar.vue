<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 头像的矢量版，跟着 escape/ 的解锁状态（<html class="sx-unlocked">，见 theme/escape.ts）有两个样子：
// - 没解锁：完整的沙箱，光标关在里面，跟在提示符后面闪。
// - 解锁了：右上角的缺口打开，光标从缺口逃出去 —— 就是 logo 原图的样子，和导航栏的小 logo 一致。
//
// breakOut()：解锁的那一下，缺口打开、光标沿缺口冲出去，后面拖出两格残影。
// poke()：已经逃出去了再按，框外那格快闪几下回应一下。
defineProps<{ animated?: boolean }>()

// 入场动画播完就摘掉（只留光标闪烁），否则之后摘掉 breaking / poking 时入场动画会从头重播
const settled = ref(false)
const breaking = ref(false)
const poking = ref(false)
const timers: number[] = []

onMounted(() => timers.push(window.setTimeout(() => (settled.value = true), 2000)))
onBeforeUnmount(() => timers.forEach((t) => clearTimeout(t)))

// 和解锁（给 <html> 加 class）放在同一帧生效，冲出去的动画才是从框里开始，不会先闪到框外
function breakOut() {
  settled.value = true
  breaking.value = true
  timers.push(window.setTimeout(() => (breaking.value = false), 1400))
}

// 先摘掉 class、隔两帧再加回去，连按时动画才会从头重播
function poke() {
  settled.value = true
  poking.value = false
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      poking.value = true
      timers.push(window.setTimeout(() => (poking.value = false), 700))
    })
  )
}

defineExpose({ breakOut, poke })
</script>

<template>
  <svg
    class="sx-avatar"
    :class="{ animated, settled, breaking, poking }"
    viewBox="160 150 720 720"
    role="img"
    aria-label="沙箱逃逸.log"
  >
    <g class="box" fill="none" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
      <path d="M205 432V357H282M343 357H365M426 357H448" />
      <path d="M205 495V517M205 578V600M205 660V683" />
      <path d="M205 745V820H282M343 820H365M426 820H448M508 820H530" />
      <path d="M595 820H670V745M670 683V660M670 600V578" />
      <!-- 右上角那段：没解锁时补上，沙箱是封闭的；解锁时被冲开 -->
      <path class="gap" d="M508 357H530M595 357H670V432M670 495V517" />
    </g>
    <path class="prompt" d="M288 530L360 590L288 650" fill="none" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
    <polygon class="b1" points="543,445 580,450 574,502 537,497" />
    <polygon class="b2" points="617,347 675,360 656,445 598,432" />
    <polygon class="b3" points="746,189 835,218 793,349 703,320" />
  </svg>
</template>

<!--
  整块不加 scoped：解锁状态挂在 <html> 上，scoped 写不了（Vue 的 :global(a) b 会把 b 整个丢掉）。
  规则的先后顺序就是优先级：姿势 → 入场 → 播完 → 冲出去 → 快闪。:where() 让 html 那层不额外加权。
-->
<style>
.sx-avatar { display: block; overflow: visible; }
.sx-avatar .box { stroke: var(--sx-green-2); }
.sx-avatar .prompt { stroke: var(--sx-green-1); }
.sx-avatar .b1 { fill: var(--sx-green-4); }
.sx-avatar .b2 { fill: var(--sx-green-3); }
.sx-avatar .b3 { fill: var(--sx-green-1); }

.sx-avatar .gap,
.sx-avatar .b1,
.sx-avatar .b2,
.sx-avatar .b3 {
  transform-box: fill-box;
  transform-origin: center;
}

/* ---- 姿势 ----
   没解锁：缺口补上；残影两格不出现；光标摆正、缩小，挪到提示符后面（单位是 SVG 画布单位） */
.sx-avatar .b1,
.sx-avatar .b2 { opacity: 0; }
.sx-avatar .b3 { transform: translate(-327px, 321px) rotate(-18deg) scale(0.7); }
.sx-avatar .gap { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(0.3, 0, 0.2, 1); }

/* 解锁了：缺口被冲开，三格回到 logo 原图的位置 */
:where(html.sx-unlocked) .sx-avatar .gap { opacity: 0; transform: translate(40px, -40px); }
:where(html.sx-unlocked) .sx-avatar .b1,
:where(html.sx-unlocked) .sx-avatar .b2 { opacity: 1; }
:where(html.sx-unlocked) .sx-avatar .b3 { transform: none; }

/* ---- 入场 ---- 没解锁：提示符和光标亮起来；解锁了：三格从框里一格格冒出去 */
.sx-avatar.animated .prompt { animation: sx-av-fade 0.4s 0.1s both; }
.sx-avatar.animated .b3 { animation: sx-av-fade 0.3s 0.5s both, sx-av-blink 1.1s 1.2s steps(1) infinite; }
:where(html.sx-unlocked) .sx-avatar.animated .b1 { animation: sx-av-pop 0.35s 0.45s both; }
:where(html.sx-unlocked) .sx-avatar.animated .b2 { animation: sx-av-pop 0.35s 0.65s both; }
:where(html.sx-unlocked) .sx-avatar.animated .b3 {
  animation: sx-av-pop 0.35s 0.85s both, sx-av-blink 1.1s 1.8s steps(1) infinite;
}

/* ---- 播完 ---- */
.sx-avatar.settled .prompt,
.sx-avatar.settled .b1,
.sx-avatar.settled .b2 { animation: none; }
.sx-avatar.settled .b3 { animation: sx-av-blink 1.1s steps(1) infinite; }

/* ---- 解锁的那一下 ---- 光标从提示符后面沿直线穿过缺口冲出去，残影随后拖出来 */
.sx-avatar.breaking .b3 {
  animation: sx-av-break 0.9s cubic-bezier(0.3, 0, 0.2, 1) both, sx-av-blink 1.1s 1.1s steps(1) infinite;
}
.sx-avatar.breaking .b2 { animation: sx-av-trail 0.45s 0.3s both; }
.sx-avatar.breaking .b1 { animation: sx-av-trail 0.45s 0.42s both; }

/* ---- 已经逃出去了再按 ---- */
.sx-avatar.poking .b3 { animation: sx-av-poke 0.6s steps(1) both; }

@keyframes sx-av-fade { from { opacity: 0; } }
@keyframes sx-av-blink { 50% { opacity: 0; } }
@keyframes sx-av-pop { from { opacity: 0; transform: translate(-60px, 60px) scale(0.5); } }
@keyframes sx-av-break {
  from { transform: translate(-327px, 321px) rotate(-18deg) scale(0.7); }
  65% { transform: translate(36px, -36px) rotate(4deg) scale(1.06); }
}
@keyframes sx-av-trail { from { opacity: 0; transform: translate(-90px, 90px) scale(0.5); } }
@keyframes sx-av-poke {
  0%, 40%, 80% { opacity: 0; }
  20%, 60%, 100% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .sx-avatar .gap,
  .sx-avatar .prompt,
  .sx-avatar .b1,
  .sx-avatar .b2,
  .sx-avatar .b3 { animation: none !important; transition: none !important; }
}
</style>
