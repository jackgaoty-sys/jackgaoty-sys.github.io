import { ref } from 'vue'

// escape/ 频道默认藏起来：首页终端的 ls、导航栏、首页日志流里都看不到。
// 按一下 Esc（或点头像 / 标语里的 Esc 键帽）解锁；直接访问 /escape/ 下的页面也算找到了，一并解锁。
// 解锁只在本次浏览里有效（sessionStorage）：同一个标签页里换页、回首页都保持解锁，
// 关掉再来就又回到沙箱里 —— 「偶尔按一下 Esc」是每次都要按的，彩蛋对回头客也一直有效。
//
// 显隐分两层：
// - <html> 上的 sx-unlocked class 管 CSS 层面的显隐（导航、终端那一行、头像姿势）。
//   config.ts 的 head 里有一段脚本在首屏渲染前就把它加上，已解锁的访客不会先看到两个频道再闪成三个。
// - 下面这个 ref 管要参与计算的地方（日志流的筛选和计数）。

const KEY = 'sx-escape'

export const unlocked = ref(false)

export function loadUnlocked() {
  try {
    unlocked.value = sessionStorage.getItem(KEY) === '1'
    // 早先的版本把解锁永久记在 localStorage 里，清掉，让那些浏览器也回到沙箱
    localStorage.removeItem(KEY)
  } catch {}
  document.documentElement.classList.toggle('sx-unlocked', unlocked.value)
}

/** 返回 true 表示这一下是刚解锁（之前没解锁过） */
export function unlock(): boolean {
  if (unlocked.value) return false
  unlocked.value = true
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {}
  document.documentElement.classList.add('sx-unlocked')
  return true
}
