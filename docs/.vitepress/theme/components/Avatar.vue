<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

// 头像的矢量版：虚线沙箱 + 提示符 + 从缺口逃出去的光标。
// animated 时光标会一格格逃出来，最后那格像终端光标一样闪。
// escape()：首页 Esc 彩蛋 —— 三格光标再逃一次、飞得更远，最大那格在框外闪两下再回来。
defineProps<{ animated?: boolean }>()

const escaping = ref(false)
// 逃过一次之后入场动画就别再挂着了：摘掉 escaping 时它会从头重播，光标会闪没再飞回来
const settled = ref(false)
let timer = 0

function escape() {
  settled.value = true
  // 先摘掉 class、隔两帧再加回去，连按时动画才会从头重播
  escaping.value = false
  clearTimeout(timer)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      escaping.value = true
      timer = window.setTimeout(() => (escaping.value = false), 1700)
    })
  )
}

onBeforeUnmount(() => clearTimeout(timer))
defineExpose({ escape })
</script>

<template>
  <svg class="sx-avatar" :class="{ animated, settled, escaping }" viewBox="160 150 720 720" role="img" aria-label="沙箱逃逸.log">
    <g class="box" fill="none" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
      <path d="M205 432V357H282M343 357H365M426 357H448" />
      <path d="M205 495V517M205 578V600M205 660V683" />
      <path d="M205 745V820H282M343 820H365M426 820H448M508 820H530" />
      <path d="M595 820H670V745M670 683V660M670 600V578" />
    </g>
    <path class="prompt" d="M288 530L360 590L288 650" fill="none" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
    <polygon class="b1" points="543,445 580,450 574,502 537,497" />
    <polygon class="b2" points="617,347 675,360 656,445 598,432" />
    <polygon class="b3" points="746,189 835,218 793,349 703,320" />
  </svg>
</template>

<style scoped>
.sx-avatar { display: block; overflow: visible; }
.box { stroke: var(--sx-green-2); }
.prompt { stroke: var(--sx-green-1); }
.b1 { fill: var(--sx-green-4); }
.b2 { fill: var(--sx-green-3); }
.b3 { fill: var(--sx-green-1); }

.animated .b1,
.animated .b2,
.animated .b3 {
  transform-box: fill-box;
  transform-origin: center;
}
.animated .prompt { animation: sx-fade 0.4s 0.1s both; }
.animated .b1 { animation: sx-escape 0.35s 0.45s both; }
.animated .b2 { animation: sx-escape 0.35s 0.65s both; }
.animated .b3 { animation: sx-escape 0.35s 0.85s both, sx-blink 1.1s 1.8s steps(1) infinite; }

@keyframes sx-fade { from { opacity: 0; } }
@keyframes sx-escape {
  from { opacity: 0; transform: translate(-60px, 60px) scale(0.5); }
}
@keyframes sx-blink {
  50% { opacity: 0; }
}

.settled .b1,
.settled .b2,
.settled .prompt { animation: none; }
.settled .b3 { animation: sx-blink 1.1s steps(1) infinite; }

/* ---- Esc：沿缺口方向（右上）再逃一次。单位是 SVG 画布单位，头像 132px 宽时 260 ≈ 48px ---- */
.escaping .b1 { animation: sx-break-1 1.5s cubic-bezier(0.3, 0, 0.2, 1) both; }
.escaping .b2 { animation: sx-break-2 1.5s 0.06s cubic-bezier(0.3, 0, 0.2, 1) both; }
.escaping .b3 { animation: sx-break-3 1.5s 0.12s cubic-bezier(0.3, 0, 0.2, 1) both; }

@keyframes sx-break-1 {
  30%, 70% { transform: translate(70px, -70px); }
}
@keyframes sx-break-2 {
  30%, 70% { transform: translate(150px, -150px); }
}
@keyframes sx-break-3 {
  30% { transform: translate(260px, -260px) rotate(8deg); opacity: 1; }
  40% { opacity: 0; }
  50% { opacity: 1; }
  60% { opacity: 0; }
  70% { transform: translate(260px, -260px) rotate(8deg); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .animated .prompt,
  .animated .b1,
  .animated .b2,
  .animated .b3,
  .escaping .b1,
  .escaping .b2,
  .escaping .b3 { animation: none; }
}
</style>
