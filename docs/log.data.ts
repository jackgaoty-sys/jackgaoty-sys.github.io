import { createContentLoader } from 'vitepress'
import { SERIES } from './.vitepress/series'
import type { Channel } from './.vitepress/theme/channels'

// 整站的日志流：trace / dump / escape 三个频道的文章合在一起，按发布日期统一编号。
// 编号不写在文件里 —— 第一篇是 #001，之后按 date 先后顺延。
// 所以 date 一旦定了就别再往前改，否则后面文章的编号都会跟着挪。

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
          no: 0,
          channel,
          title: fm.title ?? firstHeading(p.src) ?? p.url,
          url: p.url,
          date: normDate(fm.date),
          excerpt: fm.description ?? firstParagraph(p.src),
          series: series ? series.title : null,
        }
      })

    // 先按日期正序编号；没写日期的排最后
    entries.sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.url.localeCompare(b.url))
    entries.forEach((e, i) => (e.no = i + 1))

    // 输出按编号倒序，最新的在上面
    return entries.reverse()
  },
})

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
