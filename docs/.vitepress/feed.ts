import fs from 'node:fs'
import path from 'node:path'
import { createContentLoader, type SiteConfig } from 'vitepress'
import { SERIES } from './series'
import { readNo } from './lognum'
import { SITE_URL } from './og'

// RSS：构建结束后写出 /feed.xml。条目和首页日志流同一套规则（三个频道、去掉总览页和隐藏系列），
// 按编号倒序，正文放全文 —— 阅读器里能直接读完，不用跳回站点。

const hiddenDirs = SERIES.filter((s) => s.hidden).map((s) => '/' + s.dir + '/')

export async function buildFeed(config: SiteConfig) {
  const pages = await createContentLoader(['trace/**/*.md', 'dump/**/*.md', 'escape/**/*.md'], {
    includeSrc: true,
    render: true,
  }).load()

  const items = pages
    .filter((p) => !p.url.endsWith('/') && !hiddenDirs.some((d) => p.url.startsWith(d)))
    .map((p) => {
      const fm = p.frontmatter || {}
      const d = fm.date
      return {
        no: readNo(p.src),
        channel: p.url.split('/')[1],
        title: fm.title ?? p.src?.match(/^#\s+(.+)$/m)?.[1].trim() ?? p.url,
        url: SITE_URL + p.url,
        date: d instanceof Date ? d : d ? new Date(String(d) + 'T00:00:00+08:00') : null,
        description: fm.description ?? '',
        // 站内链接、图片改成绝对地址，阅读器里才点得开
        html: (p.html ?? '').replace(/(href|src)="\/(?!\/)/g, `$1="${SITE_URL}/`),
      }
    })
    .sort((a, b) => b.no - a.no)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${esc(config.site.title)}</title>
  <link>${SITE_URL}/</link>
  <description>${esc(config.site.description)}</description>
  <language>zh-CN</language>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items
  .map(
    (it) => `  <item>
    <title>${esc(`${it.channel} #${String(it.no).padStart(3, '0')} | ${it.title}`)}</title>
    <link>${it.url}</link>
    <guid isPermaLink="true">${it.url}</guid>
    <category>${it.channel}</category>${it.date ? `\n    <pubDate>${it.date.toUTCString()}</pubDate>` : ''}
    <description>${cdata(it.description)}</description>
    <content:encoded>${cdata(it.html)}</content:encoded>
  </item>`
  )
  .join('\n')}
</channel>
</rss>
`
  await fs.promises.writeFile(path.join(config.outDir, 'feed.xml'), xml)
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
