// 所有系列的唯一定义处。
// 导航、侧边栏、每个系列页里的路线图表格，全部从这里生成。
// 加系列由写作台按 @新系列-定义 锚点插入；pending 是「还没写」的条目，
// 写好同编号的文件后会自动消失（01-agent-loop.md 顶掉 '01 · Agent 主循环'）。

export interface SeriesDef {
  /** 相对 docs 的目录，例如 teardown/pi */
  dir: string
  title: string
  category: 'teardown' | 'learn'
  pending: string[]
}

export const SERIES: SeriesDef[] = [
  {
    dir: 'teardown/pi',
    title: '拆解 Pi Agent',
    category: 'teardown',
    pending: [
      '01 · Agent 主循环',
      '02 · 工具的定义与执行',
      '03 · 上下文管理与压缩',
      '04 · 多模型统一抽象',
      '05 · 系统提示词与 Skills',
      '06 · CLI 外壳怎么包',
    ],
  },
  {
    dir: 'learn/agentic-system-design',
    title: 'Agent系统设计',
    category: 'learn',
    pending: ['01 · 待定'],
  },
  {
    dir: 'teardown/transformer',
    title: 'Transformer',
    category: 'teardown',
    pending: ['01 · 待定'],
  },
  // @新系列-定义（写作台按此锚点插入，勿删）
]

/** 取开头连续数字，用来让已写文件顶掉同编号的 pending 条目 */
export function leadNum(s: string): string {
  if (!s) return ''
  let out = ''
  for (const c of s) {
    if (c >= '0' && c <= '9') out += c
    else break
  }
  return out
}

export interface RoadmapItem {
  title: string
  link?: string | null
  source?: string
  status?: string
}

/**
 * 合并「已写的文章」和「还没写的占位项」。
 * 占位项若已有同编号的文章就不再显示 —— 编号只认文件名（01-xxx.md），
 * 标题里写什么都不影响匹配。
 */
export function mergeRoadmap(written: RoadmapItem[], pending: string[]): RoadmapItem[] {
  const numOf = (it: RoadmapItem) => {
    const link = it.link || ''
    return leadNum(link.slice(link.lastIndexOf('/') + 1))
  }

  // 有编号的按编号排，没编号的排在后面并保持原有顺序
  const sorted = [...written].sort((a, b) => {
    const na = numOf(a)
    const nb = numOf(b)
    if (na && nb) return na.localeCompare(nb)
    if (na) return -1
    if (nb) return 1
    return 0
  })

  const doneNums = new Set(sorted.map(numOf).filter(Boolean))
  const rest = pending.filter((t) => {
    const n = leadNum(t)
    return !n || !doneNums.has(n)
  })

  return [...sorted, ...rest.map((title) => ({ title, link: null, source: '', status: '未开始' }))]
}

