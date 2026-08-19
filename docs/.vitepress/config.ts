import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERIES, mergeRoadmap } from './series'

const LF = String.fromCharCode(10)
const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function firstHeading(src: string, fallback: string) {
  for (const line of src.split(LF)) {
    if (line.startsWith('# ')) return line.slice(2).trim()
  }
  return fallback
}

// 扫某个目录下真实存在的文章，按文件名排序
function articlesIn(dirRel: string) {
  const dir = path.resolve(docsDir, dirRel)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .map((f) => {
      const slug = f.slice(0, -3)
      const src = fs.readFileSync(path.join(dir, f), 'utf-8')
      return { text: firstHeading(src, slug), link: '/' + dirRel + '/' + slug }
    })
}

// 系列的路线图：已写的文章（扫目录）+ 还没写的占位项，合并逻辑在 series.ts
function roadmap(dirRel: string, pending: string[]) {
  // 侧边栏用 { text, link }，合并逻辑用 { title, link }，两端转一下
  const written = articlesIn(dirRel).map((a) => ({ title: a.text, link: a.link }))
  return mergeRoadmap(written, pending).map((r) =>
    r.link ? { text: r.title, link: r.link } : { text: r.title }
  )
}

function postSidebarItems() {
  return articlesIn('posts')
}

// 导航与侧边栏都从 series.ts 生成，那里是系列的唯一定义处。
const navOf = (category: string) =>
  SERIES.filter((x) => x.category === category).map((x) => ({ text: x.title, link: '/' + x.dir + '/' }))

// 每个系列的路线图侧边栏：已写的自动扫出来，接上还没写的占位项
const sidebarOf = (s: { dir: string; title: string; pending: string[] }) => [
  {
    text: s.title,
    items: [{ text: '总览', link: '/' + s.dir + '/' }],
  },
  {
    text: '路线图',
    items: roadmap(s.dir, s.pending),
  },
]

const seriesSidebars = Object.fromEntries(SERIES.map((s) => ['/' + s.dir + '/', sidebarOf(s)]))

export default defineConfig({
  lang: 'zh-CN',
  title: 'TAT 的技术笔记',
  description: '读源码、拆项目、记踩坑 · AI 应用与交付方向',

  cleanUrls: true,
  lastUpdated: true,

  // 草稿不参与构建：没有网址、不进导航与列表、搜索也搜不到。
  // 注意仓库是 public 的，草稿内容在 GitHub 上仍然可见 —— 只是站点上没有。
  srcExclude: ['drafts/**', '**/drafts/**'],

  markdown: {
    // 单个回车即换行，符合直觉。
    // 前提是段落整段写在一行 —— 若把段落硬折成多行，每一折都会变成真换行。
    // 代码块不受影响：围栏内的换行本来就原样保留。
    breaks: true,
  },

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
      { text: '源码拆解', link: '/teardown/' },
      { text: '从零实现', link: '/learn/' },
      { text: '散篇', link: '/posts/' },
      { text: '关于', link: '/about' },
    ],

    // 按目录配侧边栏：每个系列一套，互不干扰。
    // 以后加系列 = 建目录 + 在这里加一段。
    // 按目录配侧边栏。VitePress 取最长匹配前缀，
    // 所以分类页用 '/teardown/'，进到具体系列里换成 '/teardown/pi/' 那套。
    // 分类页固定；每个系列自己的路线图侧边栏由 series.ts 生成。
    // VitePress 取最长匹配前缀，所以进到具体系列会用 seriesSidebars 那套。
    sidebar: {
      '/teardown/': [
        {
          text: '源码拆解',
          items: [{ text: '全部', link: '/teardown/' }, ...navOf('teardown')],
        },
      ],

      '/learn/': [
        {
          text: '从零实现',
          items: [{ text: '全部', link: '/learn/' }, ...navOf('learn')],
        },
      ],

      ...seriesSidebars,

      '/posts/': [
        {
          text: '散篇',
          items: [{ text: '全部', link: '/posts/' }, ...postSidebarItems()],
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
