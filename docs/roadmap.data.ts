import { createContentLoader } from 'vitepress'
import { SERIES, leadNum } from './.vitepress/series'

export interface RoadmapRow {
  title: string
  /** 已写的才有链接 */
  link: string | null
  /** 文章 frontmatter 里的 source，可留空 */
  source: string
  /** 未开始 / 进行中 / 完成 */
  status: string
}

// 扫所有系列目录下的文章，和 series.ts 里的 pending 合并成每个系列的路线图。
export default createContentLoader(['teardown/*/*.md', 'learn/*/*.md'], {
  includeSrc: true,
  transform(raw): Record<string, RoadmapRow[]> {
    const written: Record<string, (RoadmapRow & { slug: string })[]> = {}

    for (const page of raw) {
      // url 形如 /teardown/pi/01-agent-loop；总览页是 /teardown/pi/，段数不足，跳过
      const parts = page.url.split('/').filter(Boolean)
      if (parts.length < 3) continue
      const dir = parts[0] + '/' + parts[1]
      const slug = parts[2]
      const fm = page.frontmatter || {}
      ;(written[dir] ||= []).push({
        title: fm.title || headingOf(page.src) || slug,
        link: page.url,
        source: fm.source || '',
        status: fm.status || '进行中',
        slug,
      })
    }

    const out: Record<string, RoadmapRow[]> = {}
    for (const s of SERIES) {
      const done = (written[s.dir] || []).sort((a, b) => a.slug.localeCompare(b.slug))
      const doneNums = new Set(done.map((d) => leadNum(d.slug)).filter(Boolean))
      const rest = s.pending.filter((t) => {
        const n = leadNum(t)
        return !n || !doneNums.has(n)
      })
      out[s.dir] = [
        ...done.map(({ slug, ...row }) => row),
        ...rest.map((title) => ({ title, link: null, source: '', status: '未开始' })),
      ]
    }
    return out
  },
})

function headingOf(src?: string): string | null {
  if (!src) return null
  for (const line of src.split(String.fromCharCode(10))) {
    if (line.startsWith('# ')) return line.slice(2).trim()
  }
  return null
}
