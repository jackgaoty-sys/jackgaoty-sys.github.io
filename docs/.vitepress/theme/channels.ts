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
