// 三个频道的定义与文案只在这里写一次：数据加载、首页终端、频道页、文章头都从这里取。
// 注意别放进 *.data.ts —— 那种文件在浏览器端只剩 data 一个导出。

export type Channel = 'trace' | 'dump' | 'escape'

export const CHANNELS: Channel[] = ['trace', 'dump', 'escape']

export const CHANNEL_META: Record<Channel, { desc: string; long: string }> = {
  trace: {
    desc: '工程与项目复盘',
    long: '从零到一搭系统时踩过的坑、架构重构时的权衡，以及那些没有写进官方文档的真实生产环境日志。',
  },
  dump: {
    desc: '硬核拆解与笔记',
    long: '把复杂框架、前沿论文或核心源码扒开揉碎，做一次高密度的脑内内存转储（Brain Dump）。',
  },
  escape: {
    desc: '沙箱之外的思考',
    long: '当我们关掉 IDE 之后，关于 AI 时代、产品意义、技术虚无与个体价值的一些主观大实话。',
  },
}

/** 1 -> '001' */
export const pad = (n: number) => String(n).padStart(3, '0')
