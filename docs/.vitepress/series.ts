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
  // @新系列-定义（写作台按此锚点插入，勿删）
]

/** 取开头连续数字，用来让已写文件顶掉同编号的 pending 条目 */
export function leadNum(s: string): string {
  let out = ''
  for (const c of s) {
    if (c >= '0' && c <= '9') out += c
    else break
  }
  return out
}
