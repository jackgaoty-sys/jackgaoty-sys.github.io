// 从文章原文的 frontmatter 里读 no。log.data.ts（日志流）和 og.ts（分享卡片）共用。
// 不走 YAML 解析：YAML 会把 no: 010 当成八进制的 8。
// 返回 NaN 表示没写或写得不对。
export function readNo(src?: string): number {
  const fm = src?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const m = fm.match(/^no:[ \t]*['"]?(\d+)['"]?[ \t]*(#.*)?$/m)
  const n = m ? parseInt(m[1], 10) : NaN
  return n > 0 ? n : NaN
}
