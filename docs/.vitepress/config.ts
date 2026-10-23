import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERIES, VISIBLE_SERIES, mergeRoadmap } from './series'
import { ogHead } from './og'

const LF = String.fromCharCode(10)
const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SITE = '沙箱逃逸.log'
const DESC = '读源码、拆项目、记踩坑；偶尔按一下 Esc。TAT 的技术博客。'

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
      return { title: firstHeading(src, slug), link: '/' + dirRel + '/' + slug }
    })
}

// 每个系列的路线图侧边栏：已写的自动扫出来，接上还没写的占位项（合并逻辑在 series.ts）
const sidebarOf = (s: { dir: string; title: string; pending: string[] }) => [
  {
    text: s.title,
    items: [
      { text: '← dump/', link: '/dump/' },
      { text: '总览', link: '/' + s.dir + '/' },
    ],
  },
  {
    text: '路线图',
    items: mergeRoadmap(articlesIn(s.dir), s.pending).map((r) =>
      r.link ? { text: r.title, link: r.link } : { text: r.title }
    ),
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: SITE,
  description: DESC,

  cleanUrls: true,
  lastUpdated: true,

  // 不参与构建：没有网址、不进列表、搜索也搜不到。
  // drafts 是草稿，_templates 是 Obsidian 模板，hidden 的系列还没准备好见人。
  // 注意仓库是 public 的，这些内容在 GitHub 上仍然可见 —— 只是站点上没有。
  srcExclude: [
    'drafts/**',
    '**/drafts/**',
    '_templates/**',
    ...SERIES.filter((s) => s.hidden).map((s) => s.dir + '/**'),
  ],

  markdown: {
    // 单个回车即换行，和 Obsidian 的默认行为一致。
    // 前提是段落整段写在一行 —— 若把段落硬折成多行，每一折都会变成真换行。
    breaks: true,
  },

  // 默认深色（和头像同一个底色），右上角开关照常可用、会被记住
  appearance: 'dark',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/avatar.png' }],
    ['meta', { name: 'theme-color', content: '#0e1116' }],
    ['meta', { property: 'og:site_name', content: SITE }],
  ],

  // 每页的 og / twitter 信息和分享卡片图（构建时生成，见 og.ts）
  transformHead: ogHead,

  sitemap: { hostname: 'https://jackgaoty-sys.github.io' },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: SITE,

    nav: [
      { text: 'trace', link: '/trace/', activeMatch: '^/trace/' },
      { text: 'dump', link: '/dump/', activeMatch: '^/dump/' },
      { text: 'escape', link: '/escape/', activeMatch: '^/escape/' },
      { text: 'about', link: '/about' },
    ],

    // 只有系列有侧边栏（路线图）；trace / escape 的单篇文章居中阅读
    sidebar: Object.fromEntries(VISIBLE_SERIES.map((s) => ['/' + s.dir + '/', sidebarOf(s)])),

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
      message: '$ exit 0 · 仅代表个人当时的工程偏见，欢迎交流指正',
      copyright: '© 2026 TAT · 沙箱逃逸.log',
    },
  },
})
