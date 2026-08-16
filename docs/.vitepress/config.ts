import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '高天杨',
  description: 'AI 应用与交付 · 源码拆解笔记',

  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '拆解 Pi Agent', link: '/pi/' },
    ],

    sidebar: {
      '/pi/': [
        {
          text: '拆解 Pi Agent',
          items: [
            { text: '总览 · 仓库地图与路线', link: '/pi/' },
          ],
        },
        {
          // 六级路线，一次只推进一级。写完一篇就给它补上 link。
          text: '学习路线',
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
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jackgaoty-sys' },
    ],

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdatedText: '最后更新',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '目录',

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
      message: '内容为个人学习笔记，源码版权归各自作者',
      copyright: '© 2026 高天杨',
    },
  },
})
