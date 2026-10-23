import { ref } from 'vue'

// escape/ 频道默认藏起来：首页终端的 ls、导航栏、首页日志流里都看不到。
// 按一下 Esc（或点头像 / 标语里的 Esc 键帽）解锁；直接访问 /escape/ 下的页面也算找到了，一并解锁。
//
// 解锁只存在内存里，不落盘：站内跳转（VitePress 是单页应用，不整页刷新）一直保持解锁，
// 刷新、新开标签页、下次再来都回到沙箱里 —— 「偶尔按一下 Esc」是每次都要按的。
//
// 显隐分两层：
// - <html> 上的 sx-unlocked class 管 CSS 层面的显隐（导航、终端那一行、头像姿势）。
// - 下面这个 ref 管要参与计算的地方（日志流的筛选和计数）。

const KEY = 'sx-escape'

export const unlocked = ref(false)

export function loadUnlocked() {
  // 早先的版本把解锁记在 localStorage / sessionStorage 里，清掉，让那些浏览器也回到沙箱
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
  } catch {}
  document.documentElement.classList.toggle('sx-unlocked', unlocked.value)
}

/** 返回 true 表示这一下是刚解锁（之前没解锁过） */
export function unlock(): boolean {
  if (unlocked.value) return false
  unlocked.value = true
  document.documentElement.classList.add('sx-unlocked')
  return true
}
