import { createContentLoader } from 'vitepress'
import { SERIES } from './.vitepress/series'
import type { Channel } from './.vitepress/theme/channels'

// 整站的日志流：trace / dump / escape 三个频道的文章合在一起，共用一套编号。
// 编号在发布时写进 frontmatter 的 no，之后永不改动 —— 像数据库自增主键：
// 删掉的文章编号就空着，不复用，也不会让后面的编号挪位。
// 构建时检查：缺 no、no 不是正整数、两篇撞号，都直接让构建失败，错的编号上不了线。

export interface LogEntry {
  /** 全站编号，#001 起 */
  no: number
  channel: Channel
  title: string
  url: string
  date: string | null
  excerpt: string
  /** 属于哪个系列（dump 下才有） */
  series: string | null
}

const hiddenDirs = SERIES.filter((s) => s.hidden).map((s) => '/' + s.dir + '/')

export default createContentLoader(['trace/**/*.md', 'dump/**/*.md', 'escape/**/*.md'], {
  includeSrc: true,
  transform(raw): LogEntry[] {
    const entries = raw
      .filter((p) => !p.url.endsWith('/')) // 频道页、系列总览页不算文章
      .filter((p) => !hiddenDirs.some((d) => p.url.startsWith(d)))
      .map((p) => {
        const fm = p.frontmatter || {}
        const channel = p.url.split('/')[1] as Channel
        const series = SERIES.find((s) => p.url.startsWith('/' + s.dir + '/'))
        return {
          no: readNo(p.src),
          channel,
          title: fm.title ?? firstHeading(p.src) ?? p.url,
          url: p.url,
          date: normDate(fm.date),
          excerpt: fm.description ?? firstParagraph(p.src),
          series: series ? series.title : null,
        }
      })

    checkNumbers(entries)

    // 按编号倒序，最新的在上面
    return entries.sort((a, b) => b.no - a.no)
  },
})

// 直接从原文读 no，不走 YAML 解析：YAML 会把 no: 010 当成八进制的 8。
// 返回 NaN 表示没写或写得不对，交给 checkNumbers 统一报错。
function readNo(src?: string): number {
  const fm = src?.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const m = fm.match(/^no:[ \t]*['"]?(\d+)['"]?[ \t]*(#.*)?$/m)
  const n = m ? parseInt(m[1], 10) : NaN
  return n > 0 ? n : NaN
}

function checkNumbers(entries: LogEntry[]) {
  const problems: string[] = []
  const byNo = new Map<number, string[]>()

  for (const e of entries) {
    if (Number.isNaN(e.no)) problems.push(`缺少编号：${e.url}.md 的 frontmatter 里没有写 no（或不是正整数）`)
    else byNo.set(e.no, [...(byNo.get(e.no) ?? []), e.url])
  }
  for (const [no, urls] of byNo) {
    if (urls.length > 1) problems.push(`编号重复：#${no} 同时被 ${urls.map((u) => u + '.md').join('、')} 使用`)
  }

  if (problems.length) {
    const next = Math.max(0, ...byNo.keys()) + 1
    throw new Error(
      ['文章编号检查没通过：', ...problems.map((p) => '  - ' + p), `下一个可用编号是 ${next}（写成 no: ${next}）`].join('\n')
    )
  }
}

// YAML 会把不带引号的 2026-08-18 解析成 Date，这里统一成字符串
function normDate(d: unknown): string | null {
  if (!d) return null
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d).slice(0, 10)
}

function firstHeading(src?: string): string | null {
  const m = src?.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

function firstParagraph(src?: string): string {
  if (!src) return ''
  const body = src
    .replace(/^---[\s\S]*?---/, '') // frontmatter
    .replace(/^```[\s\S]*?^```$/gm, '') // 代码块
    .replace(/^(#|>|\||-|\*|!\[).*$/gm, '') // 标题、引用、表格、列表、图片
    .trim()
  const first = body.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ?? ''
  return first.length > 90 ? first.slice(0, 90) + '…' : first
}
