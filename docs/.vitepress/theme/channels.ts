// 三个频道的定义与文案只在这里写一次：数据加载、首页终端、频道页、文章头都从这里取。
// 注意别放进 *.data.ts —— 那种文件在浏览器端只剩 data 一个导出。

export type Channel = 'trace' | 'dump' | 'escape'

export const CHANNELS: Channel[] = ['trace', 'dump', 'escape']

export const CHANNEL_META: Record<Channel, { desc: string; long: string }> = {
  trace: {
    desc: '踩坑实录与项目复盘',
    long: '实打实的工程与项目复盘：做了什么、哪里翻了车、删掉了哪些花架子。',
  },
  dump: {
    desc: '源码拆解与技术笔记',
    long: '高密度的源码拆解与技术笔记。成体系的内容收在系列里，按路线图一篇篇推进。',
  },
  escape: {
    desc: '关掉 IDE 后的胡思乱想',
    long: '从具体的代码逻辑里退出来喘口气，聊聊行业、产品和人。',
  },
}

/** 1 -> '001' */
export const pad = (n: number) => String(n).padStart(3, '0')

// 笔记成熟度，写在 frontmatter 的 stage 里，像日志级别一样挂在文章头和列表上。
// 不写就不显示。允许发半成品 —— draft 也可以先上线，之后慢慢改成 wip、stable。
export type Stage = 'draft' | 'wip' | 'stable'

export const STAGE_META: Record<Stage, string> = {
  draft: '草稿：想法刚落地，结论可能会变',
  wip: '进行中：主体写完了，还在补充和修订',
  stable: '定稿：反复推敲过，可以放心引用',
}

export function readStage(v: unknown): Stage | null {
  return v === 'draft' || v === 'wip' || v === 'stable' ? v : null
}
