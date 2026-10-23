// 站点级开关。改这里就够了，config 和主题组件都从这里读。

/**
 * About 页正在重写，先下线：页面不参与构建（/about 是 404、搜索里也没有）。
 * 入口照常显示（导航栏、首页终端 whoami 后面的 cat about.md），但变灰、点不了；404 页的建议里不出现。
 * 写好了改成 true 即可全部恢复。
 */
export const ABOUT_ENABLED = false
