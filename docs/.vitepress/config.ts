import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LF = String.fromCharCode(10)
const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function firstHeading(src: string, fallback: string) {
  for (const line of src.split(LF)) {
    if (line.startsWith('# ')) return line.slice(2).trim()
  }
  return fallback
}

// 取开头的连续数字，用来把「已写的文件」和「路线图占位项」对上号
function leadNum(s: string) {
  let out = ''
  for (const c of s) {
    if (c >= '0' && c <= '9') out += c
    else break
  }
  return out
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

// 系列的路线图 = 已写的文章（自动扫出来）+ 还没写的占位项。
// 占位项若已有同编号的文件，就不再重复显示。
function roadmap(dirRel: string, pending: string[]) {
  const written = articlesIn(dirRel)
  const doneNums = new Set(
    written.map((w) => leadNum(w.link.slice(w.link.lastIndexOf('/') + 1))).filter(Boolean)
  )
  const rest = pending.filter((t) => {
    const n = leadNum(t)
    return !n || !doneNums.has(n)
  })
  return [...written, ...rest.map((text) => ({ text }))]
}

function postSidebarItems() {
  return articlesIn('posts')
}

// 两个顶级分类：源码拆解读别人的代码，学习路线是系统学一门东西。
// 新系列在对应数组里加一行，写作台按 @新系列-* 锚点自动插入。
const teardowns = [
  { text: '拆解 Pi Agent', link: '/teardown/pi/' },
  // @新系列-导航-teardown（写作台按此锚点插入，勿删）
]

const learnings = [
  { text: 'Agent系统设计', link: '/learn/agentic-system-design/' },
  // @新系列-导航-learn（写作台按此锚点插入，勿删）
]

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
      { text: '技术笔记', link: '/learn/' },
      { text: '散篇', link: '/posts/' },
      { text: '关于', link: '/about' },
    ],

    // 按目录配侧边栏：每个系列一套，互不干扰。
    // 以后加系列 = 建目录 + 在这里加一段。
    // 按目录配侧边栏。VitePress 取最长匹配前缀，
    // 所以分类页用 '/teardown/'，进到具体系列里换成 '/teardown/pi/' 那套。
    sidebar: {
      '/teardown/': [
        {
          text: '源码拆解',
          items: [{ text: '全部', link: '/teardown/' }, ...teardowns],
        },
      ],

      '/teardown/pi/': [
        {
          text: '拆解 Pi Agent',
          items: [{ text: '总览 · 仓库地图与路线', link: '/teardown/pi/' }],
        },
        {
          text: '路线图',
          items: roadmap('teardown/pi', [
            '01 · Agent 主循环',
            '02 · 工具的定义与执行',
            '03 · 上下文管理与压缩',
            '04 · 多模型统一抽象',
            '05 · 系统提示词与 Skills',
            '06 · CLI 外壳怎么包',
          ]),
        },
      ],

      // @新系列-侧边栏-teardown（写作台按此锚点插入，勿删）

      '/learn/': [
        {
          text: '学习路线',
          items: [{ text: '全部', link: '/learn/' }, ...learnings],
        },
      ],

      '/learn/agentic-system-design/': [
        {
          text: 'Agent系统设计',
          items: [{ text: '总览', link: '/learn/agentic-system-design/' }],
        },
        {
          text: '路线图',
          items: roadmap('learn/agentic-system-design', ['01 · 待定']),
        },
      ],

      // @新系列-侧边栏-learn（写作台按此锚点插入，勿删）

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
