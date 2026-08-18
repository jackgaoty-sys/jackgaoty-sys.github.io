import { createContentLoader } from 'vitepress'

// VitePress 的数据加载器：构建时扫描 docs/posts/*.md，
// 结果注入页面，所以新增文章不用手动维护列表。
export default createContentLoader('posts/*.md', {
  includeSrc: true,
  transform(raw) {
    return raw
      .filter((p) => p.url !== '/posts/') // 排掉索引页自己
      .map((p) => ({
        title: p.frontmatter.title ?? firstHeading(p.src) ?? p.url,
        url: p.url,
        date: p.frontmatter.date ?? null,
        summary: firstParagraph(p.src),
      }))
      // 有日期的按倒序排前面，没日期的按标题排在后面
      .sort((a, b) => {
        if (a.date && b.date) return b.date.localeCompare(a.date)
        if (a.date) return -1
        if (b.date) return 1
        return a.title.localeCompare(b.title, 'zh')
      })
  },
})

function firstHeading(src?: string): string | null {
  const m = src?.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

function firstParagraph(src?: string): string {
  if (!src) return ''
  const body = src
    .replace(/^---[\s\S]*?---/, '')  // frontmatter
    .replace(/^#.*$/gm, '')          // 标题行
    .replace(/^```[\s\S]*?```$/gm, '') // 代码块
    .trim()
  const first = body.split(/\n\s*\n/)[0]?.replace(/\s+/g, ' ').trim() ?? ''
  return first.length > 90 ? first.slice(0, 90) + '…' : first
}
