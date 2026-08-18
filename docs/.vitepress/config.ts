import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'TAT 的技术笔记',
  description: '读源码、拆项目、记踩坑 · AI 应用与交付方向',

  cleanUrls: true,
  lastUpdated: true,

  // 每次访问默认深色，但右上角开关保留可用。
  // 'dark' 只在「没存过偏好」时生效，所以配合下面 head 里的清除脚本：
  // 每次加载先抹掉存的偏好，VitePress 就会重新落回深色默认。
  appearance: 'dark',

  head: [
    // 必须在 VitePress 自己的主题脚本之前跑，否则这次加载已经按旧偏好渲染完了
    ['script', {}, "try{localStorage.removeItem('vitepress-theme-appearance')}catch(e){}"],
  ],

  themeConfig: {
    siteTitle: 'TAT 的技术笔记',

    nav: [
      { text: '首页', link: '/' },
      { text: '拆解 Pi Agent', link: '/pi/' },
      { text: '散篇', link: '/posts/' },
      { text: '关于', link: '/about' },
    ],

    // 按目录配侧边栏：每个系列一套，互不干扰。
    // 以后加系列 = 建目录 + 在这里加一段。
    sidebar: {
      '/pi/': [
        {
          text: '拆解 Pi Agent',
          items: [{ text: '总览 · 仓库地图与路线', link: '/pi/' }],
        },
        {
          text: '学习路线',
          // 写完一篇，给对应那项补上 link
          items: [
            { text: '01 · Agent 主循环' },
            { text: '02 · 工具的定义与执行' },
            { text: '03 · 上下文管理与压缩' },
            { text: '04 · 多模型统一抽象' },
            { text: '05 · 系统提示词与 Skills' },
            { text: '06 · CLI 外壳怎么包' },
          ],
        },
      ],

      '/posts/': [
        {
          text: '散篇',
          // 每写一篇，在这里加一项
          items: [{ text: '全部', link: '/posts/' }],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/jackgaoty-sys' }],

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdatedText: '最后更新',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '目录',
    externalLinkIcon: true,

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    footer: {
      message: '内容为个人学习笔记，引用的源码版权归各自作者',
      copyright: '© 2026 TAT',
    },
  },
})
